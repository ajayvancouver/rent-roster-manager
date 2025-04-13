
import { supabase } from "@/integrations/supabase/client";
import { Property, Tenant, Payment, Maintenance, Document } from "@/types";

// Properties Service
export const propertiesService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*');
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      address: item.address,
      city: item.city,
      state: item.state,
      zipCode: item.zip_code, // Map zip_code to zipCode
      units: item.units,
      type: item.type,
      image: item.image || undefined
    }));
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Map to our TypeScript interface
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code, // Map zip_code to zipCode
      units: data.units,
      type: data.type,
      image: data.image || undefined
    };
  },

  async create(property: Omit<Property, 'id'>): Promise<Property> {
    // Map our TypeScript interface to database columns
    const dbProperty = {
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zipCode, // Map zipCode to zip_code
      units: property.units,
      type: property.type,
      image: property.image
    };
    
    const { data, error } = await supabase
      .from('properties')
      .insert(dbProperty)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the response back to our TypeScript interface
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code, // Map zip_code to zipCode
      units: data.units,
      type: data.type,
      image: data.image || undefined
    };
  }
};

// Tenants Service
export const tenantsService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*');
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      propertyId: item.property_id || '', // Map property_id to propertyId
      unitNumber: item.unit_number,
      leaseStart: item.lease_start, // Map lease_start to leaseStart
      leaseEnd: item.lease_end, // Map lease_end to leaseEnd
      rentAmount: item.rent_amount, // Map rent_amount to rentAmount
      depositAmount: item.deposit_amount, // Map deposit_amount to depositAmount
      balance: item.balance || 0,
      status: item.status as 'active' | 'inactive' | 'pending'
    }));
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Map to our TypeScript interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      propertyId: data.property_id || '', // Map property_id to propertyId
      unitNumber: data.unit_number,
      leaseStart: data.lease_start, // Map lease_start to leaseStart
      leaseEnd: data.lease_end, // Map lease_end to leaseEnd
      rentAmount: data.rent_amount, // Map rent_amount to rentAmount
      depositAmount: data.deposit_amount, // Map deposit_amount to depositAmount
      balance: data.balance || 0,
      status: data.status as 'active' | 'inactive' | 'pending'
    };
  },

  async create(tenant: Omit<Tenant, 'id'>): Promise<Tenant> {
    // Map our TypeScript interface to database columns
    const dbTenant = {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      property_id: tenant.propertyId, // Map propertyId to property_id
      unit_number: tenant.unitNumber,
      lease_start: tenant.leaseStart, // Map leaseStart to lease_start
      lease_end: tenant.leaseEnd, // Map leaseEnd to lease_end
      rent_amount: tenant.rentAmount, // Map rentAmount to rent_amount
      deposit_amount: tenant.depositAmount, // Map depositAmount to deposit_amount
      balance: tenant.balance || 0,
      status: tenant.status
    };
    
    const { data, error } = await supabase
      .from('tenants')
      .insert(dbTenant)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the response back to our TypeScript interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      propertyId: data.property_id || '', // Map property_id to propertyId
      unitNumber: data.unit_number,
      leaseStart: data.lease_start, // Map lease_start to leaseStart
      leaseEnd: data.lease_end, // Map lease_end to leaseEnd
      rentAmount: data.rent_amount, // Map rent_amount to rentAmount
      depositAmount: data.deposit_amount, // Map deposit_amount to depositAmount
      balance: data.balance || 0,
      status: data.status as 'active' | 'inactive' | 'pending'
    };
  }
};

// Payments Service
export const paymentsService = {
  async getByTenantId(tenantId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      tenantId: item.tenant_id, // Map tenant_id to tenantId
      amount: item.amount,
      date: item.date,
      method: item.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: item.status as 'pending' | 'completed' | 'failed',
      notes: item.notes || undefined
    }));
  }
};

// Maintenance Service
export const maintenanceService = {
  async getByTenantId(tenantId: string): Promise<Maintenance[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      propertyId: item.property_id, // Map property_id to propertyId
      tenantId: item.tenant_id, // Map tenant_id to tenantId
      title: item.title,
      description: item.description,
      priority: item.priority as 'low' | 'medium' | 'high' | 'emergency',
      status: item.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      dateSubmitted: item.date_submitted, // Map date_submitted to dateSubmitted
      dateCompleted: item.date_completed || undefined, // Map date_completed to dateCompleted
      assignedTo: item.assigned_to || undefined,
      cost: item.cost || undefined
    }));
  }
};

// Documents Service
export const documentsService = {
  async getByTenantId(tenantId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: item.tenant_id || undefined, // Map tenant_id to tenantId
      propertyId: item.property_id || undefined, // Map property_id to propertyId
      uploadDate: item.upload_date, // Map upload_date to uploadDate
      fileSize: item.file_size, // Map file_size to fileSize
      fileType: item.file_type, // Map file_type to fileType
      url: item.url
    }));
  }
};
