
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";

export const paymentsService = {
  async getAll(managerId?: string): Promise<Payment[]> {
    console.log("Getting payments with managerId:", managerId);
    
    // Use a join query to get payments with tenant and property information
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants(
          name, 
          email, 
          properties(
            id, 
            name, 
            address, 
            city, 
            state, 
            zip_code, 
            manager_id
          ), 
          property_id, 
          unit_number
        )
      `);
    
    if (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
    
    console.log(`Raw payments data from Supabase:`, data);
    
    // Transform data to match our frontend model
    return (data || []).map(item => ({
      id: item.id,
      tenantId: item.tenant_id,
      tenantName: item.tenants ? item.tenants.name : null,
      propertyId: item.tenants?.property_id || null,
      propertyName: item.tenants?.properties ? item.tenants.properties.name : null,
      unitNumber: item.tenants?.unit_number || '',
      amount: item.amount,
      date: item.date,
      method: item.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: item.status as 'pending' | 'completed' | 'failed',
      notes: item.notes,
      managerId: item.tenants?.properties?.manager_id
    }));
  },

  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants(
          name, 
          email, 
          properties(
            id, 
            name, 
            address, 
            city, 
            state, 
            zip_code, 
            manager_id
          ), 
          property_id, 
          unit_number
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      id: data.id,
      tenantId: data.tenant_id,
      tenantName: data.tenants ? data.tenants.name : null,
      propertyId: data.tenants?.property_id || null,
      propertyName: data.tenants?.properties ? data.tenants.properties.name : null,
      unitNumber: data.tenants?.unit_number || '',
      amount: data.amount,
      date: data.date,
      method: data.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: data.status as 'pending' | 'completed' | 'failed',
      notes: data.notes,
      managerId: data.tenants?.properties?.manager_id
    };
  },

  async getByTenantId(tenantId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        tenants(
          name, 
          email, 
          properties(
            id, 
            name, 
            address, 
            city, 
            state, 
            zip_code, 
            manager_id
          ), 
          property_id, 
          unit_number
        )
      `)
      .eq('tenant_id', tenantId);
    
    if (error) {
      console.error("Error fetching payments for tenant:", error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      tenantId: item.tenant_id,
      tenantName: item.tenants ? item.tenants.name : null,
      propertyId: item.tenants?.property_id || null,
      propertyName: item.tenants?.properties ? item.tenants.properties.name : null,
      unitNumber: item.tenants?.unit_number || '',
      amount: item.amount,
      date: item.date,
      method: item.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: item.status as 'pending' | 'completed' | 'failed',
      notes: item.notes,
      managerId: item.tenants?.properties?.manager_id
    }));
  },

  async create(payment: Omit<Payment, "id" | "tenantName" | "propertyName" | "unitNumber" | "managerId">): Promise<any> {
    // Convert our frontend payment model to database schema
    const dbPayment = {
      tenant_id: payment.tenantId,
      amount: payment.amount,
      date: payment.date,
      method: payment.method,
      status: payment.status,
      notes: payment.notes
    };
    
    return await supabase
      .from('payments')
      .insert(dbPayment)
      .select()
      .single();
  },

  async update(id: string, payment: Partial<Omit<Payment, "id" | "tenantName" | "propertyName" | "unitNumber" | "managerId">>): Promise<any> {
    // Convert our frontend payment model to database schema
    const dbPayment: any = {};
    
    if (payment.tenantId !== undefined) dbPayment.tenant_id = payment.tenantId;
    if (payment.amount !== undefined) dbPayment.amount = payment.amount;
    if (payment.date !== undefined) dbPayment.date = payment.date;
    if (payment.method !== undefined) dbPayment.method = payment.method;
    if (payment.status !== undefined) dbPayment.status = payment.status;
    if (payment.notes !== undefined) dbPayment.notes = payment.notes;
    
    return await supabase
      .from('payments')
      .update(dbPayment)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
    
    return true;
  }
};
