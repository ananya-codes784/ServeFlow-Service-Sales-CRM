import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';
import { ComplaintModel } from '../models/Complaint';
import { ServiceTicketModel } from '../models/ServiceTicket';
import { AMCContractModel } from '../models/AMCContract';
import { LeadModel } from '../models/Lead';
import { InvoiceModel } from '../models/Invoice';
import { UserModel } from '../models/User';
import { ComplaintStatus, AMCStatus, LeadStage, PaymentStatus, UserRole } from '../shared';

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const [
      totalCustomers, activeComplaints, pendingServices, activeContracts,
      totalLeads, wonLeads, totalRevenue, techniciansOnField
    ] = await Promise.all([
      CustomerModel.countDocuments(),
      ComplaintModel.countDocuments({ status: { $in: [ComplaintStatus.NEW, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS] } }),
      ServiceTicketModel.countDocuments({ status: { $in: ['SCHEDULED', 'IN_TRANSIT', 'WORK_IN_PROGRESS'] } }),
      AMCContractModel.countDocuments({ status: AMCStatus.ACTIVE }),
      LeadModel.countDocuments(),
      LeadModel.countDocuments({ stage: LeadStage.WON }),
      InvoiceModel.aggregate([{ $match: { paymentStatus: PaymentStatus.PAID } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      UserModel.countDocuments({ role: UserRole.TECHNICIAN, isActive: true }),
    ]);

    const recentComplaints = await ComplaintModel.find().sort({ createdAt: -1 }).limit(5);
    const expiringContracts = await AMCContractModel.find({
      status: AMCStatus.ACTIVE,
      endDate: { $lte: new Date(Date.now() + 30 * 86400000) }
    }).limit(5);

    const monthlyRevenue = await InvoiceModel.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: { month: { $month: '$issueDate' }, year: { $year: '$issueDate' } }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    return res.json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          activeComplaints,
          pendingServices,
          activeContracts,
          totalLeads,
          wonLeads,
          totalRevenue: totalRevenue[0]?.total || 0,
          techniciansOnField,
        },
        recentComplaints,
        expiringContracts,
        monthlyRevenue,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load dashboard.', error: err.message });
  }
};
