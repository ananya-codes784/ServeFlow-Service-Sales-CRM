import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SYSTEM'],
      default: 'INFO',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
