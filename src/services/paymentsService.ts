
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";

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
