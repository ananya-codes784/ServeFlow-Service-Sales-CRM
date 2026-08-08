import mongoose, { Schema, Document } from 'mongoose';
import { ServiceStatus } from '../shared';

export interface IChecklistItem {
  task: string;
  isDone: boolean;
}

export interface IServiceTicket extends Document {
  serviceNumber: string;
  complaintId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  address: string;
  technicianId?: mongoose.Types.ObjectId;
  technicianName?: string;
  scheduledDate: Date;
  serviceType: 'BREAKDOWN' | 'PREVENTIVE' | 'INSTALLATION' | 'AMC_VISIT';
  status: ServiceStatus;
  checklist: IChecklistItem[];
  visitNotes?: string;
  customerSignature?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>({
  task: { type: String, required: true },
  isDone: { type: Boolean, default: false },
});

const ServiceTicketSchema = new Schema<IServiceTicket>(
  {
    serviceNumber: { type: String, required: true, unique: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    technicianName: { type: String },
    scheduledDate: { type: Date, required: true },
    serviceType: {
      type: String,
      enum: ['BREAKDOWN', 'PREVENTIVE', 'INSTALLATION', 'AMC_VISIT'],
      default: 'PREVENTIVE',
    },
    status: { type: String, enum: Object.values(ServiceStatus), default: ServiceStatus.SCHEDULED },
    checklist: [ChecklistItemSchema],
    visitNotes: { type: String },
    customerSignature: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const ServiceTicketModel = mongoose.model<IServiceTicket>('ServiceTicket', ServiceTicketSchema);
