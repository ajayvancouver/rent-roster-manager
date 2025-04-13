
import { Property, Tenant, Payment, Maintenance, Document } from '@/types';

export const properties: Property[] = [
  {
    id: '1',
    name: 'Bayview Apartments',
    address: '123 Bayview St',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    units: 12,
    type: 'apartment',
    image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Oakwood Heights',
    address: '456 Oak Avenue',
    city: 'Portland',
    state: 'OR',
    zipCode: '97204',
    units: 8,
    type: 'apartment',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Cedar Hills Duplex',
    address: '789 Cedar Road',
    city: 'Bellevue',
    state: 'WA',
    zipCode: '98004',
    units: 2,
    type: 'duplex',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Pinecrest House',
    address: '101 Pine Street',
    city: 'Tacoma',
    state: 'WA',
    zipCode: '98402',
    units: 1,
    type: 'house',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=500&auto=format&fit=crop'
  },
];

export const tenants: Tenant[] = [
  {
    id: '1',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    phone: '(206) 555-1234',
    propertyId: '1',
    unitNumber: '101',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-05-31',
    rentAmount: 1500,
    depositAmount: 1500,
    balance: 0,
    status: 'active'
  },
  {
    id: '2',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    phone: '(206) 555-5678',
    propertyId: '1',
    unitNumber: '102',
    leaseStart: '2023-01-15',
    leaseEnd: '2024-01-14',
    rentAmount: 1450,
    depositAmount: 1450,
    balance: 450,
    status: 'active'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '(503) 555-9012',
    propertyId: '2',
    unitNumber: '3A',
    leaseStart: '2023-03-01',
    leaseEnd: '2024-02-29',
    rentAmount: 1350,
    depositAmount: 1350,
    balance: 0,
    status: 'active'
  },
  {
    id: '4',
    name: 'Sophie Martinez',
    email: 'sophie.m@example.com',
    phone: '(425) 555-3456',
    propertyId: '3',
    unitNumber: 'A',
    leaseStart: '2023-08-15',
    leaseEnd: '2024-08-14',
    rentAmount: 1800,
    depositAmount: 1800,
    balance: 1800,
    status: 'active'
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '(253) 555-7890',
    propertyId: '4',
    leaseStart: '2023-05-01',
    leaseEnd: '2024-04-30',
    rentAmount: 2200,
    depositAmount: 2200,
    balance: 0,
    status: 'active'
  },
];

export const payments: Payment[] = [
  {
    id: '1',
    tenantId: '1',
    amount: 1500,
    date: '2024-04-01',
    method: 'bank transfer',
    status: 'completed',
    notes: 'April rent'
  },
  {
    id: '2',
    tenantId: '1',
    amount: 1500,
    date: '2024-03-01',
    method: 'bank transfer',
    status: 'completed',
    notes: 'March rent'
  },
  {
    id: '3',
    tenantId: '2',
    amount: 1000,
    date: '2024-04-03',
    method: 'credit card',
    status: 'completed',
    notes: 'Partial April rent'
  },
  {
    id: '4',
    tenantId: '3',
    amount: 1350,
    date: '2024-04-01',
    method: 'check',
    status: 'completed',
    notes: 'April rent'
  },
  {
    id: '5',
    tenantId: '4',
    amount: 0,
    date: '2024-04-05',
    method: 'cash',
    status: 'pending',
    notes: 'April rent - payment pending'
  },
  {
    id: '6',
    tenantId: '5',
    amount: 2200,
    date: '2024-04-01',
    method: 'bank transfer',
    status: 'completed',
    notes: 'April rent'
  },
];

export const maintenanceRequests: Maintenance[] = [
  {
    id: '1',
    propertyId: '1',
    tenantId: '1',
    title: 'Leaking faucet in bathroom',
    description: 'The bathroom sink faucet is constantly dripping.',
    priority: 'medium',
    status: 'completed',
    dateSubmitted: '2024-03-15',
    dateCompleted: '2024-03-17',
    assignedTo: 'John Maintenance',
    cost: 75
  },
  {
    id: '2',
    propertyId: '1',
    tenantId: '2',
    title: 'Heating not working properly',
    description: 'The heating system is not maintaining temperature consistently.',
    priority: 'high',
    status: 'in-progress',
    dateSubmitted: '2024-04-02',
    assignedTo: 'HVAC Services Inc.'
  },
  {
    id: '3',
    propertyId: '2',
    tenantId: '3',
    title: 'Broken window blinds',
    description: 'The blinds in the living room are broken and need replacement.',
    priority: 'low',
    status: 'pending',
    dateSubmitted: '2024-04-05'
  },
  {
    id: '4',
    propertyId: '3',
    tenantId: '4',
    title: 'Clogged kitchen sink',
    description: 'Kitchen sink is draining very slowly.',
    priority: 'medium',
    status: 'pending',
    dateSubmitted: '2024-04-10'
  },
  {
    id: '5',
    propertyId: '4',
    tenantId: '5',
    title: 'Roof leak in master bedroom',
    description: 'Water is coming through the ceiling during heavy rain.',
    priority: 'emergency',
    status: 'in-progress',
    dateSubmitted: '2024-04-08',
    assignedTo: 'Quick Roof Repair LLC'
  },
];

export const documents: Document[] = [
  {
    id: '1',
    name: 'Lease Agreement - James Wilson',
    type: 'lease',
    tenantId: '1',
    propertyId: '1',
    uploadDate: '2023-05-25',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    url: '#'
  },
  {
    id: '2',
    name: 'Lease Agreement - Emily Chen',
    type: 'lease',
    tenantId: '2',
    propertyId: '1',
    uploadDate: '2022-12-28',
    fileSize: '1.1 MB',
    fileType: 'PDF',
    url: '#'
  },
  {
    id: '3',
    name: 'Property Insurance - Bayview Apartments',
    type: 'other',
    propertyId: '1',
    uploadDate: '2023-01-15',
    fileSize: '3.4 MB',
    fileType: 'PDF',
    url: '#'
  },
  {
    id: '4',
    name: 'Maintenance Invoice - Plumbing',
    type: 'maintenance',
    propertyId: '1',
    tenantId: '1',
    uploadDate: '2024-03-18',
    fileSize: '850 KB',
    fileType: 'PDF',
    url: '#'
  },
  {
    id: '5',
    name: 'Payment Receipt - March 2024',
    type: 'payment',
    tenantId: '1',
    uploadDate: '2024-03-01',
    fileSize: '420 KB',
    fileType: 'PDF',
    url: '#'
  },
];

// Total stats
export const getStats = () => {
  const totalProperties = properties.length;
  const totalTenants = tenants.length;
  const totalUnits = properties.reduce((sum, property) => sum + property.units, 0);
  const occupiedUnits = tenants.filter(tenant => tenant.status === 'active').length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  
  const totalRent = tenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0);
  const outstandingBalance = tenants.reduce((sum, tenant) => sum + tenant.balance, 0);
  const collectionRate = Math.round(((totalRent - outstandingBalance) / totalRent) * 100);
  
  const pendingMaintenance = maintenanceRequests.filter(req => req.status === 'pending' || req.status === 'in-progress').length;
  
  return {
    totalProperties,
    totalTenants,
    totalUnits,
    occupiedUnits,
    occupancyRate,
    totalRent,
    outstandingBalance,
    collectionRate,
    pendingMaintenance
  };
};
