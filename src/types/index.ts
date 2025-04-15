export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName?: string | null;
  propertyAddress?: string | null;
  unitNumber?: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  depositAmount: number;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
  managerId?: string;
  userId?: string;  // Add userId field
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units: number;
  type: 'apartment' | 'house' | 'duplex' | 'commercial';
  image?: string;
  tenantCount?: number;
  occupancyRate?: number;
  managerId?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName?: string;
  propertyId?: string | null;
  propertyName?: string | null;
  unitNumber?: string | null;
  amount: number;
  date: string;
  method: 'cash' | 'check' | 'bank transfer' | 'credit card';
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  managerId?: string;
}

export interface Maintenance {
  id: string;
  propertyId: string;
  propertyName?: string;
  tenantId: string;
  tenantName?: string;
  tenantEmail?: string | null;
  unitNumber?: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dateSubmitted: string;
  dateCompleted?: string;
  assignedTo?: string;
  cost?: number;
  managerId?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'lease' | 'payment' | 'maintenance' | 'other';
  tenantId?: string;
  tenantName?: string;
  propertyId?: string;
  propertyName?: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  url: string;
  managerId?: string;
}
