import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '../shared';

export interface IInvoiceItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // 0, 5, 12, 18, 28
  amount: number;   // quantity * unitPrice (before tax)
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerAddress?: string;
  customerGst?: string;
  relatedType: 'AMC' | 'SERVICE' | 'SALE';
  gstType: 'INTRA_STATE' | 'INTER_STATE';
  items: IInvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  hsnCode: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 18 },
  amount: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String },
    customerGst: { type: String },
    relatedType: { type: String, enum: ['AMC', 'SERVICE', 'SALE'], default: 'SERVICE' },
    gstType: { type: String, enum: ['INTRA_STATE', 'INTER_STATE'], default: 'INTRA_STATE' },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.UNPAID },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
