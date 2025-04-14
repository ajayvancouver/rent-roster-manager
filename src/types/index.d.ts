
// If this file doesn't exist, we create it
export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string | null;
  propertyAddress: string | null;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  depositAmount: number;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
  managerId: string | undefined;
  userId: string; // Add the userId field
}
