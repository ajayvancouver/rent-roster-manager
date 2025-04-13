
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";

export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, tenants(name, email, property_id, unit_number, properties(name))');
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      tenantId: item.tenant_id,
      tenantName: item.tenants ? item.tenants.name : 'Unknown',
      propertyId: item.tenants ? item.tenants.property_id : null,
      propertyName: item.tenants && item.tenants.properties ? item.tenants.properties.name : null,
      unitNumber: item.tenants ? item.tenants.unit_number : null,
      amount: item.amount,
      date: item.date,
      method: item.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: item.status as 'pending' | 'completed' | 'failed',
      notes: item.notes || undefined
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, tenants(name, email, property_id, unit_number, properties(name))')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching payment:", error);
      return { data: null, error };
    }
    
    if (!data) {
      return { data: null, error: null };
    }
    
    // Map database columns to our TypeScript interface
    const payment: Payment = {
      id: data.id,
      tenantId: data.tenant_id,
      tenantName: data.tenants ? data.tenants.name : 'Unknown',
      propertyId: data.tenants ? data.tenants.property_id : null,
      propertyName: data.tenants && data.tenants.properties ? data.tenants.properties.name : null,
      unitNumber: data.tenants ? data.tenants.unit_number : null,
      amount: data.amount,
      date: data.date,
      method: data.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: data.status as 'pending' | 'completed' | 'failed',
      notes: data.notes || undefined
    };
    
    return { data: payment, error: null };
  },

  async getByTenantId(tenantId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, tenants(name, email, property_id, unit_number, properties(name))')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      tenantId: item.tenant_id,
      tenantName: item.tenants ? item.tenants.name : 'Unknown',
      propertyId: item.tenants ? item.tenants.property_id : null,
      propertyName: item.tenants && item.tenants.properties ? item.tenants.properties.name : null,
      unitNumber: item.tenants ? item.tenants.unit_number : null,
      amount: item.amount,
      date: item.date,
      method: item.method as 'cash' | 'check' | 'bank transfer' | 'credit card',
      status: item.status as 'pending' | 'completed' | 'failed',
      notes: item.notes || undefined
    }));
  },

  async create(payment: Omit<Payment, 'id' | 'tenantName' | 'propertyId' | 'propertyName' | 'unitNumber'>) {
    // Map our TypeScript interface to database columns
    const dbPayment = {
      tenant_id: payment.tenantId,
      amount: payment.amount,
      date: payment.date,
      method: payment.method,
      status: payment.status,
      notes: payment.notes || null
    };
    
    const { data, error } = await supabase
      .from('payments')
      .insert(dbPayment)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  }
};
