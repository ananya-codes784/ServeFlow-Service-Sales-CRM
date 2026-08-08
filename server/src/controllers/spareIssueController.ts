import { Request, Response } from 'express';
import { SpareIssueModel } from '../models/SpareIssue';
import { InventoryModel } from '../models/Inventory';
import { AuthRequest } from '../middlewares/auth';
import { createNotificationHelper } from './notificationController';

const generateIssueNumber = async (): Promise<string> => {
  const count = await SpareIssueModel.countDocuments();
  return `SPI-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
};

export const getSpareIssues = async (req: Request, res: Response) => {
  try {
    const { search = '', status = '', purpose = '' } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { issueNumber: { $regex: search, $options: 'i' } },
        { spareName: { $regex: search, $options: 'i' } },
        { issuedToName: { $regex: search, $options: 'i' } },
        { relatedTicketNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (purpose) query.purpose = purpose;

    const issues = await SpareIssueModel.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: issues });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch spare issues.', error: err.message });
  }
};

export const createSpareIssue = async (req: AuthRequest, res: Response) => {
  try {
    const { spareId, quantity, issuedToName, purpose, relatedTicketNumber, notes } = req.body;
    if (!spareId || !quantity || !issuedToName) {
      return res.status(400).json({ success: false, message: 'spareId, quantity, and issuedToName are required.' });
    }

    const qtyNum = Number(quantity);
    const inventoryItem = await InventoryModel.findById(spareId);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: 'Selected spare inventory item not found.' });
    }

    if (inventoryItem.quantity < qtyNum) {
      return res.status(400).json({
        success: false,
        message: `Insufficient warehouse stock. Available: ${inventoryItem.quantity}, Requested: ${qtyNum}`,
      });
    }

    // Deduct stock from Inventory
    inventoryItem.quantity -= qtyNum;
    await inventoryItem.save();

    const issueNumber = await generateIssueNumber();
    const issue = await SpareIssueModel.create({
      issueNumber,
      spareId: inventoryItem._id,
      spareName: inventoryItem.name,
      partNumber: inventoryItem.sku || '',
      quantity: qtyNum,
      issuedToName,
      issuedByUserId: req.user?.id,
      issuedByName: req.user?.name || 'Store Manager',
      purpose: purpose || 'FIELD_REPAIR',
      relatedTicketNumber: relatedTicketNumber || '',
      notes: notes || '',
      status: 'ISSUED',
      issueDate: new Date(),
    });

    await createNotificationHelper({
      title: 'Spare Part Issued to Field Engineer',
      message: `${qtyNum}x ${inventoryItem.name} (${issueNumber}) issued to ${issuedToName}`,
      type: 'INFO',
      link: '/inventory/spare-issues',
    });

    return res.status(201).json({
      success: true,
      message: `Issued ${qtyNum} units of ${inventoryItem.name} to ${issuedToName}. Warehouse stock updated.`,
      data: issue,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to issue spare part.', error: err.message });
  }
};

export const updateSpareIssueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['CONSUMED', 'RETURNED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be CONSUMED or RETURNED.' });
    }

    const issue = await SpareIssueModel.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Spare issue record not found.' });

    // If returned, restore quantity back to Inventory stock
    if (status === 'RETURNED' && issue.status !== 'RETURNED') {
      const inventoryItem = await InventoryModel.findById(issue.spareId);
      if (inventoryItem) {
        inventoryItem.quantity += issue.quantity;
        await inventoryItem.save();
      }
      issue.returnedAt = new Date();
    }

    issue.status = status;
    await issue.save();

    await createNotificationHelper({
      title: `Spare Issue Status Updated: ${status}`,
      message: `${issue.quantity}x ${issue.spareName} (${issue.issueNumber}) marked as ${status.toLowerCase()}`,
      type: status === 'CONSUMED' ? 'SUCCESS' : 'INFO',
      link: '/inventory/spare-issues',
    });

    return res.json({
      success: true,
      message: `Spare issue status updated to ${status}.`,
      data: issue,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update spare issue status.', error: err.message });
  }
};

export const deleteSpareIssue = async (req: Request, res: Response) => {
  try {
    const issue = await SpareIssueModel.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Record not found.' });

    // If deleting an active issue, restore warehouse stock
    if (issue.status === 'ISSUED') {
      const inventoryItem = await InventoryModel.findById(issue.spareId);
      if (inventoryItem) {
        inventoryItem.quantity += issue.quantity;
        await inventoryItem.save();
      }
    }

    await SpareIssueModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Spare issue record deleted and warehouse stock restored if applicable.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete spare issue record.', error: err.message });
  }
};
