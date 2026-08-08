import { Request, Response } from 'express';
import { MsgTemplateModel } from '../models/MsgTemplate';

export const getTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = await MsgTemplateModel.find().sort({ category: 1, templateName: 1 });
    return res.json({ success: true, data: templates });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { templateName, category, subject, body, variables } = req.body;
    if (!templateName || !category || !body) return res.status(400).json({ success: false, message: 'Name, category and body are required.' });
    const template = await MsgTemplateModel.create({ templateName, category, subject, body, variables: variables || [] });
    return res.status(201).json({ success: true, data: template });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const template = await MsgTemplateModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found.' });
    return res.json({ success: true, data: template });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    await MsgTemplateModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Template deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const useTemplate = async (req: Request, res: Response) => {
  try {
    await MsgTemplateModel.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

