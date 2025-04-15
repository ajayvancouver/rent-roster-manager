import { Payment, Tenant, Property, Maintenance, Document } from "@/types";

// Function to create relationship maps for quick lookups
export function createTenantPropertyMap(tenants: Tenant[]) {
  const tenantMap = new Map<string, Tenant>();
  const propertyTenantMap = new Map<string, string[]>();
  
  tenants.forEach(tenant => {
    tenantMap.set(tenant.id, tenant);
    
    if (tenant.propertyId) {
      const tenantIds = propertyTenantMap.get(tenant.propertyId) || [];
      propertyTenantMap.set(tenant.propertyId, [...tenantIds, tenant.id]);
    }
  });
  
  return { tenantMap, propertyTenantMap };
}

// Function to get statistical data for dashboard
export function getDashboardStats(
  payments: Payment[], 
  tenants: Tenant[],
  properties: Property[],
  maintenance: Maintenance[]
) {
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const totalUnits = properties.reduce((total, p) => total + p.units, 0);
  const vacantUnits = totalUnits - activeTenants;
  
  const totalRent = tenants
    .filter(t => t.status === 'active')
    .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
  
  const collectedRent = payments && payments.length > 0 
    ? payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;
  
  const pendingMaintenance = maintenance 
    ? maintenance.filter(m => m.status === 'pending' || m.status === 'in-progress').length
    : 0;
  
  const occupancyRate = totalUnits > 0 
    ? Math.round((activeTenants / totalUnits) * 100) 
    : 0;
  
  // Calculate collection rate with a cap for display purposes
  const rawCollectionRate = totalRent > 0 ? (collectedRent / totalRent) * 100 : 0;
  const collectionRate = Math.round(rawCollectionRate);
  
  // Calculate the outstanding balance (negative means overpayment)
  const outstandingBalance = totalRent - collectedRent;
  
  return {
    activeTenants,
    vacantUnits,
    totalRent,
    collectedRent,
    pendingMaintenance,
    occupancyRate,
    collectionRate,
    outstandingBalance
  };
}

// Helper function to generate status badges
export function getStatusColorClass(
  type: 'payment' | 'tenant' | 'maintenance',
  status: string
): string {
  if (type === 'payment') {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  } else if (type === 'tenant') {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  } else if (type === 'maintenance') {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

// Function to format currency
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0';
  }
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Function to format date consistently across the app
export function formatDate(dateString: string, includeYear = true): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: includeYear ? 'numeric' : undefined
    });
  } catch (error) {
    return 'Invalid date';
  }
}
