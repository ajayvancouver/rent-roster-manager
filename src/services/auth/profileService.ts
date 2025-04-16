
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
};

export const createDefaultProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
  try {
    // Get user_type from metadata if available
    const { data: { user } } = await supabase.auth.getUser();
    const userType = user?.user_metadata?.user_type || 'tenant';
    const fullName = user?.user_metadata?.full_name || email;
    
    const profileData = {
      id: userId,
      email,
      full_name: fullName,
      user_type: userType,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating default profile:", error.message);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Error in createDefaultProfile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating user profile:", error.message);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return null;
  }
};
