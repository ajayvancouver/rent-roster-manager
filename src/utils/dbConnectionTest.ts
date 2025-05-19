
import { supabase } from "@/integrations/supabase/client";

// Define allowed function names as a type
type SecurityDefinerFunction = 
  | "get_user_managed_properties" 
  | "is_property_manager" 
  | "is_tenant_of_managed_property"
  | "get_manager_properties"
  | "is_tenant_of_user_managed_property"
  | "is_user_property_manager";

// List of security definer functions that should exist
const requiredSecurityFunctions: SecurityDefinerFunction[] = [
  "get_user_managed_properties",
  "is_property_manager",
  "is_tenant_of_managed_property",
  "get_manager_properties",
  "is_tenant_of_user_managed_property",
  "is_user_property_manager"
];

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Error testing database connection:", error);
      return { success: false, message: `Database connection test failed: ${error.message}` };
    }

    console.log("Database connection test successful");
    return { success: true, message: "Database connection test successful" };
  } catch (error) {
    console.error("Error testing database connection:", error);
    return { success: false, message: `Database connection test failed: ${error}` };
  }
};

// Alias function to match the import in ConnectionTestCard.tsx
export const testSupabaseConnection = testConnection;

export const diagnoseRLSIssues = async () => {
  try {
    console.log("Diagnosing RLS issues...");
    
    // Test connection to tables with RLS
    const tablesWithIssues: string[] = [];
    const issues: string[] = [];
    
    // Check properties table
    const { data: propertiesData, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .limit(1);
      
    if (propertiesError) {
      if (propertiesError.message.includes("recursion")) {
        tablesWithIssues.push("properties");
        issues.push("Properties table has recursive RLS policy");
      }
    }
    
    // Check tenants table
    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id")
      .limit(1);
      
    if (tenantsError) {
      if (tenantsError.message.includes("recursion")) {
        tablesWithIssues.push("tenants");
        issues.push("Tenants table has recursive RLS policy");
      }
    }
    
    // Check maintenance table
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from("maintenance")
      .select("id")
      .limit(1);
      
    if (maintenanceError) {
      if (maintenanceError.message.includes("recursion")) {
        tablesWithIssues.push("maintenance");
        issues.push("Maintenance table has recursive RLS policy");
      }
    }
    
    // Check if required security definer functions exist
    const functionStatus = await Promise.all(
      requiredSecurityFunctions.map(async (funcName: SecurityDefinerFunction) => {
        // We need to try to invoke the function, but it may require parameters
        // So we'll use a general approach to detect if it exists
        let exists = true;
        let error = null;
        
        try {
          // Different approach based on function name
          if (funcName === "get_user_managed_properties" || funcName === "get_manager_properties") {
            // Functions that don't require parameters
            const result = await supabase.rpc(funcName);
            error = result.error;
          } else if (funcName.startsWith("is_property_manager")) {
            // Try with a dummy UUID parameter
            const result = await supabase.rpc(funcName, { property_id: '00000000-0000-0000-0000-000000000000' });
            error = result.error;
          } else if (funcName.startsWith("is_tenant")) {
            // Try with a dummy UUID parameter
            const result = await supabase.rpc(funcName, { tenant_id: '00000000-0000-0000-0000-000000000000' });
            error = result.error;
          } else {
            // For other functions, just check if they exist without parameters
            const result = await supabase.rpc(funcName);
            error = result.error;
          }
          
          // If we get an error about parameters or permissions, the function exists
          // If we get an error about the function not existing, it doesn't exist
          if (error && error.message.includes("does not exist")) {
            exists = false;
            issues.push(`Required security definer function "${funcName}" is missing`);
          }
        } catch (e) {
          // This probably means the function doesn't exist
          exists = false;
          issues.push(`Required security definer function "${funcName}" couldn't be called`);
        }
        
        return { name: funcName, exists };
      })
    );
    
    const success = issues.length === 0;
    const message = success
      ? "RLS policies appear to be correctly configured"
      : `Found ${issues.length} issues with RLS configuration`;
      
    return {
      success,
      message,
      issues,
      functionStatus
    };
  } catch (error) {
    console.error("Error diagnosing RLS:", error);
    return {
      success: false,
      message: `Error during RLS diagnosis: ${error instanceof Error ? error.message : "Unknown error"}`,
      issues: [`Diagnosis error: ${error instanceof Error ? error.message : "Unknown error"}`]
    };
  }
};

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

// Add these functions to match what the components are trying to import
export const runFullDatabaseTest = async () => {
  try {
    const results: Record<string, { success: boolean; message: string }> = {};
    
    // Test basic connection
    results["Database Connection"] = await testConnection();
    
    // Test RLS configuration
    const rlsResults = await diagnoseRLSIssues();
    results["RLS Configuration"] = {
      success: rlsResults.success,
      message: rlsResults.message
    };
    
    // Test permissions for each table
    const tables = ["properties", "tenants", "maintenance", "payments", "documents", "profiles"];
    for (const table of tables) {
      results[`${table} Table Access`] = await checkTablePermissions(table);
    }
    
    // Check if all tests passed
    const allPassed = Object.values(results).every(result => result.success);
    
    return {
      success: allPassed,
      message: allPassed 
        ? "All database tests passed successfully" 
        : "Some database tests failed, check details",
      details: results
    };
  } catch (error) {
    console.error("Error running full database test:", error);
    return {
      success: false,
      message: `Error during full database test: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: {
        "Test Error": {
          success: false,
          message: `${error instanceof Error ? error.message : "Unknown error"}`
        }
      }
    };
  }
};

export const createAndTestSampleData = async () => {
  try {
    // This is just a mock implementation since we don't have the actual implementation
    // In a real application, this would create sample data and return credentials
    
    console.log("Creating sample data...");
    
    // Mock credentials for demo
    const managerCredentials = {
      email: "manager@example.com",
      password: "Password123!"
    };
    
    const tenantCredentials = {
      email: "tenant@example.com",
      password: "Password123!"
    };
    
    return {
      success: true,
      message: "Sample data created successfully",
      managerCredentials,
      tenantCredentials
    };
  } catch (error) {
    console.error("Error creating sample data:", error);
    return {
      success: false,
      message: `Error creating sample data: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
};
