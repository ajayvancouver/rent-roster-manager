import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types";

export const documentsService = {
  async getAll(managerId?: string): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*, tenants(name, email), properties(name, manager_id)');
    
    // If managerId is provided, filter documents by properties with matching manager_id
    if (managerId) {
      // For documents that have a property_id
      query = query.or(`properties.manager_id.eq.${managerId},and(property_id.is.null,tenants.properties.manager_id.eq.${managerId})`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: item.tenant_id || undefined, // Map tenant_id to tenantId
      tenantName: item.tenants ? item.tenants.name : undefined,
      propertyId: item.property_id || undefined, // Map property_id to propertyId
      propertyName: item.properties ? item.properties.name : undefined,
      uploadDate: item.upload_date, // Map upload_date to uploadDate
      fileSize: item.file_size, // Map file_size to fileSize
      fileType: item.file_type, // Map file_type to fileType
      url: item.url,
      managerId: item.properties?.manager_id
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*, tenants(name, email), properties(name)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching document:", error);
      return { data: null, error };
    }
    
    if (!data) {
      return { data: null, error: null };
    }
    
    // Map database columns to our TypeScript interface
    const document: Document = {
      id: data.id,
      name: data.name,
      type: data.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: data.tenant_id || undefined,
      tenantName: data.tenants ? data.tenants.name : undefined,
      propertyId: data.property_id || undefined,
      propertyName: data.properties ? data.properties.name : undefined,
      uploadDate: data.upload_date,
      fileSize: data.file_size,
      fileType: data.file_type,
      url: data.url
    };
    
    return { data: document, error: null };
  },

  async getByTenantId(tenantId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*, properties(name)')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: item.tenant_id || undefined, // Map tenant_id to tenantId
      propertyId: item.property_id || undefined, // Map property_id to propertyId
      propertyName: item.properties ? item.properties.name : undefined,
      uploadDate: item.upload_date, // Map upload_date to uploadDate
      fileSize: item.file_size, // Map file_size to fileSize
      fileType: item.file_type, // Map file_type to fileType
      url: item.url
    }));
  },

  async getByPropertyId(propertyId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*, tenants(name)')
      .eq('property_id', propertyId);
    
    if (error) throw error;
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: item.tenant_id || undefined, // Map tenant_id to tenantId
      tenantName: item.tenants ? item.tenants.name : undefined,
      propertyId: item.property_id || undefined, // Map property_id to propertyId
      uploadDate: item.upload_date, // Map upload_date to uploadDate
      fileSize: item.file_size, // Map file_size to fileSize
      fileType: item.file_type, // Map file_type to fileType
      url: item.url
    }));
  },

  async create(document: Omit<Document, 'id' | 'tenantName' | 'propertyName'>) {
    // Map our TypeScript interface to database columns
    const dbDocument = {
      name: document.name,
      type: document.type,
      tenant_id: document.tenantId || null,
      property_id: document.propertyId || null,
      upload_date: document.uploadDate || new Date().toISOString(),
      file_size: document.fileSize,
      file_type: document.fileType,
      url: document.url
    };
    
    return await supabase
      .from('documents')
      .insert(dbDocument)
      .select()
      .single();
  }
};
