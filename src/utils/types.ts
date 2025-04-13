
import { Payment, Tenant, Property, Maintenance, Document } from "@/types";

// Define interfaces for connected data
export interface ConnectedPayment extends Payment {
  tenantDetails?: Tenant;
  propertyDetails?: Property;
}

export interface ConnectedTenant extends Tenant {
  propertyDetails?: Property;
  payments?: Payment[];
  maintenanceRequests?: Maintenance[];
  documents?: Document[];
}

export interface ConnectedProperty extends Property {
  tenants?: Tenant[];
  maintenanceRequests?: Maintenance[];
  documents?: Document[];
  occupancyRate?: number;
  vacantUnits?: number;
}

export interface ConnectedMaintenance extends Maintenance {
  tenantDetails?: Tenant;
  propertyDetails?: Property;
}

export interface ConnectedDocument extends Document {
  tenantDetails?: Tenant;
  propertyDetails?: Property;
}

// Define utility functions to connect data
export function connectPayment(
  payment: Payment,
  tenants: Tenant[],
  properties: Property[]
): ConnectedPayment {
  const tenant = tenants.find(t => t.id === payment.tenantId);
  const property = tenant ? properties.find(p => p.id === tenant.propertyId) : undefined;
  
  return {
    ...payment,
    tenantDetails: tenant,
    propertyDetails: property
  };
}

export function connectTenant(
  tenant: Tenant,
  properties: Property[],
  payments: Payment[],
  maintenance: Maintenance[],
  documents: Document[]
): ConnectedTenant {
  const property = properties.find(p => p.id === tenant.propertyId);
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  const tenantMaintenance = maintenance.filter(m => m.tenantId === tenant.id);
  const tenantDocuments = documents.filter(d => d.tenantId === tenant.id);
  
  return {
    ...tenant,
    propertyDetails: property,
    payments: tenantPayments,
    maintenanceRequests: tenantMaintenance,
    documents: tenantDocuments
  };
}

export function connectProperty(
  property: Property,
  tenants: Tenant[],
  maintenance: Maintenance[],
  documents: Document[]
): ConnectedProperty {
  const propertyTenants = tenants.filter(t => t.propertyId === property.id);
  const propertyMaintenance = maintenance.filter(m => m.propertyId === property.id);
  const propertyDocuments = documents.filter(d => d.propertyId === property.id);
  
  const activeTenants = propertyTenants.filter(t => t.status === 'active').length;
  const occupancyRate = property.units > 0 ? Math.round((activeTenants / property.units) * 100) : 0;
  const vacantUnits = property.units - activeTenants;
  
  return {
    ...property,
    tenants: propertyTenants,
    maintenanceRequests: propertyMaintenance,
    documents: propertyDocuments,
    occupancyRate,
    vacantUnits
  };
}
