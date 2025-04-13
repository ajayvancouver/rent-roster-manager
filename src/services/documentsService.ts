
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types";

export const documentsService = {
  async getByTenantId(tenantId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: item.tenant_id || undefined, // Map tenant_id to tenantId
      propertyId: item.property_id || undefined, // Map property_id to propertyId
      uploadDate: item.upload_date, // Map upload_date to uploadDate
      fileSize: item.file_size, // Map file_size to fileSize
      fileType: item.file_type, // Map file_type to fileType
      url: item.url
    }));
  }
};
