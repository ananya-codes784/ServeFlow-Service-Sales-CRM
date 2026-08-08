import { Request, Response } from 'express';
import { LeaveModel } from '../models/Leave';
import { EmployeeModel } from '../models/Employee';

const generateLeaveNumber = async (): Promise<string> => {
  const count = await LeaveModel.countDocuments();
  return `LV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

export const getLeaves = async (req: Request, res: Response) => {
  try {
    const leaves = await LeaveModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: leaves });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leaves.', error: err.message });
  }
};

export const createLeave = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason } = req.body;
    if (!employeeId || !leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveNumber = await generateLeaveNumber();
    const leave = await LeaveModel.create({
      leaveNumber,
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      leaveType,
      fromDate: from,
      toDate: to,
      totalDays,
      reason,
      status: 'PENDING',
    });
    return res.status(201).json({ success: true, data: leave });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to apply leave.', error: err.message });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { status, approvedBy, approverComment } = req.body;
    const leave = await LeaveModel.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy, approverComment },
      { new: true }
    );
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });
    return res.json({ success: true, data: leave });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update leave.', error: err.message });
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    await LeaveModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Leave deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete leave.', error: err.message });
  }
};
