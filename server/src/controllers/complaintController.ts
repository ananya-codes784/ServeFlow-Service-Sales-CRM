import { Request, Response } from 'express';
import { ComplaintModel } from '../models/Complaint';
import { ComplaintStatus, Priority, ServiceStatus } from '../shared';
import { AuthRequest } from '../middlewares/auth';
import { createNotificationHelper } from './notificationController';
import { ServiceTicketModel } from '../models/ServiceTicket';
import { CustomerModel } from '../models/Customer';

const generateTicketNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await ComplaintModel.countDocuments();
  return `TKT-${year}-${String(count + 1).padStart(3, '0')}`;
};

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', priority = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ ticketNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;
    if (priority) query.priority = priority;
    const total = await ComplaintModel.countDocuments(query);
    const complaints = await ComplaintModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 });
    return res.json({ success: true, data: complaints, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints.', error: err.message });
  }
};

export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id).populate('customerId', 'companyName contactPerson phone email').populate('assignedTechnicianId', 'name email phone');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    return res.json({ success: true, data: complaint });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaint.', error: err.message });
  }
};

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const ticketNumber = await generateTicketNumber();
    const complaint = await ComplaintModel.create({
      ...req.body,
      ticketNumber,
      timeline: [{
        status: ComplaintStatus.NEW,
        comment: 'Complaint registered.',
        updatedBy: req.user?.name || 'System',
        timestamp: new Date(),
      }],
    });

    // Trigger Notification
    await createNotificationHelper({
      title: 'New Service Ticket Raised',
      message: `Ticket ${complaint.ticketNumber} registered for ${complaint.customerName || 'Customer'}: ${complaint.subject}`,
      type: complaint.priority === Priority.URGENT || complaint.priority === Priority.HIGH ? 'WARNING' : 'INFO',
      link: '/complaints',
    });

    return res.status(201).json({ success: true, message: 'Complaint created successfully.', data: complaint });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create complaint.', error: err.message });
  }
};

export const updateComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await ComplaintModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    const updateData = { ...req.body };

    if (req.body.status && req.body.status !== existing.status) {
      const timelineEntry = {
        status: req.body.status,
        comment: req.body.statusComment || `Status changed to ${req.body.status}.`,
        updatedBy: req.user?.name || 'System',
        timestamp: new Date(),
      };
      updateData.timeline = [...existing.timeline, timelineEntry];
      if (req.body.status === ComplaintStatus.CLOSED || req.body.status === ComplaintStatus.RESOLVED) {
        updateData.closedAt = new Date();
      }
    }

    const complaint = await ComplaintModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.json({ success: true, message: 'Complaint updated successfully.', data: complaint });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint.', error: err.message });
  }
};

export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    await ComplaintModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Complaint deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete complaint.', error: err.message });
  }
};

export const getComplaintStats = async (_req: Request, res: Response) => {
  try {
    const total = await ComplaintModel.countDocuments();
    const newC = await ComplaintModel.countDocuments({ status: ComplaintStatus.NEW });
    const inProgress = await ComplaintModel.countDocuments({ status: ComplaintStatus.IN_PROGRESS });
    const resolved = await ComplaintModel.countDocuments({ status: ComplaintStatus.RESOLVED });
    const closed = await ComplaintModel.countDocuments({ status: ComplaintStatus.CLOSED });
    return res.json({ success: true, data: { total, new: newC, inProgress, resolved, closed } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaint stats.', error: err.message });
  }
};

export const allocateComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { assignedTechnicianId, assignedTechnicianName, scheduledDate, notes, priority } = req.body;

    if (!assignedTechnicianId || !assignedTechnicianName) {
      return res.status(400).json({ success: false, message: 'Technician ID and Technician Name are required.' });
    }

    const complaint = await ComplaintModel.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    complaint.assignedTechnicianId = assignedTechnicianId;
    complaint.assignedTechnicianName = assignedTechnicianName;
    complaint.status = ComplaintStatus.IN_PROGRESS;
    if (priority) complaint.priority = priority;

    const scheduledTimeStr = scheduledDate ? new Date(scheduledDate).toLocaleString() : 'ASAP';

    complaint.timeline.push({
      status: ComplaintStatus.IN_PROGRESS,
      comment: `Assigned to technician ${assignedTechnicianName}. Scheduled for ${scheduledTimeStr}. ${notes ? `Notes: ${notes}` : ''}`,
      updatedBy: req.user?.name || 'System Admin',
      timestamp: new Date(),
    });

    await complaint.save();

    // Check or create linked Service Ticket for Field Technician Call Dispatch
    const existingTicket = await ServiceTicketModel.findOne({ complaintId: complaint._id });
    if (!existingTicket) {
      const cust = await CustomerModel.findById(complaint.customerId);
      const serviceCount = await ServiceTicketModel.countDocuments();
      const serviceNumber = `SRV-${new Date().getFullYear()}-${String(serviceCount + 1).padStart(3, '0')}`;

      await ServiceTicketModel.create({
        serviceNumber,
        complaintId: complaint._id,
        customerId: complaint.customerId,
        customerName: complaint.customerName,
        address: cust?.address || 'Customer Location',
        technicianId: assignedTechnicianId,
        technicianName: assignedTechnicianName,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        serviceType: 'BREAKDOWN',
        status: ServiceStatus.SCHEDULED,
        checklist: [
          { task: 'Inspect customer product & serial number', isDone: false },
          { task: 'Diagnose issue & record spares required', isDone: false },
          { task: 'Perform repair/servicing', isDone: false },
          { task: 'Obtain customer digital signature', isDone: false },
        ],
        visitNotes: notes || `Complaint ${complaint.ticketNumber}: ${complaint.subject}`,
      });
    } else {
      existingTicket.technicianId = assignedTechnicianId;
      existingTicket.technicianName = assignedTechnicianName;
      if (scheduledDate) existingTicket.scheduledDate = new Date(scheduledDate);
      if (notes) existingTicket.visitNotes = notes;
      await existingTicket.save();
    }

    // Trigger Notification for Technician
    await createNotificationHelper({
      title: 'New Service Call Allocated',
      message: `You have been allocated ticket ${complaint.ticketNumber} for ${complaint.customerName}`,
      type: 'INFO',
      link: '/technician/calls',
      userId: assignedTechnicianId,
    });

    return res.json({
      success: true,
      message: `Complaint ${complaint.ticketNumber} allocated to technician ${assignedTechnicianName} successfully.`,
      data: complaint,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to allocate complaint.', error: err.message });
  }
};

