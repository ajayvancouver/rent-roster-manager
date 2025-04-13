
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
