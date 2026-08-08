import 'dotenv/config';
import mongoose from 'mongoose';
import { CustomerModel } from '../models/Customer';
import { ComplaintModel } from '../models/Complaint';
import { ServiceTicketModel } from '../models/ServiceTicket';
import { AMCContractModel } from '../models/AMCContract';
import { LeadModel } from '../models/Lead';
import { InventoryModel } from '../models/Inventory';
import { InvoiceModel } from '../models/Invoice';
import { PaymentModel } from '../models/Payment';
import { EmployeeModel } from '../models/Employee';
import { ExpenseModel } from '../models/Expense';
import { SpareIssueModel } from '../models/SpareIssue';
import { ProductMasterModel } from '../models/ProductMaster';
import { connectDB } from '../config/db';

export const clearAllDataCollections = async () => {
  try {
    console.log('[Database Cleaner] Clearing all sample data from MongoDB Atlas...');
    await CustomerModel.deleteMany({});
    await ComplaintModel.deleteMany({});
    await ServiceTicketModel.deleteMany({});
    await AMCContractModel.deleteMany({});
    await LeadModel.deleteMany({});
    await InventoryModel.deleteMany({});
    await InvoiceModel.deleteMany({});
    await PaymentModel.deleteMany({});
    await EmployeeModel.deleteMany({});
    await ExpenseModel.deleteMany({});
    await SpareIssueModel.deleteMany({});
    await ProductMasterModel.deleteMany({});
    console.log('[Database Cleaner] All collections are now 0 and empty! Clean slate active.');
  } catch (err: any) {
    console.error('[Database Cleaner] Error clearing database:', err.message);
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await clearAllDataCollections();
    process.exit(0);
  });
}
