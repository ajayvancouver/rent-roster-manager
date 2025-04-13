
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types";

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
      property_id: tenant.propertyId || null, // Ensure null for empty strings
      unit_number: tenant.unitNumber || null, // Also handle empty unit numbers
      lease_start: tenant.leaseStart, 
      lease_end: tenant.leaseEnd,
      rent_amount: tenant.rentAmount,
      deposit_amount: tenant.depositAmount,
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
      propertyId: data.property_id || '',
      unitNumber: data.unit_number || '',
      leaseStart: data.lease_start,
      leaseEnd: data.lease_end,
      rentAmount: data.rent_amount,
      depositAmount: data.deposit_amount,
      balance: data.balance || 0,
      status: data.status as 'active' | 'inactive' | 'pending'
    };
  }
};
