
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types";

export const tenantsService = {
  async getAll(managerId?: string): Promise<Tenant[]> {
    let query = supabase
      .from('tenants')
      .select('*, properties(name, address, city, state, zip_code)');
    
    // If managerId is provided, filter tenants by properties with matching manager_id
    if (managerId) {
      query = query.eq('properties.manager_id', managerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      propertyId: item.property_id || '', // Map property_id to propertyId
      propertyName: item.properties ? item.properties.name : null,
      propertyAddress: item.properties ? `${item.properties.address}, ${item.properties.city}, ${item.properties.state} ${item.properties.zip_code}` : null,
      unitNumber: item.unit_number || '',
      leaseStart: item.lease_start, // Map lease_start to leaseStart
      leaseEnd: item.lease_end, // Map lease_end to leaseEnd
      rentAmount: item.rent_amount, // Map rent_amount to rentAmount
      depositAmount: item.deposit_amount, // Map deposit_amount to depositAmount
      balance: item.balance || 0,
      status: item.status as 'active' | 'inactive' | 'pending',
      managerId: item.properties?.manager_id
    }));
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, properties(name, address, city, state, zip_code)')
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
      propertyName: data.properties ? data.properties.name : null,
      propertyAddress: data.properties ? `${data.properties.address}, ${data.properties.city}, ${data.properties.state} ${data.properties.zip_code}` : null,
      unitNumber: data.unit_number || '',
      leaseStart: data.lease_start, // Map lease_start to leaseStart
      leaseEnd: data.lease_end, // Map lease_end to leaseEnd
      rentAmount: data.rent_amount, // Map rent_amount to rentAmount
      depositAmount: data.deposit_amount, // Map deposit_amount to depositAmount
      balance: data.balance || 0,
      status: data.status as 'active' | 'inactive' | 'pending'
    };
  },
  
  async checkEmailExists(email: string) {
    return await supabase
      .from('tenants')
      .select('email')
      .eq('email', email);
  },

  async findUserByEmail(email: string) {
    return await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email);
  },

  async create(tenant: Omit<Tenant, 'id' | 'propertyName' | 'propertyAddress'>) {
    // Map our TypeScript interface to database columns
    const dbTenant = {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone || null,
      property_id: tenant.propertyId || null, // Convert empty string to null
      unit_number: tenant.unitNumber || null, // Convert empty string to null
      lease_start: tenant.leaseStart, 
      lease_end: tenant.leaseEnd,
      rent_amount: tenant.rentAmount,
      deposit_amount: tenant.depositAmount,
      balance: tenant.balance || 0,
      status: tenant.status
    };
    
    console.log("Creating tenant in DB with data:", dbTenant);
    
    return await supabase
      .from('tenants')
      .insert(dbTenant)
      .select()
      .single();
  },

  async update(id: string, tenant: Partial<Omit<Tenant, 'id' | 'propertyName' | 'propertyAddress'>>) {
    // Map our TypeScript interface to database columns
    const dbTenant: any = {};
    
    if (tenant.name !== undefined) dbTenant.name = tenant.name;
    if (tenant.email !== undefined) dbTenant.email = tenant.email;
    if (tenant.phone !== undefined) dbTenant.phone = tenant.phone || null;
    if (tenant.propertyId !== undefined) dbTenant.property_id = tenant.propertyId || null;
    if (tenant.unitNumber !== undefined) dbTenant.unit_number = tenant.unitNumber || null;
    if (tenant.leaseStart !== undefined) dbTenant.lease_start = tenant.leaseStart;
    if (tenant.leaseEnd !== undefined) dbTenant.lease_end = tenant.leaseEnd;
    if (tenant.rentAmount !== undefined) dbTenant.rent_amount = tenant.rentAmount;
    if (tenant.depositAmount !== undefined) dbTenant.deposit_amount = tenant.depositAmount;
    if (tenant.balance !== undefined) dbTenant.balance = tenant.balance;
    if (tenant.status !== undefined) dbTenant.status = tenant.status;
    
    console.log("Updating tenant in DB with data:", dbTenant);
    
    return await supabase
      .from('tenants')
      .update(dbTenant)
      .eq('id', id)
      .select()
      .single();
  },

  async getTenantByUserId(userId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, properties(name, address, city, state, zip_code)')
      .eq('tenant_user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No data found
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Map to our TypeScript interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      propertyId: data.property_id || '',
      propertyName: data.properties ? data.properties.name : null,
      propertyAddress: data.properties ? `${data.properties.address}, ${data.properties.city}, ${data.properties.state} ${data.properties.zip_code}` : null,
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
