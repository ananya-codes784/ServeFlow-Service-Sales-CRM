import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../shared';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
