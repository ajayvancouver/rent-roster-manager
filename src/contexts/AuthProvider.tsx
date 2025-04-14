import React, { createContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthContextType, UserProfile, UserType } from "@/types/auth";
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  fetchUserProfile, 
  createDefaultProfile 
} from "@/services/authService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid recursion
          setTimeout(() => {
            handleProfileFetch(currentSession.user.id, currentSession.user.email || '');
          }, 0);
        } else {
          setProfile(null);
          setUserType(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Retrieved session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        handleProfileFetch(currentSession.user.id, currentSession.user.email || '');
      } else {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error("Error retrieving session:", error);
      setIsLoading(false);
      setAuthError(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleProfileFetch = async (userId: string, email: string) => {
    try {
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile) {
        // No profile found, create a default one with tenant data if possible
        console.log("No profile found, creating default profile");
        userProfile = await createDefaultProfile(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        setUserType(userProfile.user_type);
        
        // If the profile has no property data but there's a matching tenant, update the profile
        if (userProfile.user_type === 'tenant' && !userProfile.property_id) {
          // Check if there's tenant data for this email
          const { data: tenantData, error: tenantError } = await supabase
            .from("tenants")
            .select("*")
            .eq("email", email)
            .maybeSingle();
            
          if (!tenantError && tenantData) {
            console.log("Found tenant data for email:", email);
            // Link tenant to user if not already linked
            if (!tenantData.tenant_user_id) {
              await supabase
                .from("tenants")
                .update({ tenant_user_id: userId })
                .eq("id", tenantData.id);
            }
            
            // Update profile with tenant data
            const updatedProfile = {
              property_id: tenantData.property_id,
              unit_number: tenantData.unit_number,
              rent_amount: tenantData.rent_amount,
              deposit_amount: tenantData.deposit_amount,
              balance: tenantData.balance,
              lease_start: tenantData.lease_start,
              lease_end: tenantData.lease_end
            };
            
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .update(updatedProfile)
              .eq("id", userId)
              .select()
              .single();
              
            if (!profileError && profileData) {
              console.log("Updated profile with tenant data:", profileData);
              setProfile({
                ...userProfile,
                ...updatedProfile
              });
            }
          }
        }
      } else {
        // If we still couldn't get a profile, set default values
        console.log("Setting default userType as tenant");
        setUserType("tenant");
      }
    } catch (error) {
      console.error("Error handling profile fetch:", error);
      // Set a default user type to prevent auth loops
      setUserType("tenant");
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      throw error;
    } finally {
      // We don't set isLoading to false here because the auth state change event will trigger
    }
  };

  const signUp = async (email: string, password: string, userType: UserType, fullName?: string) => {
    try {
      setIsLoading(true);
      await signUpWithEmail(email, password, userType, fullName);
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account",
      });
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await signOutUser();
      
      // Reset all states
      setSession(null);
      setUser(null);
      setProfile(null);
      setUserType(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        userType,
        isLoading,
        authError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
