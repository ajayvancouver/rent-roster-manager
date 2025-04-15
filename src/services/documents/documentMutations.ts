
import { supabase } from "@/integrations/supabase/client";
import { DocumentCreateData } from "./types";

const createDocument = async (document: DocumentCreateData) => {
  try {
    console.log("Creating document with data:", document);
    
    // Format data for supabase insert
    const documentData = {
      name: document.name,
      type: document.type,
      tenant_id: document.tenantId,
      property_id: document.propertyId,
      upload_date: document.uploadDate || new Date().toISOString(),
      file_size: document.fileSize,
      file_type: document.fileType,
      url: document.url
    };
    
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating document:", error);
      return { data: null, error };
    }
    
    return { 
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        tenantId: data.tenant_id,
        propertyId: data.property_id,
        uploadDate: data.upload_date,
        fileSize: data.file_size,
        fileType: data.file_type,
        url: data.url
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error in createDocument:", error);
    return { data: null, error };
  }
};

const updateDocument = async (id: string, updates: Partial<DocumentCreateData>) => {
  try {
    // Format data for supabase update
    const documentData: Record<string, any> = {};
    
    if (updates.name) documentData.name = updates.name;
    if (updates.type) documentData.type = updates.type;
    if (updates.tenantId !== undefined) documentData.tenant_id = updates.tenantId;
    if (updates.propertyId !== undefined) documentData.property_id = updates.propertyId;
    if (updates.fileSize) documentData.file_size = updates.fileSize;
    if (updates.fileType) documentData.file_type = updates.fileType;
    if (updates.url) documentData.url = updates.url;
    
    const { data, error } = await supabase
      .from('documents')
      .update(documentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating document:", error);
      return { data: null, error };
    }
    
    return { 
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        tenantId: data.tenant_id,
        propertyId: data.property_id,
        uploadDate: data.upload_date,
        fileSize: data.file_size,
        fileType: data.file_type,
        url: data.url
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error in updateDocument:", error);
    return { data: null, error };
  }
};

const deleteDocument = async (id: string) => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting document:", error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    return { success: false, error };
  }
};

export const documentMutations = {
  create: createDocument,
  update: updateDocument,
  delete: deleteDocument
};
