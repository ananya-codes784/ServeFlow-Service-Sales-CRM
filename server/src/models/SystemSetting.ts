import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  gstNumber: string;
  currencySymbol: string;
  taxPercentage: number;
  emailNotifications: boolean;
  smsAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    companyName: { type: String, default: 'ServeWell Enterprise Solutions' },
    companyEmail: { type: String, default: 'support@servewell.com' },
    companyPhone: { type: String, default: '+1 (800) 555-SERV' },
    companyAddress: { type: String, default: '100 Innovation Parkway, Suite 500, Tech City' },
    gstNumber: { type: String, default: '29ABCDE1234F1Z5' },
    currencySymbol: { type: String, default: '$' },
    taxPercentage: { type: Number, default: 18 },
    emailNotifications: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SystemSettingModel = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
