import mongoose, { Schema, Document } from 'mongoose';

export type ProductCategory =
  | 'AIR_CONDITIONER'
  | 'WATER_PURIFIER'
  | 'UPS_INVERTER'
  | 'SOLAR_PANEL'
  | 'COMMERCIAL_EQUIPMENT'
  | 'SPARE_PARTS';

export interface IProductMaster extends Document {
  productCode: string;
  brand: string;
  modelNumber: string;
  name: string;
  category: ProductCategory;
  capacity?: string;
  baseMrp: number;
  sellingPrice: number;
  hsnCode?: string;
  warehouseLocation: string;
  shelfBinLocation?: string;
  reorderLevel: number;
  stockQuantity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductMasterSchema = new Schema<IProductMaster>(
  {
    productCode: { type: String, required: true, unique: true },
    brand: { type: String, required: true, trim: true },
    modelNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['AIR_CONDITIONER', 'WATER_PURIFIER', 'UPS_INVERTER', 'SOLAR_PANEL', 'COMMERCIAL_EQUIPMENT', 'SPARE_PARTS'],
      default: 'AIR_CONDITIONER',
    },
    capacity: { type: String, trim: true },
    baseMrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    hsnCode: { type: String, trim: true, default: '8415' },
    warehouseLocation: { type: String, required: true, default: 'Main Warehouse' },
    shelfBinLocation: { type: String, default: 'Rack A-1' },
    reorderLevel: { type: Number, default: 5 },
    stockQuantity: { type: Number, required: true, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

export const ProductMasterModel = mongoose.model<IProductMaster>('ProductMaster', ProductMasterSchema);
