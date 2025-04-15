
import { supabase } from "@/integrations/supabase/client";
import { signUpWithEmail } from "./authService";
import { UserType } from "@/types/auth";
import { updateProfile } from "./supabaseService";
import { createSampleProperties, connectSampleTenantsToProperties } from "./sampleProperties";

/**
 * Creates a sample tenant account
 * @returns Email and password for the sample tenant
 */
export const createSampleTenant = async (): Promise<{ email: string; password: string }> => {
  const email = `tenant${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "password123";
  const fullName = "Sample Tenant";
  const userType: UserType = "tenant";

  try {
    await signUpWithEmail(email, password, userType, fullName);
    console.log("Created sample tenant account:", email);
    return { email, password };
  } catch (error) {
    console.error("Error creating sample tenant:", error);
    throw error;
  }
};

/**
 * Creates a property manager account
 * @param createSampleData Whether to create sample properties and tenants for this manager
 * @returns Email and password for the property manager
 */
export const createSampleManager = async (createSampleData: boolean = false): Promise<{ email: string; password: string }> => {
  const email = `manager${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "password123";
  const fullName = "Sample Property Manager";
  const userType: UserType = "manager";

  try {
    const { user } = await signUpWithEmail(email, password, userType, fullName, createSampleData);
    
    if (user?.id) {
      // Set the manager_id field in the profile
      await updateProfile(user.id, { manager_id: user.id });
      
      // Only create sample data if explicitly requested
      if (createSampleData) {
        // Create sample properties for this manager
        const propertyIds = await createSampleProperties(user.id);
        
        // Create some sample tenants
        const tenantCount = 5;
        for (let i = 0; i < tenantCount; i++) {
          await createSampleTenant();
        }
        
        // Connect tenants to properties
        await connectSampleTenantsToProperties(user.id, propertyIds);
        console.log("Created sample properties and tenants for manager:", email);
      } else {
        console.log("Created manager account without sample data:", email);
      }
    }
    
    return { email, password };
  } catch (error) {
    console.error("Error creating sample manager:", error);
    throw error;
  }
};

/**
 * Logs out the current user
 */
export const logoutCurrentUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    console.log("Logged out current user");
  } catch (error) {
    console.error("Error logging out current user:", error);
    throw error;
  }
};
