
import { supabase } from "@/integrations/supabase/client";

export async function linkTenantToUser(tenantId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .update({ tenant_user_id: userId })
      .eq('id', tenantId)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error linking tenant to user:", error);
    throw error;
  }
}

export async function getTenantByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, properties(*)')
      .eq('tenant_user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows returned is not an error
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error getting tenant by user ID:", error);
    throw error;
  }
}
