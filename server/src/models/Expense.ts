import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory = 'CONVEYANCE' | 'SPARE_PURCHASE' | 'FOOD_LODGING' | 'TOOLS' | 'MISC';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IExpense extends Document {
  expenseNumber: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  spentByUserId?: mongoose.Types.ObjectId;
  spentByName: string;
  relatedTicketId?: mongoose.Types.ObjectId;
  relatedCustomerName?: string;
  notes?: string;
  status: ExpenseStatus;
  approvedBy?: string;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['CONVEYANCE', 'SPARE_PURCHASE', 'FOOD_LODGING', 'TOOLS', 'MISC'],
      default: 'CONVEYANCE',
    },
    amount: { type: Number, required: true, min: 0 },
    spentByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    spentByName: { type: String, required: true, trim: true },
    relatedTicketId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    relatedCustomerName: { type: String, trim: true },
    notes: { type: String },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approvedBy: { type: String },
    expenseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ExpenseModel = mongoose.model<IExpense>('Expense', ExpenseSchema);
