
import { Session, User } from "@supabase/supabase-js";

export type UserType = "tenant" | "manager";

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  user_type: UserType;
  property_id?: string;
  unit_number?: string;
  rent_amount?: number;
  deposit_amount?: number;
  balance?: number;
  lease_start?: string;
  lease_end?: string;
  tenant_status?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  userType: UserType | null;
  isLoading: boolean;
  authError: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  // Remove signInWithGoogleProvider from here
  signUp: (
    email: string, 
    password: string, 
    userType: UserType, 
    fullName?: string,
    createSampleData?: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
