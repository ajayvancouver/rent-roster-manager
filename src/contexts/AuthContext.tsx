import React, { createContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthContextType, UserProfile, UserType } from "@/types/auth";
import { 
  signInWithEmail, 
  signInWithGoogle,
  signUpWithEmail, 
  signOutUser, 
  fetchUserProfile, 
  createDefaultProfile 
} from "@/services/auth";
import { createSamplePropertyManager } from "@/services/sampleProperties";

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
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
        console.log("No profile found, creating default profile");
        userProfile = await createDefaultProfile(userId, email);
        
        // Check if sample data should be created
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.create_sample_data === true && 
            user?.user_metadata?.user_type === 'manager' &&
            userProfile) {
          try {
            console.log("Creating sample data for new manager");
            await createSamplePropertyManager(userProfile.id);
          } catch (sampleError) {
            console.error("Error creating sample data:", sampleError);
          }
        }
      }
      
      if (userProfile) {
        setProfile(userProfile);
        setUserType(userProfile.user_type);
        
        if (userProfile.user_type === 'tenant' && !userProfile.property_id) {
          const { data: tenantData, error: tenantError } = await supabase
            .from("tenants")
            .select("*")
            .eq("email", email)
            .maybeSingle();
            
          if (!tenantError && tenantData) {
            console.log("Found tenant data for email:", email);
            if (!tenantData.tenant_user_id) {
              await supabase
                .from("tenants")
                .update({ tenant_user_id: userId })
                .eq("id", tenantData.id);
            }
            
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
        console.log("Setting default userType as tenant");
        setUserType("tenant");
      }
    } catch (error) {
      console.error("Error handling profile fetch:", error);
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
    }
  };

  const signInWithGoogleProvider = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign in error:", error.message);
      throw error;
    } finally {
      // Auth state change will handle loading state
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userType: UserType, 
    fullName?: string,
    createSampleData: boolean = false
  ) => {
    try {
      setIsLoading(true);
      await signUpWithEmail(email, password, userType, fullName, createSampleData);
      
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
        signInWithGoogleProvider,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
