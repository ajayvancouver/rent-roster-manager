
import { Document } from "@/types";

// Types for document service data
export interface DocumentCreateData {
  name: string;
  type: 'lease' | 'payment' | 'maintenance' | 'other';
  tenantId?: string;
  propertyId?: string;
  uploadDate?: string;
  fileSize?: string;
  fileType?: string;
  url: string;
  managerId?: string;
}

export interface DocumentQueryResult {
  data: Document | null;
  error: Error | null;
}

export interface DocumentsQueryResult {
  data: Document[];
  error: Error | null;
}
