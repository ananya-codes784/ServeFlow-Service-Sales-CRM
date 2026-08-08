import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomerListPage from './pages/customers/CustomerListPage';
import CustomerCreatePage from './pages/customers/CustomerCreatePage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import ComplaintListPage from './pages/complaints/ComplaintListPage';
import ComplaintCreatePage from './pages/complaints/ComplaintCreatePage';
import ServiceListPage from './pages/service/ServiceListPage';
import ServiceCreatePage from './pages/service/ServiceCreatePage';
import AMCListPage from './pages/amc/AMCListPage';
import AMCCreatePage from './pages/amc/AMCCreatePage';
import LeadsListPage from './pages/sales/LeadsListPage';
import LeadCreatePage from './pages/sales/LeadCreatePage';
import QuotationsPage from './pages/sales/QuotationsPage';
import TechnicianCallsPage from './pages/technician/TechnicianCallsPage';
import InventoryListPage from './pages/inventory/InventoryListPage';
import InventoryCreatePage from './pages/inventory/InventoryCreatePage';
import SpareIssuePage from './pages/inventory/SpareIssuePage';
import ProductMasterPage from './pages/inventory/ProductMasterPage';
import InvoicesListPage from './pages/finance/InvoicesListPage';
import PaymentsListPage from './pages/finance/PaymentsListPage';
import ExpensesPage from './pages/finance/ExpensesPage';
import EmployeeListPage from './pages/hr/EmployeeListPage';
import EmployeeCreatePage from './pages/hr/EmployeeCreatePage';
import ReportsPage from './pages/reports/ReportsPage';
import UsersListPage from './pages/admin/UsersListPage';
import SettingsPage from './pages/admin/SettingsPage';
import CustomerPortalPage from './pages/portal/CustomerPortalPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import CallSummaryPage from './pages/service/CallSummaryPage';
import LeaveManagementPage from './pages/hr/LeaveManagementPage';
import ContactBookPage from './pages/customers/ContactBookPage';
import MsgTemplatePage from './pages/admin/MsgTemplatePage';
import GpsTrackerPage from './pages/technician/GpsTrackerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading auth...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Main CRM Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Customers */}
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/create" element={<CustomerCreatePage />} />
              <Route path="customers/contact-book" element={<ContactBookPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />

              {/* Complaints */}
              <Route path="complaints" element={<ComplaintListPage />} />
              <Route path="complaints/create" element={<ComplaintCreatePage />} />

              {/* Service */}
              <Route path="services" element={<ServiceListPage />} />
              <Route path="services/create" element={<ServiceCreatePage />} />
              <Route path="services/call-summary" element={<CallSummaryPage />} />

              {/* AMC */}
              <Route path="amc" element={<AMCListPage />} />
              <Route path="amc/create" element={<AMCCreatePage />} />

              {/* Sales CRM */}
              <Route path="sales/leads" element={<LeadsListPage />} />
              <Route path="sales/leads/create" element={<LeadCreatePage />} />
              <Route path="sales/quotations" element={<QuotationsPage />} />

              {/* Technician */}
              <Route path="technician/calls" element={<TechnicianCallsPage />} />
              <Route path="technician/gps" element={<GpsTrackerPage />} />

              {/* Inventory */}
              <Route path="inventory" element={<InventoryListPage />} />
              <Route path="inventory/create" element={<InventoryCreatePage />} />
              <Route path="inventory/spare-issues" element={<SpareIssuePage />} />
              <Route path="inventory/products-master" element={<ProductMasterPage />} />

              {/* Finance */}
              <Route path="finance/invoices" element={<InvoicesListPage />} />
              <Route path="finance/payments" element={<PaymentsListPage />} />
              <Route path="finance/expenses" element={<ExpensesPage />} />

              {/* HR */}
              <Route path="hr/employees" element={<EmployeeListPage />} />
              <Route path="hr/employees/create" element={<EmployeeCreatePage />} />
              <Route path="hr/leave" element={<LeaveManagementPage />} />

              {/* Reports */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Admin */}
              <Route path="admin/users" element={<UsersListPage />} />
              <Route path="admin/settings" element={<SettingsPage />} />
              <Route path="admin/msg-templates" element={<MsgTemplatePage />} />

              {/* Customer Portal */}
              <Route path="portal" element={<CustomerPortalPage />} />

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              {/* Notifications */}
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
