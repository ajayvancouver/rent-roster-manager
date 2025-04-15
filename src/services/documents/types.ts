
import { Document } from "@/types";

export type DocumentCreateData = Omit<Document, "id" | "tenantName" | "propertyName">;
