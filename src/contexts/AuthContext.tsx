import React, { useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContextType'
import { useToast } from '../hooks/use-toast'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Create or update user profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Error updating profile:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Link de acesso enviado para seu email!",
      })
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Erro",
        description: authError.message || 'Erro ao enviar link de acesso',
        variant: "destructive",
      })
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Erro",
        description: authError.message || 'Erro ao fazer login com Google',
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast({
        title: "Sucesso!",
        description: "Logout realizado com sucesso!",
      })
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Erro",
        description: authError.message || 'Erro ao fazer logout',
        variant: "destructive",
      })
      throw error
    }
  }

  const resendOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Novo link enviado para seu email!",
      })
    } catch (error) {
      const authError = error as AuthError
      toast({
        title: "Erro",
        description: authError.message || 'Erro ao reenviar link',
        variant: "destructive",
      })
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resendOTP,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}