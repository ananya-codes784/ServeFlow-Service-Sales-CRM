import mongoose, { Schema, Document } from 'mongoose';

export type SpareIssuePurpose = 'FIELD_REPAIR' | 'TRUNK_STOCK' | 'PREVENTIVE_VISIT';
export type SpareIssueStatus = 'ISSUED' | 'CONSUMED' | 'RETURNED';

export interface ISpareIssue extends Document {
  issueNumber: string;
  spareId: mongoose.Types.ObjectId;
  spareName: string;
  partNumber?: string;
  quantity: number;
  issuedToUserId?: mongoose.Types.ObjectId;
  issuedToName: string;
  issuedByUserId?: mongoose.Types.ObjectId;
  issuedByName: string;
  purpose: SpareIssuePurpose;
  relatedTicketNumber?: string;
  status: SpareIssueStatus;
  notes?: string;
  issueDate: Date;
  returnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SpareIssueSchema = new Schema<ISpareIssue>(
  {
    issueNumber: { type: String, required: true, unique: true },
    spareId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
    spareName: { type: String, required: true, trim: true },
    partNumber: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    issuedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    issuedToName: { type: String, required: true, trim: true },
    issuedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    issuedByName: { type: String, required: true, trim: true },
    purpose: {
      type: String,
      enum: ['FIELD_REPAIR', 'TRUNK_STOCK', 'PREVENTIVE_VISIT'],
      default: 'FIELD_REPAIR',
    },
    relatedTicketNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ISSUED', 'CONSUMED', 'RETURNED'],
      default: 'ISSUED',
    },
    notes: { type: String },
    issueDate: { type: Date, default: Date.now },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

export const SpareIssueModel = mongoose.model<ISpareIssue>('SpareIssue', SpareIssueSchema);
