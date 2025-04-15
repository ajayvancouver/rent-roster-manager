
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types";

/**
 * Get all documents, optionally filtered by manager ID
 */
export async function getAllDocuments(managerId?: string): Promise<Document[]> {
  try {
    let query = supabase
      .from('documents')
      .select('*, properties(id, name, manager_id), tenants(id, name)');
    
    // Filter by manager ID if provided
    if (managerId) {
      // Filter documents where the property is managed by this manager
      query = query.eq('properties.manager_id', managerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
    
    // Map database columns to our TypeScript interfaces
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'lease' | 'payment' | 'maintenance' | 'other',
      tenantId: item.tenant_id || undefined,
      tenantName: item.tenants ? item.tenants.name : undefined,
      propertyId: item.property_id || undefined,
      propertyName: item.properties ? item.properties.name : undefined,
      uploadDate: item.upload_date,
      fileSize: item.file_size,
      fileType: item.file_type,
      url: item.url,
      managerId: item.properties?.manager_id
    }));
  } catch (error) {
    console.error("Error in getAllDocuments:", error);
    throw error;
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string) {
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
}

/**
 * Get documents by tenant ID
 */
export async function getDocumentsByTenantId(tenantId: string): Promise<Document[]> {
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
    tenantId: item.tenant_id || undefined,
    propertyId: item.property_id || undefined,
    propertyName: item.properties ? item.properties.name : undefined,
    uploadDate: item.upload_date,
    fileSize: item.file_size,
    fileType: item.file_type,
    url: item.url
  }));
}

/**
 * Get documents by property ID
 */
export async function getDocumentsByPropertyId(propertyId: string): Promise<Document[]> {
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
    tenantId: item.tenant_id || undefined,
    tenantName: item.tenants ? item.tenants.name : undefined,
    propertyId: item.property_id || undefined,
    uploadDate: item.upload_date,
    fileSize: item.file_size,
    fileType: item.file_type,
    url: item.url
  }));
}
