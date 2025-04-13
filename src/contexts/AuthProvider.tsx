
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid recursion
          setTimeout(() => {
            handleProfileFetch(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserType(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Retrieved session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        handleProfileFetch(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleProfileFetch = async (userId: string) => {
    try {
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile && user?.email) {
        // Profile should have been created by the trigger
        // But as a fallback, attempt to create it manually
        userProfile = await createDefaultProfile(userId, user.email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        setUserType(userProfile.user_type);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error handling profile fetch:", error);
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
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
