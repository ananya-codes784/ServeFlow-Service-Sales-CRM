import mongoose, { Schema, Document } from 'mongoose';
import { Priority, ComplaintStatus } from '../shared';

export interface ITimelineEntry {
  status: ComplaintStatus;
  comment: string;
  updatedBy: string;
  timestamp: Date;
}

export interface ISpareUsed {
  spareName: string;
  quantity: number;
  cost: number;
}

export interface IComplaint extends Document {
  ticketNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  contactPhone: string;
  productName: string;
  serialNumber?: string;
  category: string;
  subject: string;
  description: string;
  priority: Priority;
  status: ComplaintStatus;
  assignedTechnicianId?: mongoose.Types.ObjectId;
  assignedTechnicianName?: string;
  timeline: ITimelineEntry[];
  sparesUsed: ISpareUsed[];
  resolutionNotes?: string;
  satisfactionRating?: number;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEntrySchema = new Schema<ITimelineEntry>({
  status: { type: String, enum: Object.values(ComplaintStatus), required: true },
  comment: { type: String, required: true },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SpareUsedSchema = new Schema<ISpareUsed>({
  spareName: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
});

const ComplaintSchema = new Schema<IComplaint>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    productName: { type: String, required: true },
    serialNumber: { type: String },
    category: { type: String, required: true, default: 'General Breakdown' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: Object.values(Priority), default: Priority.MEDIUM },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.NEW },
    assignedTechnicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTechnicianName: { type: String },
    timeline: [TimelineEntrySchema],
    sparesUsed: [SpareUsedSchema],
    resolutionNotes: { type: String },
    satisfactionRating: { type: Number, min: 1, max: 5 },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const ComplaintModel = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
