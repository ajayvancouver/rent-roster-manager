
import { supabase } from "@/integrations/supabase/client";
import { UserType } from "@/types/auth";

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userType: UserType, 
  fullName?: string,
  createSampleData: boolean = false
) => {
  console.log("Signing up user:", email, "as", userType, "with sample data:", createSampleData);
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        user_type: userType,
        full_name: fullName || email,
        create_sample_data: createSampleData
      }
    }
  });
  
  if (error) {
    console.error("Sign up error:", error.message);
    throw error;
  }
  
  console.log("Sign up successful, confirmation status:", data.user?.email);
  
  // Note: The sample data creation is handled in the AuthContext
  // after profile creation to ensure proper manager_id assignment
  
  return data;
};
