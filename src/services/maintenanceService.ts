
import { supabase } from "@/integrations/supabase/client";
import { Maintenance } from "@/types";

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
