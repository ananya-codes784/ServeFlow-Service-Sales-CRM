import { Request, Response } from 'express';
import { LeadModel } from '../models/Lead';
import { QuotationModel } from '../models/Quotation';
import { AuthRequest } from '../middlewares/auth';

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', stage = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ companyName: { $regex: search, $options: 'i' } }, { contactPerson: { $regex: search, $options: 'i' } }, { leadNumber: { $regex: search, $options: 'i' } }];
    if (stage) query.stage = stage;
    const total = await LeadModel.countDocuments(query);
    const leads = await LeadModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 });
    return res.json({ success: true, data: leads, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leads.', error: err.message });
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const lead = await LeadModel.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    return res.json({ success: true, data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch lead.', error: err.message });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const count = await LeadModel.countDocuments();
    const leadNumber = `LEAD-${String(100 + count + 1)}`;
    const lead = await LeadModel.create({ ...req.body, leadNumber });
    return res.status(201).json({ success: true, message: 'Lead created successfully.', data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create lead.', error: err.message });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    return res.json({ success: true, message: 'Lead updated.', data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update lead.', error: err.message });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    await LeadModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Lead deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete lead.', error: err.message });
  }
};

export const addFollowUp = async (req: AuthRequest, res: Response) => {
  try {
    const { note, nextFollowUpDate } = req.body;
    const lead = await LeadModel.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    lead.followUps.push({ date: new Date(), note, createdBy: req.user?.name || 'System', nextFollowUpDate });
    await lead.save();
    return res.json({ success: true, message: 'Follow-up added.', data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to add follow-up.', error: err.message });
  }
};

export const getQuotations = async (req: Request, res: Response) => {
  try {
    const quotations = await QuotationModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: quotations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch quotations.', error: err.message });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const count = await QuotationModel.countDocuments();
    const quotationNumber = `QUO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const quotation = await QuotationModel.create({ ...req.body, quotationNumber });
    return res.status(201).json({ success: true, message: 'Quotation created.', data: quotation });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create quotation.', error: err.message });
  }
};
