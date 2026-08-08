import mongoose, { Schema, Document } from 'mongoose';
import { AMCStatus } from '../shared';

export interface IAMCContract extends Document {
  contractNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  contractValue: number;
  visitsPerYear: number;
  visitsCompleted: number;
  status: AMCStatus;
  coveredProducts: string[];
  termsAndConditions?: string;
  lastReminderSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AMCContractSchema = new Schema<IAMCContract>(
  {
    contractNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    planName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    contractValue: { type: Number, required: true },
    visitsPerYear: { type: Number, default: 4 },
    visitsCompleted: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(AMCStatus), default: AMCStatus.ACTIVE },
    coveredProducts: [{ type: String }],
    termsAndConditions: { type: String },
    lastReminderSent: { type: Date },
  },
  { timestamps: true }
);

export const AMCContractModel = mongoose.model<IAMCContract>('AMCContract', AMCContractSchema);
