
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
