import mongoose, { Schema, Document } from 'mongoose';
import { LeadStage } from '../shared';

export interface IFollowUp {
  date: Date;
  note: string;
  createdBy: string;
  nextFollowUpDate?: Date;
}

export interface ILead extends Document {
  leadNumber: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  dealValue: number;
  assignedTo?: string;
  followUps: IFollowUp[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>({
  date: { type: Date, default: Date.now },
  note: { type: String, required: true },
  createdBy: { type: String, required: true },
  nextFollowUpDate: { type: Date },
});

const LeadSchema = new Schema<ILead>(
  {
    leadNumber: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    source: { type: String, default: 'Website Enquiry' },
    stage: { type: String, enum: Object.values(LeadStage), default: LeadStage.NEW },
    dealValue: { type: Number, default: 0 },
    assignedTo: { type: String },
    followUps: [FollowUpSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

export const LeadModel = mongoose.model<ILead>('Lead', LeadSchema);
