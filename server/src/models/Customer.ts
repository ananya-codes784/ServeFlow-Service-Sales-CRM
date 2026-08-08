import mongoose, { Schema, Document } from 'mongoose';

export interface IInstalledProduct {
  productName: string;
  serialNumber: string;
  installationDate: Date;
  warrantyEnd: Date;
  modelNumber?: string;
}

export interface ICustomer extends Document {
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  category: 'VIP' | 'REGULAR' | 'ENTERPRISE' | 'GOVERNMENT';
  userId?: mongoose.Types.ObjectId;
  installedProducts: IInstalledProduct[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstalledProductSchema = new Schema<IInstalledProduct>({
  productName: { type: String, required: true },
  serialNumber: { type: String, required: true },
  installationDate: { type: Date, required: true },
  warrantyEnd: { type: Date, required: true },
  modelNumber: { type: String },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    customerCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    gstNumber: { type: String },
    category: { type: String, enum: ['VIP', 'REGULAR', 'ENTERPRISE', 'GOVERNMENT'], default: 'REGULAR' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    installedProducts: [InstalledProductSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema);
