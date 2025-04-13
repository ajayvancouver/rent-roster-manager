
import { supabase } from "@/integrations/supabase/client";
import { signUpWithEmail } from "./authService";
import { UserType } from "@/types/auth";

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
 * Creates a sample property manager account
 * @returns Email and password for the sample property manager
 */
export const createSampleManager = async (): Promise<{ email: string; password: string }> => {
  const email = `manager${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "password123";
  const fullName = "Sample Property Manager";
  const userType: UserType = "manager";

  try {
    await signUpWithEmail(email, password, userType, fullName);
    console.log("Created sample manager account:", email);
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
