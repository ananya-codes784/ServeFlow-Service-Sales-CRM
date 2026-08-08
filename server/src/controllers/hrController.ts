import { Request, Response } from 'express';
import { EmployeeModel } from '../models/Employee';
import { UserModel } from '../models/User';
import { UserRole } from '../shared';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { department: { $regex: search, $options: 'i' } }, { employeeId: { $regex: search, $options: 'i' } }];
    const total = await EmployeeModel.countDocuments(query);
    const employees = await EmployeeModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ name: 1 }).select('-attendance');
    return res.json({ success: true, data: employees, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch employees.', error: err.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await EmployeeModel.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });
    return res.json({ success: true, data: employee });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch employee.', error: err.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const count = await EmployeeModel.countDocuments();
    const employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
    const employee = await EmployeeModel.create({ ...req.body, employeeId });
    return res.status(201).json({ success: true, message: 'Employee created.', data: employee });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create employee.', error: err.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await EmployeeModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });
    return res.json({ success: true, message: 'Employee updated.', data: employee });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update employee.', error: err.message });
  }
};

export const logAttendance = async (req: Request, res: Response) => {
  try {
    const { status, checkIn, checkOut } = req.body;
    const employee = await EmployeeModel.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingIndex = employee.attendance.findIndex(a => new Date(a.date).toDateString() === today.toDateString());
    const entry = { date: today, status, checkIn, checkOut };
    if (existingIndex > -1) {
      employee.attendance[existingIndex] = entry;
    } else {
      employee.attendance.push(entry);
    }
    await employee.save();
    return res.json({ success: true, message: 'Attendance logged.', data: employee });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to log attendance.', error: err.message });
  }
};

export const getTechnicians = async (_req: Request, res: Response) => {
  try {
    const technicians = await UserModel.find({ role: UserRole.TECHNICIAN, isActive: true }).select('-passwordHash');
    return res.json({ success: true, data: technicians });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch technicians.', error: err.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    await EmployeeModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Employee deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete employee.', error: err.message });
  }
};
