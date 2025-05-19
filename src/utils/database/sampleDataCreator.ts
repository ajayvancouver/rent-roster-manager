
/**
 * Creates sample data for testing and returns credentials
 */
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
