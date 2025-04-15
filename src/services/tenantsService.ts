
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types";

export const tenantsService = {
  async getAll(managerId?: string): Promise<Tenant[]> {
    console.log("Getting tenants with managerId:", managerId);
    
    let query = supabase
      .from('tenants')
      .select('*, properties(name, address, city, state, zip_code, manager_id)');
    
    // Note: We rely on RLS policies to filter data by manager_id
    // The managerId parameter is kept for logging and debugging purposes
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching tenants:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} tenants from database`);
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      propertyId: item.property_id || '',
      propertyName: item.properties ? item.properties.name : null,
      propertyAddress: item.properties ? `${item.properties.address}, ${item.properties.city}, ${item.properties.state} ${item.properties.zip_code}` : null,
      unitNumber: item.unit_number || '',
      leaseStart: item.lease_start,
      leaseEnd: item.lease_end,
      rentAmount: item.rent_amount,
      depositAmount: item.deposit_amount,
      balance: item.balance || 0,
      status: item.status as 'active' | 'inactive' | 'pending',
      managerId: item.properties?.manager_id,
      userId: item.tenant_user_id
    }));
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, properties(name, address, city, state, zip_code, manager_id)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
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
      status: data.status as 'active' | 'inactive' | 'pending',
      managerId: data.properties?.manager_id,
      userId: data.tenant_user_id
    };
  },

  async checkEmailExists(email: string) {
    return await supabase
      .from('tenants')
      .select('id')
      .eq('email', email);
  },

  async create(tenant: Omit<Tenant, "id" | "propertyName" | "propertyAddress">): Promise<any> {
    const dbTenant = {
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      property_id: tenant.propertyId,
      unit_number: tenant.unitNumber,
      lease_start: tenant.leaseStart,
      lease_end: tenant.leaseEnd,
      rent_amount: tenant.rentAmount,
      deposit_amount: tenant.depositAmount,
      balance: tenant.balance,
      status: tenant.status,
      tenant_user_id: tenant.userId
    };
    
    return await supabase
      .from('tenants')
      .insert(dbTenant)
      .select('*')
      .single();
  },

  async update(id: string, tenant: Partial<Omit<Tenant, "id" | "propertyName" | "propertyAddress">>): Promise<any> {
    const dbTenant: any = {};
    
    if (tenant.name !== undefined) dbTenant.name = tenant.name;
    if (tenant.email !== undefined) dbTenant.email = tenant.email;
    if (tenant.phone !== undefined) dbTenant.phone = tenant.phone;
    if (tenant.propertyId !== undefined) dbTenant.property_id = tenant.propertyId;
    if (tenant.unitNumber !== undefined) dbTenant.unit_number = tenant.unitNumber;
    if (tenant.leaseStart !== undefined) dbTenant.lease_start = tenant.leaseStart;
    if (tenant.leaseEnd !== undefined) dbTenant.lease_end = tenant.leaseEnd;
    if (tenant.rentAmount !== undefined) dbTenant.rent_amount = tenant.rentAmount;
    if (tenant.depositAmount !== undefined) dbTenant.deposit_amount = tenant.depositAmount;
    if (tenant.balance !== undefined) dbTenant.balance = tenant.balance;
    if (tenant.status !== undefined) dbTenant.status = tenant.status;
    if (tenant.userId !== undefined) dbTenant.tenant_user_id = tenant.userId;
    
    const { data, error } = await supabase
      .from('tenants')
      .update(dbTenant)
      .eq('id', id)
      .select('*, properties(name, address, city, state, zip_code, manager_id)')
      .single();
    
    if (error) {
      console.error("Error updating tenant:", error);
      throw error;
    }
    
    if (!data) return null;
    
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
      status: data.status as 'active' | 'inactive' | 'pending',
      managerId: data.properties?.manager_id,
      userId: data.tenant_user_id
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting tenant:", error);
      throw error;
    }
    
    return true;
  },

  async findUserByEmail(email: string) {
    return await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);
  },

  async getTenantByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, properties(id, name, address, city, state, zip_code, manager_id)')
        .eq('tenant_user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
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
        status: data.status as 'active' | 'inactive' | 'pending',
        managerId: data.properties?.manager_id,
        userId: data.tenant_user_id
      };
    } catch (error) {
      console.error("Error getting tenant by user ID:", error);
      throw error;
    }
  }
};
