
export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  unitNumber?: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  depositAmount: number;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
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
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  method: 'cash' | 'check' | 'bank transfer' | 'credit card';
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

export interface Maintenance {
  id: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dateSubmitted: string;
  dateCompleted?: string;
  assignedTo?: string;
  cost?: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'lease' | 'payment' | 'maintenance' | 'other';
  tenantId?: string;
  propertyId?: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  url: string;
}
