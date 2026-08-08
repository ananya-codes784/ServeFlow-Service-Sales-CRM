import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { SystemSettingModel } from '../models/SystemSetting';
import { UserRole } from '../shared';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, department } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Password123', salt);
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role: role || UserRole.TECHNICIAN,
      phone: phone || '',
      department: department || 'Field Engineering',
      isActive: true,
    });
    return res.status(201).json({ success: true, message: 'User created successfully.', data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create user.', error: err.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }).select('-passwordHash -otp -otpExpiresAt');
    return res.json({ success: true, data: users, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.', error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, phone, department, isActive } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.params.id, { name, email, role, phone, department, isActive }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User updated.', data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update user.', error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'User deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.', error: err.message });
  }
};

export const getSystemSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await SystemSettingModel.findOne();
    if (!settings) settings = await SystemSettingModel.create({});
    return res.json({ success: true, data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.', error: err.message });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettingModel.findOne();
    if (!settings) {
      settings = await SystemSettingModel.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return res.json({ success: true, message: 'Settings updated.', data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.', error: err.message });
  }
};
