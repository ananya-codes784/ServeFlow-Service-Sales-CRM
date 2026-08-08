# ServeWell Enterprise CRM Software

ServeWell CRM is a full-featured, enterprise-grade Service & Sales CRM software built using the MERN Stack (MongoDB, Express, React, Node.js) with TypeScript, Tailwind CSS, TanStack Query, TanStack Table, Recharts, and Socket.io.

Inspired by the workflow and modules shown in **ServeWell CRM Product Tour**, this repository contains complete frontend, backend, APIs, database models, validations, and real seed data out-of-the-box.

---

## Key Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS v3/v4 + Glassmorphism enterprise design system
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query (React Query) + Axios
- **Tables & Charts**: TanStack Table v8 + Recharts
- **Icons & UI**: Lucide Icons + QRCode.react + JSPDF

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose ODM (with automatic seed runner & in-memory fallback)
- **Auth**: JWT Authentication with Role-Based Access Control (RBAC: Admin, Manager, Technician, Customer)
- **PDF & Export**: PDFKit + Excel export engine
- **Real-time**: Socket.io for live ticket updates

---

## 14 Enterprise Core Modules Included

1. **Authentication**: Login, Register, Profile, RBAC Roles (Admin, Manager, Technician, Customer).
2. **Dashboard**: Live stats cards, Recharts revenue & complaint charts, quick actions, recent breakdown tickets table.
3. **Customer Management**: Enterprise customer directory, installed products, warranty tracking, category filters.
4. **Complaint Management**: Service ticket lifecycle, priority levels, technician dispatch, timeline audit trail.
5. **Service Management**: Scheduled preventive maintenance, service tickets, technician routing.
6. **AMC Management**: Annual Maintenance Contracts, plan details, visit quotas, QR service pass generator.
7. **Sales CRM**: Lead pipeline management, deal forecasting, follow-up logs, printable sales quotations.
8. **Technician Portal**: Mobile dispatch view, GPS check-in mock, inspection checklist, on-site sign-offs.
9. **Inventory**: Spare parts master catalog, stock levels, reorder threshold alerts, vendor directory.
10. **Finance & Billing**: Invoices, payment recording, PDF invoice generation, revenue stats.
11. **HR Management**: Staff directory, field engineers listing, attendance logger, monthly salaries.
12. **Reports Engine**: SLA performance charts, date range filtering, bulk Excel & PDF export center.
13. **Administration**: User accounts management, system settings, company profile, tax configuration.
14. **Customer Portal**: Self-service breakdown reporting, AMC status overview, invoice downloads.

---

## Getting Started

### 1. Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Run Seed Data Generator

```bash
cd server
npm run seed
```

*Note: Demo login credentials created:*
- **Admin**: `admin@servewell.com` / `Password123`
- **Manager**: `manager@servewell.com` / `Password123`
- **Technician**: `tech1@servewell.com` / `Password123`
- **Customer**: `customer@servewell.com` / `Password123`

### 3. Start Application Servers

```bash
# Terminal 1 - Start Backend API Server (Port 5000)
cd server
npm run dev

# Terminal 2 - Start Frontend Vite Server (Port 3000)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
