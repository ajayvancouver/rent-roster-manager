
import { supabase } from "@/integrations/supabase/client";
import { DocumentCreateData } from "./types";

/**
 * Create a new document
 */
export async function createDocument(document: DocumentCreateData) {
  // Map our TypeScript interface to database columns
  const dbDocument = {
    name: document.name,
    type: document.type,
    tenant_id: document.tenantId || null,
    property_id: document.propertyId || null,
    upload_date: document.uploadDate || new Date().toISOString(),
    file_size: document.fileSize || "0 KB",
    file_type: document.fileType || "application/pdf",
    url: document.url
  };
  
  console.log("Creating document with data:", dbDocument);
  
  return await supabase
    .from('documents')
    .insert(dbDocument)
    .select()
    .single();
}
