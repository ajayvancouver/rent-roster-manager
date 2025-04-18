
import { Property, Tenant, Payment, Maintenance, Document } from "@/types";

export const transformProperties = (propertiesData: any[]): Property[] => {
  return (propertiesData || []).map(property => ({
    id: property.id,
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zip_code,
    units: property.units,
    type: property.type as 'apartment' | 'house' | 'duplex' | 'commercial',
    image: property.image,
    managerId: property.manager_id
  }));
};

export const transformTenants = (tenantsData: any[], properties: Property[]): Tenant[] => {
  return (tenantsData || []).map(tenant => {
    const propertyInfo = properties.find(p => p.id === tenant.property_id);
    
    return {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone || '',
      propertyId: tenant.property_id || '',
      propertyName: propertyInfo?.name || null,
      propertyAddress: propertyInfo ? `${propertyInfo.address}, ${propertyInfo.city}, ${propertyInfo.state} ${propertyInfo.zipCode}` : null,
      unitNumber: tenant.unit_number || '',
      leaseStart: tenant.lease_start,
      leaseEnd: tenant.lease_end,
      rentAmount: tenant.rent_amount,
      depositAmount: tenant.deposit_amount,
      balance: tenant.balance || 0,
      status: tenant.status as 'active' | 'inactive' | 'pending',
      userId: tenant.tenant_user_id,
      managerId: propertyInfo?.managerId || null
    };
  });
};

export const transformPayments = (paymentsData: any[], tenants: Tenant[]): Payment[] => {
  return (paymentsData || []).map(payment => {
    const tenant = tenants.find(t => t.id === payment.tenant_id);
    
    return {
      id: payment.id,
      tenantId: payment.tenant_id,
      tenantName: tenant?.name || null,
      propertyId: tenant?.propertyId || null,
      propertyName: tenant?.propertyName || null,
      unitNumber: tenant?.unitNumber || '',
      amount: payment.amount,
      date: payment.date,
      method: payment.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: payment.status as 'pending' | 'completed' | 'failed',
      notes: payment.notes || '',
      managerId: tenant?.managerId || null
    };
  });
};

export const transformMaintenance = (maintenanceData: any[], properties: Property[], tenants: Tenant[]): Maintenance[] => {
  return (maintenanceData || []).map(request => {
    const property = properties.find(p => p.id === request.property_id);
    const tenant = tenants.find(t => t.id === request.tenant_id);
    
    return {
      id: request.id,
      propertyId: request.property_id,
      propertyName: property?.name || null,
      tenantId: request.tenant_id,
      tenantName: tenant?.name || null,
      tenantEmail: tenant?.email || null,
      unitNumber: tenant?.unitNumber || null,
      title: request.title,
      description: request.description,
      priority: request.priority as 'low' | 'medium' | 'high' | 'emergency',
      status: request.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      dateSubmitted: request.date_submitted,
      dateCompleted: request.date_completed,
      assignedTo: request.assigned_to,
      cost: request.cost,
      managerId: property?.managerId || null
    };
  });
};

export const transformDocuments = (documentsData: any[], properties: Property[], tenants: Tenant[]): Document[] => {
  return (documentsData || []).map(document => {
    const property = properties.find(p => p.id === document.property_id);
    const tenant = tenants.find(t => t.id === document.tenant_id);
    
    return {
      id: document.id,
      name: document.name,
      type: document.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: document.tenant_id,
      tenantName: tenant?.name || null,
      propertyId: document.property_id,
      propertyName: property?.name || null,
      uploadDate: document.upload_date,
      fileSize: document.file_size,
      fileType: document.file_type,
      url: document.url,
      managerId: property?.managerId || tenant?.managerId || null
    };
  });
};
