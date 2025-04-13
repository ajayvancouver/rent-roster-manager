
import { Session, User } from "@supabase/supabase-js";

export type UserType = "manager" | "tenant";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  // Extended tenant fields
  property_id?: string | null;
  unit_number?: string | null;
  phone?: string | null;
  rent_amount?: number | null;
  deposit_amount?: number | null;
  balance?: number | null;
  lease_start?: string | null;
  lease_end?: string | null;
  status?: string | null;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  userType: UserType | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: UserType, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
