import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthRequest } from '../middlewares/auth';

// In-memory fallback notification store for offline DB preview
let inMemoryNotifications: any[] = [
  {
    _id: 'notif_1',
    title: 'System Initialized',
    message: 'Welcome to ServeWell Enterprise CRM Platform. Backend and Database services are active.',
    type: 'SUCCESS',
    isRead: false,
    link: '/dashboard',
    createdAt: new Date(),
  },
  {
    _id: 'notif_2',
    title: 'High Priority Complaint',
    message: 'Apex Industrial Corp reported pressure valve failure on Heavy Duty Compressor X5.',
    type: 'WARNING',
    isRead: false,
    link: '/complaints',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: 'notif_3',
    title: 'AMC Expiry Alert',
    message: 'Contract AMC-2025-402 for BioHealth Pharma is due for renewal in 7 days.',
    type: 'INFO',
    isRead: true,
    link: '/amc',
    createdAt: new Date(Date.now() - 86400000),
  },
];

export const createNotificationHelper = async (data: {
  userId?: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'SYSTEM';
  link?: string;
}) => {
  try {
    const mongoose = await import('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return await NotificationModel.create({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link || '',
      });
    }
  } catch (err) {
    console.warn('[Notification] DB create warning:', err);
  }

  // Fallback to in-memory array
  const notif = {
    _id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'INFO',
    isRead: false,
    link: data.link || '',
    createdAt: new Date(),
  };
  inMemoryNotifications.unshift(notif);
  return notif;
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const mongoose = await import('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const notifications = await NotificationModel.find({
        $or: [{ userId: req.user?.id }, { userId: null }, { userId: { $exists: false } }],
      })
        .sort({ createdAt: -1 })
        .limit(30);

      const unreadCount = await NotificationModel.countDocuments({
        $or: [{ userId: req.user?.id }, { userId: null }, { userId: { $exists: false } }],
        isRead: false,
      });

      return res.json({
        success: true,
        data: notifications,
        unreadCount,
      });
    }
  } catch (err: any) {
    console.warn('[Notification] DB fetch failed, using fallback:', err.message);
  }

  const unreadCount = inMemoryNotifications.filter((n) => !n.isRead).length;
  return res.json({
    success: true,
    data: inMemoryNotifications,
    unreadCount,
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mongoose = await import('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const notif = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
      if (notif) return res.json({ success: true, message: 'Notification marked as read.', data: notif });
    }
  } catch (err) {
    console.warn('[Notification] DB update warning:', err);
  }

  const target = inMemoryNotifications.find((n) => n._id === req.params.id);
  if (target) target.isRead = true;
  return res.json({ success: true, message: 'Notification marked as read.' });
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const mongoose = await import('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await NotificationModel.updateMany(
        { $or: [{ userId: req.user?.id }, { userId: null }, { userId: { $exists: false } }] },
        { isRead: true }
      );
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }
  } catch (err) {
    console.warn('[Notification] DB updateMany warning:', err);
  }

  inMemoryNotifications.forEach((n) => (n.isRead = true));
  return res.json({ success: true, message: 'All notifications marked as read.' });
};

export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const mongoose = await import('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await NotificationModel.deleteMany({
        $or: [{ userId: req.user?.id }, { userId: null }, { userId: { $exists: false } }],
      });
      return res.json({ success: true, message: 'All notifications cleared.' });
    }
  } catch (err) {
    console.warn('[Notification] DB deleteMany warning:', err);
  }

  inMemoryNotifications = [];
  return res.json({ success: true, message: 'All notifications cleared.' });
};
