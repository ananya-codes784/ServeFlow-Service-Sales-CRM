import { Request, Response } from 'express';
import { InvoiceModel } from '../models/Invoice';
import { PaymentModel } from '../models/Payment';
import { CustomerModel } from '../models/Customer';
import { PaymentStatus } from '../shared';
import { generateInvoicePDF, generatePaymentReceiptPDF } from '../utils/pdfGenerator';

// ─── INVOICES ────────────────────────────────────────────────────────────────

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const query: any = {};
    if (search) query.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }];
    if (status) query.paymentStatus = status;
    const total = await InvoiceModel.countDocuments(query);
    const invoices = await InvoiceModel.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: invoices, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch invoices.', error: err.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id).populate('customerId', 'companyName contactPerson email phone address city state pincode gstNumber');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.json({ success: true, data: invoice });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch invoice.', error: err.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      relatedType = 'SERVICE',
      gstType = 'INTRA_STATE',
      items = [],
      dueDate,
      notes,
    } = req.body;

    // Resolve customer details
    const customer = await CustomerModel.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    // Compute per-item amounts and subtotal
    let subtotal = 0;
    const computedItems = items.map((item: any) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      subtotal += amount;
      return {
        description: item.description,
        hsnCode: item.hsnCode || '',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate || 18),
        amount,
      };
    });

    // GST Calculation
    // Use weighted average tax rate across all items for simplicity
    const totalTaxableAmount = computedItems.reduce((sum: number, it: any) => sum + it.amount, 0);
    let cgst = 0, sgst = 0, igst = 0, taxAmount = 0;

    if (gstType === 'INTRA_STATE') {
      // Split evenly: CGST = 9%, SGST = 9% (for 18% GST items)
      computedItems.forEach((it: any) => {
        const halfTax = (it.amount * it.taxRate) / 100 / 2;
        cgst += halfTax;
        sgst += halfTax;
      });
      taxAmount = cgst + sgst;
    } else {
      // IGST = full rate (18% or per item taxRate)
      computedItems.forEach((it: any) => {
        igst += (it.amount * it.taxRate) / 100;
      });
      taxAmount = igst;
    }

    // Round to 2 decimals
    cgst = Math.round(cgst * 100) / 100;
    sgst = Math.round(sgst * 100) / 100;
    igst = Math.round(igst * 100) / 100;
    taxAmount = Math.round(taxAmount * 100) / 100;
    subtotal = Math.round(subtotal * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // Generate invoice number
    const count = await InvoiceModel.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await InvoiceModel.create({
      invoiceNumber,
      customerId: customer._id,
      customerName: customer.companyName,
      customerAddress: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
      customerGst: customer.gstNumber || '',
      relatedType,
      gstType,
      items: computedItems,
      subtotal,
      cgst,
      sgst,
      igst,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      paymentStatus: PaymentStatus.UNPAID,
      dueDate: new Date(dueDate),
      notes,
    });

    return res.status(201).json({ success: true, message: 'GST Invoice created successfully.', data: invoice });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create invoice.', error: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.json({ success: true, message: 'Invoice updated.', data: invoice });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update invoice.', error: err.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.json({ success: true, message: 'Invoice deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete invoice.', error: err.message });
  }
};

export const downloadInvoicePDF = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id).populate('customerId', 'companyName contactPerson address city state pincode gstNumber');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    const pdfBuffer = await generateInvoicePDF(invoice.toObject());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate PDF.', error: err.message });
  }
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    const { amount, paymentMethod, transactionId, notes, paymentDate } = req.body;
    const count = await PaymentModel.countDocuments();
    const paymentRef = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const payment = await PaymentModel.create({
      paymentReference: paymentRef,
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CASH',
      transactionId: transactionId || '',
      notes: notes || '',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    });
    invoice.paidAmount = (invoice.paidAmount || 0) + Number(amount);
    invoice.paymentStatus = invoice.paidAmount >= invoice.totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    await invoice.save();
    return res.status(201).json({ success: true, message: 'Payment recorded successfully.', data: payment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to record payment.', error: err.message });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await PaymentModel.find().sort({ paymentDate: -1 }).limit(200);
    return res.json({ success: true, data: payments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.', error: err.message });
  }
};

export const downloadPaymentReceipt = async (req: Request, res: Response) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    const pdfBuffer = await generatePaymentReceiptPDF(payment.toObject());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${payment.paymentReference}-receipt.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF.', error: err.message });
  }
};

export const getRevenueStats = async (_req: Request, res: Response) => {
  try {
    const totalRevenue = await PaymentModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const unpaidInvoices = await InvoiceModel.find({ paymentStatus: { $ne: PaymentStatus.PAID } });
    const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    return res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        outstandingBalance: unpaidTotal,
        totalInvoices: await InvoiceModel.countDocuments(),
        paidInvoices: await InvoiceModel.countDocuments({ paymentStatus: PaymentStatus.PAID }),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch revenue stats.', error: err.message });
  }
};
