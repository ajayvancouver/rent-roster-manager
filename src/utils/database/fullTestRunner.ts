
import { testConnection } from "./connectionTest";
import { diagnoseRLSIssues } from "./rlsTest";
import { checkTablePermissions } from "./tablePermissionsTest";

/**
 * Runs a comprehensive test of all database connections and permissions
 */
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
