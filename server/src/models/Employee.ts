import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance {
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  checkIn?: string;
  checkOut?: string;
}

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: Date;
  baseSalary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  attendance: IAttendance[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE'], default: 'PRESENT' },
  checkIn: { type: String },
  checkOut: { type: String },
});

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    baseSalary: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'RESIGNED'], default: 'ACTIVE' },
    attendance: [AttendanceSchema],
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.model<IEmployee>('Employee', EmployeeSchema);
