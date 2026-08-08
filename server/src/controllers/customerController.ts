import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';
import { ComplaintModel } from '../models/Complaint';
import { AMCContractModel } from '../models/AMCContract';
import { ServiceTicketModel } from '../models/ServiceTicket';
import { InvoiceModel } from '../models/Invoice';
import { createNotificationHelper } from './notificationController';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    const total = await CustomerModel.countDocuments(query);
    const customers = await CustomerModel.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 });
    return res.json({ success: true, data: customers, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customers.', error: err.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    return res.json({ success: true, data: customer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customer.', error: err.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const lastCustomer = await CustomerModel.findOne().sort({ createdAt: -1 });
    const lastNum = lastCustomer ? parseInt(lastCustomer.customerCode.split('-')[1]) + 1 : 1001;
    const customerCode = `CUST-${lastNum}`;
    const customer = await CustomerModel.create({ ...req.body, customerCode });

    // Trigger System Notification
    await createNotificationHelper({
      title: 'New Customer Registered',
      message: `${customer.companyName} (${customer.customerCode}) added to customer database.`,
      type: 'SUCCESS',
      link: '/customers',
    });

    return res.status(201).json({ success: true, message: 'Customer created successfully.', data: customer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create customer.', error: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    return res.json({ success: true, message: 'Customer updated successfully.', data: customer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update customer.', error: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await CustomerModel.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    return res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete customer.', error: err.message });
  }
};

export const getCustomerFull360 = async (req: Request, res: Response) => {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const [complaints, amcContracts, serviceTickets, invoices] = await Promise.all([
      ComplaintModel.find({ customerId: customer._id }).sort({ createdAt: -1 }),
      AMCContractModel.find({ customerId: customer._id }).sort({ createdAt: -1 }),
      ServiceTicketModel.find({ customerId: customer._id }).sort({ createdAt: -1 }),
      InvoiceModel.find({ customerId: customer._id }).sort({ createdAt: -1 }),
    ]);

    return res.json({
      success: true,
      data: {
        customer,
        complaints,
        amcContracts,
        serviceTickets,
        invoices,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customer 360 view.', error: err.message });
  }
};

export const addCustomerProduct = async (req: Request, res: Response) => {
  try {
    const { productName, serialNumber, installationDate, warrantyEnd, modelNumber } = req.body;
    if (!productName || !serialNumber || !installationDate || !warrantyEnd) {
      return res.status(400).json({ success: false, message: 'productName, serialNumber, installationDate and warrantyEnd are required.' });
    }

    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    customer.installedProducts.push({
      productName,
      serialNumber,
      installationDate: new Date(installationDate),
      warrantyEnd: new Date(warrantyEnd),
      modelNumber: modelNumber || '',
    });

    await customer.save();

    return res.status(201).json({ success: true, message: 'Product added successfully.', data: customer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to add customer product.', error: err.message });
  }
};

export const deleteCustomerProduct = async (req: Request, res: Response) => {
  try {
    const { id, productId } = req.params;
    const customer = await CustomerModel.findById(id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    customer.installedProducts = customer.installedProducts.filter(
      (p: any) => p._id.toString() !== productId
    );

    await customer.save();

    return res.json({ success: true, message: 'Product removed successfully.', data: customer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to remove customer product.', error: err.message });
  }
};

