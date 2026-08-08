import { Request, Response } from 'express';
import { AMCContractModel } from '../models/AMCContract';
import { AMCStatus, ServiceStatus } from '../shared';
import { createNotificationHelper } from './notificationController';
import { ServiceTicketModel } from '../models/ServiceTicket';

export const getAMCContracts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ contractNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;
    const total = await AMCContractModel.countDocuments(query);
    const contracts = await AMCContractModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ endDate: 1 });
    return res.json({ success: true, data: contracts, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AMC contracts.', error: err.message });
  }
};

export const getAMCContractById = async (req: Request, res: Response) => {
  try {
    const contract = await AMCContractModel.findById(req.params.id).populate('customerId', 'companyName contactPerson phone email');
    if (!contract) return res.status(404).json({ success: false, message: 'AMC contract not found.' });
    return res.json({ success: true, data: contract });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AMC contract.', error: err.message });
  }
};

export const createAMCContract = async (req: Request, res: Response) => {
  try {
    const count = await AMCContractModel.countDocuments();
    const contractNumber = `AMC-${new Date().getFullYear()}-${String(900 + count + 1)}`;
    const contract = await AMCContractModel.create({ ...req.body, contractNumber });
    return res.status(201).json({ success: true, message: 'AMC contract created successfully.', data: contract });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create AMC contract.', error: err.message });
  }
};

export const updateAMCContract = async (req: Request, res: Response) => {
  try {
    const contract = await AMCContractModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ success: false, message: 'AMC contract not found.' });
    return res.json({ success: true, message: 'AMC contract updated.', data: contract });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update AMC contract.', error: err.message });
  }
};

export const deleteAMCContract = async (req: Request, res: Response) => {
  try {
    await AMCContractModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'AMC contract deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete AMC contract.', error: err.message });
  }
};

export const getExpiringContracts = async (req: Request, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const contracts = await AMCContractModel.find({ status: AMCStatus.ACTIVE, endDate: { $lte: thirtyDaysFromNow } }).sort({ endDate: 1 });
    return res.json({ success: true, data: contracts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch expiring contracts.', error: err.message });
  }
};

export const getAMCDueServices = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const activeContracts = await AMCContractModel.find({ status: AMCStatus.ACTIVE });

    const dueList = activeContracts.map((contract) => {
      const totalVisits = contract.visitsPerYear || 4;
      const completed = contract.visitsCompleted || 0;
      const start = new Date(contract.startDate).getTime();
      const end = new Date(contract.endDate).getTime();
      const duration = end - start;
      const interval = duration / totalVisits;

      // Calculate next due visit date
      const nextVisitTime = start + (completed + 0.5) * interval;
      const nextDue = new Date(nextVisitTime);

      const daysUntilDue = Math.ceil((nextVisitTime - now.getTime()) / (1000 * 3600 * 24));
      const daysUntilExpiry = Math.ceil((end - now.getTime()) / (1000 * 3600 * 24));

      return {
        ...contract.toObject(),
        nextServiceDue: nextDue,
        daysUntilDue,
        daysUntilExpiry,
        isOverdue: daysUntilDue < 0 && completed < totalVisits,
        isExpiringSoon: daysUntilExpiry <= 30,
      };
    });

    return res.json({ success: true, data: dueList });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AMC service due schedule.', error: err.message });
  }
};

export const sendAMCRenewalReminder = async (req: Request, res: Response) => {
  try {
    const contract = await AMCContractModel.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'AMC contract not found.' });

    contract.lastReminderSent = new Date();
    await contract.save();

    await createNotificationHelper({
      title: 'AMC Contract Renewal Alert Sent',
      message: `Renewal reminder dispatched for ${contract.customerName} (${contract.contractNumber}). Expires on ${new Date(contract.endDate).toLocaleDateString()}.`,
      type: 'WARNING',
      link: '/amc',
    });

    return res.json({
      success: true,
      message: `Renewal reminder sent successfully to ${contract.customerName}.`,
      data: contract,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to send AMC renewal reminder.', error: err.message });
  }
};

export const recordAMCVisit = async (req: Request, res: Response) => {
  try {
    const contract = await AMCContractModel.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'AMC contract not found.' });

    contract.visitsCompleted = (contract.visitsCompleted || 0) + 1;
    if (contract.visitsCompleted >= contract.visitsPerYear) {
      contract.status = AMCStatus.EXPIRED;
    }
    await contract.save();

    // Create linked preventive service ticket
    const count = await ServiceTicketModel.countDocuments();
    const serviceNumber = `SRV-AMC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    await ServiceTicketModel.create({
      serviceNumber,
      customerId: contract.customerId,
      customerName: contract.customerName,
      address: 'Customer On-Site Location',
      scheduledDate: new Date(),
      serviceType: 'AMC_VISIT',
      status: ServiceStatus.COMPLETED,
      completedAt: new Date(),
      visitNotes: `Preventive AMC Visit #${contract.visitsCompleted} completed under contract ${contract.contractNumber}`,
      checklist: [
        { task: 'System inspection & cleaning', isDone: true },
        { task: 'Filter & pressure testing', isDone: true },
        { task: 'Performance parameters logged', isDone: true },
      ],
    });

    await createNotificationHelper({
      title: 'AMC Service Visit Completed',
      message: `Visit #${contract.visitsCompleted}/${contract.visitsPerYear} completed for ${contract.customerName} (${contract.contractNumber})`,
      type: 'SUCCESS',
      link: '/amc',
    });

    return res.json({
      success: true,
      message: `Visit #${contract.visitsCompleted} recorded for contract ${contract.contractNumber}.`,
      data: contract,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to record AMC visit.', error: err.message });
  }
};

