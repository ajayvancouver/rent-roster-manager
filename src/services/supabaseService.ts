
import { supabase } from "@/integrations/supabase/client";
import { Property, Tenant, Payment, Maintenance, Document } from "@/types";

// Properties Service
export const propertiesService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(property: Omit<Property, 'id'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Tenants Service
export const tenantsService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(tenant: Omit<Tenant, 'id'>): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Similar services can be created for Payments, Maintenance, and Documents
export const paymentsService = {
  async getByTenantId(tenantId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return data || [];
  }
};

export const maintenanceService = {
  async getByTenantId(tenantId: string): Promise<Maintenance[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return data || [];
  }
};

export const documentsService = {
  async getByTenantId(tenantId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return data || [];
  }
};
