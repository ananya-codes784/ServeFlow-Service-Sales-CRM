import { Request, Response } from 'express';
import { ExpenseModel } from '../models/Expense';
import { AuthRequest } from '../middlewares/auth';
import { createNotificationHelper } from './notificationController';

const generateExpenseNumber = async (): Promise<string> => {
  const count = await ExpenseModel.countDocuments();
  return `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { search = '', category = '', status = '' } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { expenseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { spentByName: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const expenses = await ExpenseModel.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: expenses });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch expenses.', error: err.message });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, amount, spentByName, relatedCustomerName, notes, expenseDate } = req.body;
    if (!title || !amount || !spentByName) {
      return res.status(400).json({ success: false, message: 'Title, amount, and spentByName are required.' });
    }

    const expenseNumber = await generateExpenseNumber();
    const expense = await ExpenseModel.create({
      expenseNumber,
      title,
      category: category || 'CONVEYANCE',
      amount: Number(amount),
      spentByUserId: req.user?.id,
      spentByName,
      relatedCustomerName: relatedCustomerName || '',
      notes: notes || '',
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      status: 'PENDING',
    });

    await createNotificationHelper({
      title: 'New Expense Claim Submitted',
      message: `${spentByName} submitted an expense claim of ₹${amount} for ${title}`,
      type: 'INFO',
      link: '/finance/expenses',
    });

    return res.status(201).json({ success: true, message: 'Expense claim submitted.', data: expense });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create expense claim.', error: err.message });
  }
};

export const updateExpenseStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const expense = await ExpenseModel.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense claim not found.' });

    expense.status = status;
    expense.approvedBy = req.user?.name || 'Service Manager';
    await expense.save();

    await createNotificationHelper({
      title: `Expense Claim ${status}`,
      message: `Expense claim ${expense.expenseNumber} (₹${expense.amount}) by ${expense.spentByName} was ${status.toLowerCase()}.`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      link: '/finance/expenses',
    });

    return res.json({ success: true, message: `Expense claim ${status.toLowerCase()}.`, data: expense });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update expense status.', error: err.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    await ExpenseModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Expense claim deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete expense claim.', error: err.message });
  }
};
