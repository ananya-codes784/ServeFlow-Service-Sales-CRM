# Database Schema - ServeWell CRM

Database Engine: MongoDB / Mongoose ODM

## Core Entities & Collections

### 1. `users`
- `name`: String (Required)
- `email`: String (Unique, Indexed)
- `passwordHash`: String (Required)
- `role`: Enum (`ADMIN`, `MANAGER`, `TECHNICIAN`, `CUSTOMER`)
- `phone`: String
- `department`: String
- `isActive`: Boolean (Default: `true`)

### 2. `customers`
- `customerCode`: String (Unique, e.g. `CUST-1001`)
- `companyName`: String (Required)
- `contactPerson`: String (Required)
- `email`: String (Required)
- `phone`: String (Required)
- `address`, `city`, `state`, `pincode`: String
- `category`: Enum (`REGULAR`, `VIP`, `ENTERPRISE`, `GOVERNMENT`)
- `installedProducts`: Subdocument Array `[{ productName, serialNumber, installationDate, warrantyEnd }]`

### 3. `complaints`
- `ticketNumber`: String (Unique, e.g. `TKT-2026-001`)
- `customerId`: ObjectId (Ref: `Customer`)
- `customerName`: String
- `productName`, `serialNumber`: String
- `category`: String
- `subject`, `description`: String
- `priority`: Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `status`: Enum (`NEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
- `assignedTechnicianId`: ObjectId (Ref: `User`)
- `timeline`: Subdocument Array `[{ status, comment, updatedBy, timestamp }]`

### 4. `amccontracts`
- `contractNumber`: String (Unique, e.g. `AMC-2026-901`)
- `customerId`: ObjectId (Ref: `Customer`)
- `planName`: String
- `startDate`, `endDate`: Date
- `contractValue`: Number
- `visitsPerYear`, `visitsCompleted`: Number
- `status`: Enum (`ACTIVE`, `EXPIRED`, `PENDING_RENEWAL`)

### 5. `leads` & `quotations`
- `leadNumber`: String
- `companyName`, `contactPerson`, `email`, `phone`: String
- `stage`: Enum (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `NEGOTIATION`, `WON`, `LOST`)
- `dealValue`: Number
- `followUps`: Subdocument Array `[{ date, note, createdBy }]`

### 6. `inventories`
- `sku`: String (Unique)
- `name`: String
- `category`: Enum (`SPARE_PART`, `PRODUCT`, `CONSUMABLE`, `TOOL`)
- `quantity`, `unitPrice`, `reorderLevel`: Number
- `vendorName`: String

### 7. `invoices` & `payments`
- `invoiceNumber`: String (Unique)
- `customerId`: ObjectId (Ref: `Customer`)
- `items`: Subdocument Array `[{ description, quantity, unitPrice, amount }]`
- `subtotal`, `taxAmount`, `totalAmount`, `paidAmount`: Number
- `paymentStatus`: Enum (`UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`)
