import { Request, Response } from 'express';
import { InventoryModel } from '../models/Inventory';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }, { vendorName: { $regex: search, $options: 'i' } }];
    if (category) query.category = category;
    const total = await InventoryModel.countDocuments(query);
    const items = await InventoryModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ name: 1 });
    return res.json({ success: true, data: items, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory.', error: err.message });
  }
};

export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const item = await InventoryModel.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch item.', error: err.message });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const item = await InventoryModel.create(req.body);
    return res.status(201).json({ success: true, message: 'Inventory item created.', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create item.', error: err.message });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const item = await InventoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    return res.json({ success: true, message: 'Inventory item updated.', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update item.', error: err.message });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    await InventoryModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Inventory item deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete item.', error: err.message });
  }
};

export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const items = await InventoryModel.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort({ quantity: 1 });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch low stock items.', error: err.message });
  }
};
