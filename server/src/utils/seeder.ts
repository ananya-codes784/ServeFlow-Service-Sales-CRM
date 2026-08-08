import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { CustomerModel } from '../models/Customer';
import { ComplaintModel } from '../models/Complaint';
import { ServiceTicketModel } from '../models/ServiceTicket';
import { AMCContractModel } from '../models/AMCContract';
import { LeadModel } from '../models/Lead';
import { InventoryModel } from '../models/Inventory';
import { InvoiceModel } from '../models/Invoice';
import { PaymentModel } from '../models/Payment';
import { EmployeeModel } from '../models/Employee';
import { SystemSettingModel } from '../models/SystemSetting';
import { ExpenseModel } from '../models/Expense';
import { SpareIssueModel } from '../models/SpareIssue';
import { ProductMasterModel } from '../models/ProductMaster';
import { UserRole, Priority, ComplaintStatus, ServiceStatus, AMCStatus, LeadStage, PaymentStatus, InventoryCategory } from '../shared';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting data population...');

    if (mongoose.connection.readyState !== 1) {
      console.warn('[Seeder] MongoDB is not connected. Please ensure MongoDB server is running to seed database.');
      return;
    }

    // Password hash for all seeded users: "Password123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    // 1. Clear existing collections
    await UserModel.deleteMany({});
    await CustomerModel.deleteMany({});
    await ComplaintModel.deleteMany({});
    await ServiceTicketModel.deleteMany({});
    await AMCContractModel.deleteMany({});
    await LeadModel.deleteMany({});
    await InventoryModel.deleteMany({});
    await InvoiceModel.deleteMany({});
    await PaymentModel.deleteMany({});
    await EmployeeModel.deleteMany({});
    await SystemSettingModel.deleteMany({});

    // 2. Seed Users
    const adminUser = await UserModel.create({
      name: 'System Admin',
      email: 'admin@servewell.com',
      passwordHash,
      role: UserRole.ADMIN,
      phone: '+1 800-555-0199',
      department: 'Executive Management',
    });

    const managerUser = await UserModel.create({
      name: 'Sarah Jenkins',
      email: 'manager@servewell.com',
      passwordHash,
      role: UserRole.MANAGER,
      phone: '+1 800-555-0144',
      department: 'Service Operations',
    });

    const tech1 = await UserModel.create({
      name: 'Alex Rivera',
      email: 'tech1@servewell.com',
      passwordHash,
      role: UserRole.TECHNICIAN,
      phone: '+1 800-555-0822',
      department: 'Field Engineering',
    });

    const tech2 = await UserModel.create({
      name: 'David Chen',
      email: 'tech2@servewell.com',
      passwordHash,
      role: UserRole.TECHNICIAN,
      phone: '+1 800-555-0833',
      department: 'Field Engineering',
    });

    const customerUser = await UserModel.create({
      name: 'Robert Vance (Apex Industries)',
      email: 'customer@servewell.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      phone: '+1 800-555-9000',
      department: 'Customer Portal',
    });

    console.log('[Seeder] Users created successfully.');

    // 3. Seed Customers
    const customer1 = await CustomerModel.create({
      customerCode: 'CUST-1001',
      companyName: 'Apex Industrial Corp',
      contactPerson: 'Robert Vance',
      email: 'customer@servewell.com',
      phone: '+1 800-555-9000',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      pincode: '62701',
      gstNumber: '27AAACA12341ZX',
      category: 'ENTERPRISE',
      userId: customerUser._id,
      installedProducts: [
        {
          productName: 'Heavy Duty Compressor X5',
          serialNumber: 'SN-COMP-9912',
          installationDate: new Date('2024-01-15'),
          warrantyEnd: new Date('2026-01-15'),
          modelNumber: 'HDX5-2024',
        },
        {
          productName: 'Chiller Unit Pro 4000',
          serialNumber: 'SN-CHIL-3321',
          installationDate: new Date('2023-06-10'),
          warrantyEnd: new Date('2025-06-10'),
          modelNumber: 'CUP-4K',
        },
      ],
    });

    const customer2 = await CustomerModel.create({
      customerCode: 'CUST-1002',
      companyName: 'BioHealth Pharma Solutions',
      contactPerson: 'Dr. Elena Rostova',
      email: 'elena@biohealth.org',
      phone: '+1 800-555-7711',
      address: '500 Science Drive, Lab B',
      city: 'Boston',
      state: 'MA',
      pincode: '02108',
      gstNumber: '25BBBBB56782ZY',
      category: 'VIP',
      installedProducts: [
        {
          productName: 'Precision Centrifuge V2',
          serialNumber: 'SN-CENT-8821',
          installationDate: new Date('2023-11-20'),
          warrantyEnd: new Date('2025-11-20'),
          modelNumber: 'PCV2-LAB',
        },
      ],
    });

    const customer3 = await CustomerModel.create({
      customerCode: 'CUST-1003',
      companyName: 'Metro Logistics Hub',
      contactPerson: 'Marcus Brody',
      email: 'marcus@metrologistics.com',
      phone: '+1 800-555-4433',
      address: '120 Cargo Terminal Way',
      city: 'Chicago',
      state: 'IL',
      pincode: '60607',
      category: 'REGULAR',
      installedProducts: [],
    });

    console.log('[Seeder] Customers created successfully.');

    // 4. Seed Complaints
    const comp1 = await ComplaintModel.create({
      ticketNumber: 'TKT-2026-001',
      customerId: customer1._id,
      customerName: customer1.companyName,
      contactPhone: customer1.phone,
      productName: 'Heavy Duty Compressor X5',
      serialNumber: 'SN-COMP-9912',
      category: 'Pressure Failure & Overheating',
      subject: 'Compressor shutting down automatically every 20 minutes',
      description: 'System displays Error E-42 high temperature threshold reached. Immediate inspection needed.',
      priority: Priority.HIGH,
      status: ComplaintStatus.ASSIGNED,
      assignedTechnicianId: tech1._id,
      assignedTechnicianName: tech1.name,
      timeline: [
        {
          status: ComplaintStatus.NEW,
          comment: 'Ticket raised via Customer Self-Service Portal.',
          updatedBy: customerUser.name,
          timestamp: new Date(Date.now() - 86400000 * 2),
        },
        {
          status: ComplaintStatus.ASSIGNED,
          comment: `Technician ${tech1.name} assigned for onsite visit.`,
          updatedBy: managerUser.name,
          timestamp: new Date(Date.now() - 86400000 * 1),
        },
      ],
      sparesUsed: [],
    });

    const comp2 = await ComplaintModel.create({
      ticketNumber: 'TKT-2026-002',
      customerId: customer2._id,
      customerName: customer2.companyName,
      contactPhone: customer2.phone,
      productName: 'Precision Centrifuge V2',
      serialNumber: 'SN-CENT-8821',
      category: 'Calibration Error',
      subject: 'Rotor vibration exceeding tolerance limits',
      description: 'Unusual balance warning during high RPM cycles.',
      priority: Priority.URGENT,
      status: ComplaintStatus.IN_PROGRESS,
      assignedTechnicianId: tech2._id,
      assignedTechnicianName: tech2.name,
      timeline: [
        {
          status: ComplaintStatus.NEW,
          comment: 'Urgent breakdown reported via phone hotline.',
          updatedBy: managerUser.name,
          timestamp: new Date(Date.now() - 3600000 * 5),
        },
      ],
      sparesUsed: [
        { spareName: 'Vibration Damper Pad', quantity: 2, cost: 140 },
      ],
    });

    const comp3 = await ComplaintModel.create({
      ticketNumber: 'TKT-2026-003',
      customerId: customer1._id,
      customerName: customer1.companyName,
      contactPhone: customer1.phone,
      productName: 'Chiller Unit Pro 4000',
      serialNumber: 'SN-CHIL-3321',
      category: 'Routine Inspection',
      subject: 'Annual oil filter change & pressure check',
      description: 'Scheduled preventive maintenance visit.',
      priority: Priority.MEDIUM,
      status: ComplaintStatus.RESOLVED,
      assignedTechnicianId: tech1._id,
      assignedTechnicianName: tech1.name,
      resolutionNotes: 'Filter replaced, refrigerant topped up, system re-calibrated.',
      satisfactionRating: 5,
      closedAt: new Date(),
      timeline: [
        {
          status: ComplaintStatus.RESOLVED,
          comment: 'Work completed and customer signature received.',
          updatedBy: tech1.name,
          timestamp: new Date(),
        },
      ],
      sparesUsed: [{ spareName: 'Oil Filter Elements', quantity: 1, cost: 85 }],
    });

    console.log('[Seeder] Complaints created successfully.');

    // 5. Seed Service Tickets
    await ServiceTicketModel.create({
      serviceNumber: 'SRV-8801',
      complaintId: comp1._id,
      customerId: customer1._id,
      customerName: customer1.companyName,
      address: customer1.address,
      technicianId: tech1._id,
      technicianName: tech1.name,
      scheduledDate: new Date(Date.now() + 86400000),
      serviceType: 'BREAKDOWN',
      status: ServiceStatus.SCHEDULED,
      checklist: [
        { task: 'Check inlet motor voltage', isDone: true },
        { task: 'Inspect thermal sensor wiring', isDone: false },
        { task: 'Test safety cutoff valves', isDone: false },
      ],
      visitNotes: 'Technician dispatched with replacement thermal couple parts.',
    });

    console.log('[Seeder] Service tickets created.');

    // 6. Seed AMC Contracts
    await AMCContractModel.create({
      contractNumber: 'AMC-2026-901',
      customerId: customer1._id,
      customerName: customer1.companyName,
      planName: 'Gold Enterprise Shield (4 Vis/Yr)',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      contractValue: 4800,
      visitsPerYear: 4,
      visitsCompleted: 2,
      status: AMCStatus.ACTIVE,
      coveredProducts: ['Heavy Duty Compressor X5', 'Chiller Unit Pro 4000'],
    });

    await AMCContractModel.create({
      contractNumber: 'AMC-2025-402',
      customerId: customer2._id,
      customerName: customer2.companyName,
      planName: 'Platinum Care Plan',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      contractValue: 3200,
      visitsPerYear: 6,
      visitsCompleted: 6,
      status: AMCStatus.PENDING_RENEWAL,
      coveredProducts: ['Precision Centrifuge V2'],
    });

    console.log('[Seeder] AMC Contracts created.');

    // 7. Seed Leads
    await LeadModel.create({
      leadNumber: 'LEAD-101',
      companyName: 'Titan Energy Grid Systems',
      contactPerson: 'Sarah Connor',
      email: 'sconnor@titanenergy.com',
      phone: '+1 800-555-3211',
      source: 'Trade Show Expo 2026',
      stage: LeadStage.PROPOSAL_SENT,
      dealValue: 24500,
      assignedTo: managerUser.name,
      followUps: [
        {
          date: new Date(Date.now() - 86400000 * 3),
          note: 'Initial requirements gathering call completed.',
          createdBy: managerUser.name,
          nextFollowUpDate: new Date(Date.now() + 86400000 * 2),
        },
      ],
      notes: 'Customer interested in 3 units of Compressor X5 + 2yr AMC.',
    });

    await LeadModel.create({
      leadNumber: 'LEAD-102',
      companyName: 'Global Robotics Corp',
      contactPerson: 'David Miller',
      email: 'dmiller@globalrobotics.io',
      phone: '+1 800-555-8844',
      source: 'Website Enquiry',
      stage: LeadStage.QUALIFIED,
      dealValue: 18000,
      assignedTo: managerUser.name,
      followUps: [],
    });

    console.log('[Seeder] Sales Leads created.');

    // 8. Seed Inventory
    await InventoryModel.create({
      sku: 'SKU-COMP-VALVE',
      name: 'High Pressure Valve Kit',
      category: InventoryCategory.SPARE_PART,
      quantity: 45,
      unitPrice: 85,
      reorderLevel: 10,
      vendorName: 'HydraTech Dynamics',
    });

    await InventoryModel.create({
      sku: 'SKU-THERM-SENS',
      name: 'Digital Thermal Sensor Probe',
      category: InventoryCategory.SPARE_PART,
      quantity: 8,
      unitPrice: 120,
      reorderLevel: 15,
      vendorName: 'Precision Sensors Ltd',
    });

    await InventoryModel.create({
      sku: 'SKU-OIL-FLTR',
      name: 'Synthetic Oil Filter Cartridge',
      category: InventoryCategory.CONSUMABLE,
      quantity: 120,
      unitPrice: 35,
      reorderLevel: 25,
      vendorName: 'LubePro Global',
    });

    console.log('[Seeder] Inventory created.');

    // 9. Seed Invoices & Payments
    const inv1 = await InvoiceModel.create({
      invoiceNumber: 'INV-2026-001',
      customerId: customer1._id,
      customerName: customer1.companyName,
      relatedType: 'AMC',
      items: [
        {
          description: 'Gold Enterprise Shield AMC - Annual Installment',
          quantity: 1,
          unitPrice: 4800,
          amount: 4800,
        },
      ],
      subtotal: 4800,
      taxAmount: 864,
      totalAmount: 5664,
      paidAmount: 5664,
      paymentStatus: PaymentStatus.PAID,
      issueDate: new Date('2026-01-02'),
      dueDate: new Date('2026-01-16'),
    });

    await PaymentModel.create({
      paymentReference: 'PAY-90001',
      invoiceId: inv1._id,
      invoiceNumber: inv1.invoiceNumber,
      customerId: customer1._id,
      customerName: customer1.companyName,
      amount: 5664,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'TXN-BNK-881920',
      paymentDate: new Date('2026-01-05'),
    });

    const inv2 = await InvoiceModel.create({
      invoiceNumber: 'INV-2026-002',
      customerId: customer2._id,
      customerName: customer2.companyName,
      relatedType: 'SERVICE',
      items: [
        {
          description: 'Vibration Damper replacement & rotor tuning',
          quantity: 1,
          unitPrice: 350,
          amount: 350,
        },
      ],
      subtotal: 350,
      taxAmount: 63,
      totalAmount: 413,
      paidAmount: 0,
      paymentStatus: PaymentStatus.UNPAID,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 14),
    });

    console.log('[Seeder] Invoices & Payments created.');

    // 10. Seed Employees
    await EmployeeModel.create({
      employeeId: 'EMP-001',
      name: 'Alex Rivera',
      email: 'tech1@servewell.com',
      phone: '+1 800-555-0822',
      department: 'Field Engineering',
      designation: 'Senior Service Engineer',
      joiningDate: new Date('2022-03-15'),
      baseSalary: 4500,
      status: 'ACTIVE',
      attendance: [{ date: new Date(), status: 'PRESENT', checkIn: '09:00 AM' }],
    });

    await EmployeeModel.create({
      employeeId: 'EMP-002',
      name: 'David Chen',
      email: 'tech2@servewell.com',
      phone: '+1 800-555-0833',
      department: 'Field Engineering',
      designation: 'HVAC & Hydraulic Specialist',
      joiningDate: new Date('2023-01-10'),
      baseSalary: 4200,
      status: 'ACTIVE',
      attendance: [{ date: new Date(), status: 'PRESENT', checkIn: '08:45 AM' }],
    });

    // 11. Seed Product Master Catalog
    await ProductMasterModel.deleteMany({});
    await ProductMasterModel.create({
      productCode: 'PRD-2026-001',
      brand: 'Voltas',
      modelNumber: 'SAC-183V',
      name: '1.5 Ton 3 Star Inverter Split AC',
      category: 'AIR_CONDITIONER',
      capacity: '1.5 Ton',
      baseMrp: 45000,
      sellingPrice: 38500,
      hsnCode: '8415',
      warehouseLocation: 'Main Warehouse',
      shelfBinLocation: 'Rack A-2, Bin 05',
      reorderLevel: 5,
      stockQuantity: 12,
    });

    await ProductMasterModel.create({
      productCode: 'PRD-2026-002',
      brand: 'Kent',
      modelNumber: 'RO-100LPH',
      name: 'Commercial RO Water Purifier 100 LPH',
      category: 'WATER_PURIFIER',
      capacity: '100 LPH',
      baseMrp: 65000,
      sellingPrice: 54000,
      hsnCode: '8421',
      warehouseLocation: 'North Regional Hub',
      shelfBinLocation: 'Rack B-1, Bin 12',
      reorderLevel: 3,
      stockQuantity: 2,
    });

    // 12. Seed Expenses
    await ExpenseModel.deleteMany({});
    await ExpenseModel.create({
      expenseNumber: 'EXP-2026-001',
      title: 'Field Conveyance & Fuel Allowance',
      category: 'CONVEYANCE',
      amount: 1450,
      spentByUserId: tech1._id,
      spentByName: tech1.name,
      status: 'APPROVED',
      approvedBy: managerUser.name,
      notes: 'Site visit travel for TKT-2026-001 at Springfield plant',
    });

    // 13. Seed Spare Issues
    await SpareIssueModel.deleteMany({});

    // 14. System Settings
    await SystemSettingModel.deleteMany({});
    await SystemSettingModel.create({});

    console.log('[Seeder] Database Seeding Completed Successfully! All 14 modules ready.');
  } catch (error) {
    console.error('[Seeder] Seeding error:', error);
  }
};

// Run directly if invoked via CLI `npm run seed`
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}
