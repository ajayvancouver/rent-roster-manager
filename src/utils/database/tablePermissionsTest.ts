
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks permissions for a specific table
 */
export const checkTablePermissions = async (tableName: string) => {
  try {
    // Use the table name as a string directly, but ensure it's one of our valid tables
    const validTables = ["properties", "tenants", "maintenance", "payments", "documents", "profiles", "payment_methods"];
    
    if (!validTables.includes(tableName)) {
      return { 
        success: false, 
        message: `Invalid table name: ${tableName}. Must be one of: ${validTables.join(', ')}` 
      };
    }
    
    // Cast tableName to any to bypass TypeScript's strict type checking
    // This is necessary because supabase client expects specific literal types
    const { data, error } = await supabase
      .from(tableName as any)
      .select("*")
      .limit(1);

    if (error) {
      console.error(`Error checking permissions for table ${tableName}:`, error);
      return { success: false, message: `Error checking permissions for table ${tableName}: ${error.message}` };
    }

    console.log(`Permissions check for table ${tableName} successful`);
    return { success: true, message: `Permissions check for table ${tableName} successful` };
  } catch (error) {
    console.error(`Error checking permissions for table ${tableName}:`, error);
    return { success: false, message: `Error checking permissions for table ${tableName}: ${error}` };
  }
};
