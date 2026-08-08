import mongoose, { Schema, Document } from 'mongoose';

export type LeaveType = 'SICK_LEAVE' | 'CASUAL_LEAVE' | 'EARNED_LEAVE' | 'EMERGENCY_LEAVE' | 'MATERNITY_LEAVE' | 'UNPAID_LEAVE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ILeave extends Document {
  leaveNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  fromDate: Date;
  toDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approverComment?: string;
  appliedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    leaveNumber: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    leaveType: { type: String, enum: ['SICK_LEAVE','CASUAL_LEAVE','EARNED_LEAVE','EMERGENCY_LEAVE','MATERNITY_LEAVE','UNPAID_LEAVE'], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING','APPROVED','REJECTED','CANCELLED'], default: 'PENDING' },
    approvedBy: { type: String },
    approverComment: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LeaveModel = mongoose.model<ILeave>('Leave', LeaveSchema);
