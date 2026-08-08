// Shared Types and Enums for ServeWell CRM

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  CUSTOMER = 'CUSTOMER',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ComplaintStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_SPARES = 'PENDING_SPARES',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export enum ServiceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  WORK_IN_PROGRESS = 'WORK_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AMCStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING_RENEWAL = 'PENDING_RENEWAL',
  TERMINATED = 'TERMINATED',
}

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum InventoryCategory {
  PRODUCT = 'PRODUCT',
  SPARE_PART = 'SPARE_PART',
  CONSUMABLE = 'CONSUMABLE',
  TOOL = 'TOOL',
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: string;
}

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
}

export interface CustomerSummary {
  _id: string;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeComplaints: number;
  pendingServices: number;
  activeContracts: number;
  totalLeads: number;
  monthlyRevenue: number;
  resolvedCallsToday: number;
  techniciansOnField: number;
}
