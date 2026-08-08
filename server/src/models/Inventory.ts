import mongoose, { Schema, Document } from 'mongoose';
import { InventoryCategory } from '../shared';

export interface IInventoryItem extends Document {
  sku: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  vendorName: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventoryItem>(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: Object.values(InventoryCategory), default: InventoryCategory.SPARE_PART },
    quantity: { type: Number, required: true, default: 0 },
    unitPrice: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    vendorName: { type: String, required: true },
    location: { type: String, default: 'Main Warehouse' },
  },
  { timestamps: true }
);

export const InventoryModel = mongoose.model<IInventoryItem>('Inventory', InventorySchema);
