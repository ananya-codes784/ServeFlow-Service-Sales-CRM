import { Request, Response } from 'express';
import { GpsModel } from '../models/GpsLocation';

export const getAllLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await GpsModel.find().sort({ lastUpdated: -1 });
    return res.json({ success: true, data: locations });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { technicianId, technicianName, latitude, longitude, address, accuracy, status } = req.body;
    if (!technicianId || !latitude || !longitude) return res.status(400).json({ success: false, message: 'technicianId, latitude and longitude are required.' });
    const location = await GpsModel.findOneAndUpdate(
      { technicianId },
      { technicianName, latitude, longitude, address, accuracy, status: status || 'ACTIVE', lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    return res.json({ success: true, data: location });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const setOffDuty = async (req: Request, res: Response) => {
  try {
    await GpsModel.findByIdAndUpdate(req.params.id, { status: 'OFF_DUTY' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
