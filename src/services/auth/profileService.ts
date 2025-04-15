
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserType } from "@/types/auth";

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

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
    
    // Check if the user already exists as a tenant in the tenants table
    const { data: existingTenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("email", email)
      .maybeSingle();
      
    if (tenantError) {
      console.error("Error checking existing tenant:", tenantError);
    }
    
    // Create new profile with tenant data if available
    const defaultProfile = {
      id: userId,
      email: email,
      full_name: existingTenant?.name || email.split('@')[0] || email,
      user_type: 'tenant' as UserType,
      status: 'active',
      // If we found matching tenant data, add it to the profile
      property_id: existingTenant?.property_id || null,
      unit_number: existingTenant?.unit_number || null,
      phone: existingTenant?.phone || null,
      rent_amount: existingTenant?.rent_amount || null,
      deposit_amount: existingTenant?.deposit_amount || null,
      balance: existingTenant?.balance || 0,
      lease_start: existingTenant?.lease_start || null,
      lease_end: existingTenant?.lease_end || null
    };
    
    const { data, error } = await supabase
      .from("profiles")
      .insert([defaultProfile])
      .select()
      .maybeSingle();
      
    if (error) {
      console.error("Error creating default profile:", error);
      return null;
    }
    
    console.log("Created default profile for user:", userId, data);
    
    // If tenant record exists, link the user ID to the tenant record
    if (existingTenant && existingTenant.id) {
      await linkTenantToUser(existingTenant.id, userId);
      console.log(`Linked tenant ${existingTenant.id} to user ${userId}`);
    }
    
    if (!data) {
      console.warn("No data returned after profile creation");
      return defaultProfile as UserProfile;
    }
    
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
