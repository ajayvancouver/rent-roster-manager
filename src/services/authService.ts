
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserType } from "@/types/auth";

export const signInWithEmail = async (email: string, password: string) => {
  console.log("Signing in user:", email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.error("Sign in error:", error.message);
    throw error;
  }
  
  console.log("Sign in successful:", data.user?.email);
  return data;
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userType: UserType, 
  fullName?: string
) => {
  console.log("Signing up user:", email, "as", userType);
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        user_type: userType,
        full_name: fullName || email
      }
    }
  });
  
  if (error) {
    console.error("Sign up error:", error.message);
    throw error;
  }
  
  console.log("Sign up successful, confirmation status:", data.user?.email);
  return data;
};

export const signOutUser = async () => {
  console.log("Signing out user");
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Sign out error:", error.message);
    throw error;
  }
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (data) {
      console.log("Profile found:", data);
      return data as UserProfile;
    }
    
    console.log("No profile found for user:", userId);
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
  try {
    console.log("Creating default profile for user:", userId);
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (existingProfile) {
      console.log("Profile already exists:", existingProfile);
      return existingProfile as UserProfile;
    }
    
    // Create new profile
    const defaultProfile = {
      id: userId,
      email: email,
      full_name: email,
      user_type: 'tenant' as UserType,
    };
    
    const { data, error } = await supabase
      .from("profiles")
      .insert([defaultProfile])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating default profile:", error);
      return null;
    }
    
    console.log("Created default profile for user:", userId, data);
    return data as UserProfile;
  } catch (error) {
    console.error("Error creating default profile:", error);
    return null;
  }
};
