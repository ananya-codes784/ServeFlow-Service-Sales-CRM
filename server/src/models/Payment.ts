import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentReference: string;
  invoiceId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  amount: number;
  paymentMethod: 'UPI' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHEQUE' | 'CASH';
  transactionId?: string;
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentReference: { type: String, required: true, unique: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHEQUE', 'CASH'],
      default: 'BANK_TRANSFER',
    },
    transactionId: { type: String },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
