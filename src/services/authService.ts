
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
      
      // Map the database fields to our UserProfile interface
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        user_type: data.user_type as UserType,
        property_id: data.property_id,
        unit_number: data.unit_number,
        phone: data.phone,
        rent_amount: data.rent_amount,
        deposit_amount: data.deposit_amount,
        balance: data.balance,
        lease_start: data.lease_start,
        lease_end: data.lease_end,
        status: data.status
      };
      
      return userProfile;
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
      
      // Map the database fields to our UserProfile interface
      return {
        id: existingProfile.id,
        email: existingProfile.email,
        full_name: existingProfile.full_name,
        avatar_url: existingProfile.avatar_url,
        user_type: existingProfile.user_type as UserType,
        property_id: existingProfile.property_id,
        unit_number: existingProfile.unit_number,
        phone: existingProfile.phone,
        rent_amount: existingProfile.rent_amount,
        deposit_amount: existingProfile.deposit_amount,
        balance: existingProfile.balance,
        lease_start: existingProfile.lease_start,
        lease_end: existingProfile.lease_end,
        status: existingProfile.status
      };
    }
    
    // Create new profile
    const defaultProfile = {
      id: userId,
      email: email,
      full_name: email,
      user_type: 'tenant' as UserType,
      status: 'active'
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
    
    // Map the database fields to our UserProfile interface
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      user_type: data.user_type as UserType,
      property_id: data.property_id,
      unit_number: data.unit_number,
      phone: data.phone,
      rent_amount: data.rent_amount,
      deposit_amount: data.deposit_amount,
      balance: data.balance,
      lease_start: data.lease_start,
      lease_end: data.lease_end,
      status: data.status
    };
  } catch (error) {
    console.error("Error creating default profile:", error);
    return null;
  }
};

// New function to link a tenant record with a user profile
export const linkTenantToUser = async (tenantId: string, userId: string) => {
  try {
    console.log(`Linking tenant ${tenantId} to user ${userId}`);
    const { data, error } = await supabase
      .from("tenants")
      .update({ tenant_user_id: userId })
      .eq("id", tenantId)
      .select()
      .single();
      
    if (error) {
      console.error("Error linking tenant to user:", error);
      throw error;
    }
    
    console.log("Successfully linked tenant to user:", data);
    return data;
  } catch (error) {
    console.error("Error in linkTenantToUser:", error);
    throw error;
  }
};

// New function to update user profile with tenant data
export const updateProfileWithTenantData = async (userId: string, tenantData: any) => {
  try {
    console.log(`Updating profile for user ${userId} with tenant data:`, tenantData);
    
    const updateData = {
      property_id: tenantData.property_id,
      unit_number: tenantData.unit_number,
      phone: tenantData.phone,
      rent_amount: tenantData.rent_amount,
      deposit_amount: tenantData.deposit_amount,
      balance: tenantData.balance,
      lease_start: tenantData.lease_start,
      lease_end: tenantData.lease_end,
      status: tenantData.status
    };
    
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating profile with tenant data:", error);
      throw error;
    }
    
    console.log("Successfully updated profile with tenant data:", data);
    return data;
  } catch (error) {
    console.error("Error in updateProfileWithTenantData:", error);
    throw error;
  }
};
