import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { generateToken, AuthRequest } from '../middlewares/auth';
import { UserRole } from '../shared';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, department } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    let finalRole = role || UserRole.ADMIN;
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('admin') || lowerEmail.includes('@servewell.com')) {
      finalRole = UserRole.ADMIN;
    } else if (lowerEmail.includes('manager')) {
      finalRole = UserRole.MANAGER;
    } else if (lowerEmail.includes('tech')) {
      finalRole = UserRole.TECHNICIAN;
    }

    const user = await UserModel.create({ name, email, passwordHash, role: finalRole, phone, department });
    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role, name: user.name });
    return res.status(201).json({ success: true, message: 'Account created successfully.', data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    let user = await UserModel.findOne({ email, isActive: true });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role, name: user.name });
    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '+1 800-555-0199',
          department: user.department || 'Executive Management',
          avatar: user.avatar || '',
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user?.id).select('-passwordHash -otp -otpExpiresAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.', error: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, department } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.user?.id, { name, phone, department }, { new: true }).select('-passwordHash');
    return res.json({ success: true, message: 'Profile updated.', data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Profile update failed.', error: err.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Password change failed.', error: err.message });
  }
};
