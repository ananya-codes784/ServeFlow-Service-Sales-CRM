import mongoose, { Schema, Document } from 'mongoose';

export interface IGpsLocation extends Document {
  technicianId: string;
  technicianName: string;
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  status: 'ACTIVE' | 'IDLE' | 'OFF_DUTY';
  lastUpdated: Date;
}

const GpsSchema = new Schema<IGpsLocation>(
  {
    technicianId: { type: String, required: true, unique: true },
    technicianName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    accuracy: { type: Number },
    status: { type: String, enum: ['ACTIVE', 'IDLE', 'OFF_DUTY'], default: 'IDLE' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GpsModel = mongoose.model<IGpsLocation>('GpsLocation', GpsSchema);
