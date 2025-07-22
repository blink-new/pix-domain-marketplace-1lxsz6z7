import { createContext } from 'react'
import { User, Session } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resendOTP: (email: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)