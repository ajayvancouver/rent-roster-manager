
import { Session, User } from '@supabase/supabase-js';

export type UserType = 'tenant' | 'manager';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  user_type: UserType;
  property_id?: string;
  unit_number?: string;
  phone?: string;
  rent_amount?: number;
  deposit_amount?: number;
  balance?: number;
  lease_start?: string;
  lease_end?: string;
  status?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  userType: UserType | null;
  isLoading: boolean;
  authError: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: UserType, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
