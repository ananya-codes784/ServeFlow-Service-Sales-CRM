import mongoose, { Schema, Document } from 'mongoose';

export interface IMsgTemplate extends Document {
  templateName: string;
  category: 'WHATSAPP' | 'SMS' | 'EMAIL';
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

const MsgTemplateSchema = new Schema<IMsgTemplate>(
  {
    templateName: { type: String, required: true },
    category: { type: String, enum: ['WHATSAPP', 'SMS', 'EMAIL'], required: true },
    subject: { type: String },
    body: { type: String, required: true },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MsgTemplateModel = mongoose.model<IMsgTemplate>('MsgTemplate', MsgTemplateSchema);
