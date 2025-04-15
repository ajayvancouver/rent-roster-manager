
import { supabase } from "@/integrations/supabase/client";

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

export const signInWithGoogle = async () => {
  console.log("Signing in with Google");
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth?fromProvider=true`
      }
    });
    
    if (error) {
      console.error("Google sign in error:", error.message);
      if (error.message.includes("provider is not enabled")) {
        console.error("Google provider is not enabled in Supabase. Please configure it in the Supabase dashboard.");
        throw new Error("Google authentication is not configured. Please contact support or use email login.");
      }
      throw error;
    }
    
    console.log("Google sign in initiated");
    return data;
  } catch (error: any) {
    console.error("Google sign in error:", error.message);
    throw error;
  }
};

export const signOutUser = async () => {
  console.log("Signing out user");
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Sign out error:", error.message);
    throw error;
  }
};
