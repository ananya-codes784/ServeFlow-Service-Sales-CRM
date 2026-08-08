import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  leadId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  items: IQuotationItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  validUntil: Date;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, unique: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [QuotationItemSchema],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

export const QuotationModel = mongoose.model<IQuotation>('Quotation', QuotationSchema);
