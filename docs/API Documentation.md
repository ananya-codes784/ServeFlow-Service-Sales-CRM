# API Documentation - ServeWell CRM

Base URL: `http://localhost:5000/api/v1`

## 1. Authentication (`/auth`)
- `POST /auth/register`: Create user account.
- `POST /auth/login`: Authenticate and receive JWT token.
- `GET /auth/profile`: Get current user profile (Requires Bearer token).
- `PUT /auth/profile`: Update user profile details.

## 2. Customer Management (`/customers`)
- `GET /customers`: List customers with pagination & search filtering.
- `GET /customers/:id`: Get customer profile & installed products.
- `POST /customers`: Create customer entry.
- `PUT /customers/:id`: Update customer details.
- `DELETE /customers/:id`: Delete customer record (Admin only).

## 3. Complaints & Breakdown Tickets (`/complaints`)
- `GET /complaints`: List all breakdown tickets.
- `GET /complaints/stats`: Get breakdown ticket count metrics.
- `POST /complaints`: Raise new breakdown complaint ticket.
- `PUT /complaints/:id`: Update complaint status & assign technician.

## 4. Service Management (`/services`)
- `GET /services`: List scheduled service tickets.
- `POST /services`: Create service call entry.
- `PUT /services/:id`: Update service checklist & status.

## 5. AMC Contracts (`/amc`)
- `GET /amc`: List Annual Maintenance Contracts.
- `GET /amc/expiring`: Get contracts expiring within 30 days.
- `POST /amc`: Create AMC contract entry.

## 6. Sales CRM (`/sales`)
- `GET /sales/leads`: List sales pipeline leads.
- `POST /sales/leads`: Create sales lead entry.
- `POST /sales/leads/:id/follow-up`: Log lead follow-up.
- `GET /sales/quotations`: List sales price quotations.
- `POST /sales/quotations`: Create printable quotation.

## 7. Inventory & Spares (`/inventory`)
- `GET /inventory`: List spare parts and product stock.
- `GET /inventory/low-stock`: Get items below reorder threshold.
- `POST /inventory`: Add new inventory item.

## 8. Finance & Invoices (`/finance`)
- `GET /finance/invoices`: List billing invoices.
- `GET /finance/invoices/:id/pdf`: Download formatted invoice PDF buffer.
- `POST /finance/invoices/:id/payment`: Record customer payment transaction.
- `GET /finance/revenue-stats`: Financial revenue breakdown stats.

## 9. HR Management (`/hr`)
- `GET /hr`: List employees directory.
- `POST /hr`: Add employee record.
- `GET /hr/technicians`: Query active field technicians for assignment.

## 10. Dashboard & Admin (`/dashboard`, `/admin`)
- `GET /dashboard/admin`: Consolidated multi-module analytics dashboard.
- `GET /admin/users`: User accounts management list (Admin only).
- `GET /admin/settings`: Retrieve company profile settings.
- `PUT /admin/settings`: Update tax rates & company settings.
