
import { 
  getAllDocuments,
  getDocumentById,
  getDocumentsByTenantId,
  getDocumentsByPropertyId
} from "./documentQueries";
import { createDocument } from "./documentMutations";
import { DocumentCreateData } from "./types";
import { Document } from "@/types";

// Export the document service with a consistent API
export const documentsService = {
  getAll: getAllDocuments,
  getById: getDocumentById,
  getByTenantId: getDocumentsByTenantId,
  getByPropertyId: getDocumentsByPropertyId,
  create: (document: Omit<Document, 'id' | 'tenantName' | 'propertyName'>) => {
    return createDocument(document as DocumentCreateData);
  }
};
