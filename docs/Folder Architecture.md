# Folder Architecture - ServeWell CRM

```
CRM-development/
├── client/
│   ├── src/
│   │   ├── api/             # Axios client instance & interceptors
│   │   ├── components/      # Reusable UI (DataTable, StatsCard, Modal, ConfirmDialog, StatusBadge, PageHeader)
│   │   ├── context/         # AuthContext with JWT session management
│   │   ├── layouts/         # DashboardLayout & Sidebar with nested navigation
│   │   ├── pages/           # Module Views
│   │   │   ├── admin/       # UsersListPage, SettingsPage
│   │   │   ├── amc/         # AMCListPage, AMCCreatePage
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── complaints/  # ComplaintListPage, ComplaintCreatePage
│   │   │   ├── customers/   # CustomerListPage, CustomerCreatePage
│   │   │   ├── dashboard/   # DashboardPage
│   │   │   ├── finance/     # InvoicesListPage, PaymentsListPage
│   │   │   ├── hr/          # EmployeeListPage, EmployeeCreatePage
│   │   │   ├── inventory/   # InventoryListPage, InventoryCreatePage
│   │   │   ├── portal/      # CustomerPortalPage
│   │   │   ├── reports/     # ReportsPage
│   │   │   ├── sales/       # LeadsListPage, LeadCreatePage, QuotationsPage
│   │   │   ├── service/     # ServiceListPage, ServiceCreatePage
│   │   │   └── technician/  # TechnicianCallsPage
│   │   ├── App.tsx          # Router definitions & protected routes
│   │   ├── main.tsx         # Vite DOM mount
│   │   └── index.css        # Glassmorphism design tokens & tailwind base
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/          # DB Mongoose connection setup
│   │   ├── controllers/     # Controller logic per feature module
│   │   ├── middlewares/     # Auth JWT & Role-Based authorization
│   │   ├── models/          # 11 Mongoose Schemas with strict indexing
│   │   ├── routes/          # Express Router endpoints
│   │   ├── utils/           # Seeder script & PDFKit generator engine
│   │   └── server.ts        # Express app entry & Socket.io server
│   ├── package.json
│   └── tsconfig.json
├── shared/
│   └── index.ts             # Shared enums (UserRole, Priority, Statuses) & interfaces
└── docs/                    # Technical documentation
```
