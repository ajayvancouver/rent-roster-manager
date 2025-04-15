
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
  const { data, error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth?fromProvider=true`
    }
  });
  
  if (error) {
    console.error("Google sign in error:", error.message);
    throw error;
  }
  
  console.log("Google sign in initiated");
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
