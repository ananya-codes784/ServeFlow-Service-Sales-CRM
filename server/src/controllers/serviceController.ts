import { Request, Response } from 'express';
import { ServiceTicketModel } from '../models/ServiceTicket';
import { ServiceStatus } from '../shared';

export const getServiceTickets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', technicianId = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ serviceNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;
    if (technicianId) query.technicianId = technicianId;
    const total = await ServiceTicketModel.countDocuments(query);
    const tickets = await ServiceTicketModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ scheduledDate: 1 });
    return res.json({ success: true, data: tickets, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch service tickets.', error: err.message });
  }
};

export const getServiceTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await ServiceTicketModel.findById(req.params.id).populate('customerId', 'companyName contactPerson phone').populate('technicianId', 'name phone').populate('complaintId', 'ticketNumber subject');
    if (!ticket) return res.status(404).json({ success: false, message: 'Service ticket not found.' });
    return res.json({ success: true, data: ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch service ticket.', error: err.message });
  }
};

export const createServiceTicket = async (req: Request, res: Response) => {
  try {
    const count = await ServiceTicketModel.countDocuments();
    const serviceNumber = `SRV-${String(8800 + count + 1)}`;
    const ticket = await ServiceTicketModel.create({ ...req.body, serviceNumber });
    return res.status(201).json({ success: true, message: 'Service ticket created successfully.', data: ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create service ticket.', error: err.message });
  }
};

export const updateServiceTicket = async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (req.body.status === ServiceStatus.COMPLETED) updateData.completedAt = new Date();
    const ticket = await ServiceTicketModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Service ticket not found.' });
    return res.json({ success: true, message: 'Service ticket updated.', data: ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update service ticket.', error: err.message });
  }
};

export const deleteServiceTicket = async (req: Request, res: Response) => {
  try {
    await ServiceTicketModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Service ticket deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete service ticket.', error: err.message });
  }
};
