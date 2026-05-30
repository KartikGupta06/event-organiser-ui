import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'student';
  profile_picture_url?: string;
  branch?: string;
  roll_number?: string;
  academic_year?: string;
  phone_number?: string;
  bio?: string;
  email_notifications: boolean;
  event_reminders: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStudent: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string, fullName?: string) => {
    console.log('[EventHub Auth] FETCH PROFILE START for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[EventHub Auth] PROFILE FAILED - Error fetching profile:', error);
        console.log('[EventHub Auth] FETCH PROFILE END');
        return null;
      }
      
      if (!data) {
        console.log('[EventHub Auth] Profile missing, creating default profile for user:', userId);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: userId,
              email: email || '',
              full_name: fullName || '',
              role: 'student',
            }
          ])
          .select()
          .maybeSingle();
        
        if (insertError) {
          console.warn('[EventHub Auth] PROFILE FAILED - Error creating default profile, attempting second fetch:', insertError);
          // Fallback fetch in case profile was created concurrently by the DB trigger
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (retryError || !retryData) {
            console.error('[EventHub Auth] PROFILE FAILED - Final fallback profile fetch failed:', retryError);
            console.log('[EventHub Auth] FETCH PROFILE END');
            return null;
          }
          console.log('[EventHub Auth] PROFILE FOUND (on fallback fetch)');
          console.log('[EventHub Auth] FETCH PROFILE END');
          return retryData as Profile;
        }
        console.log('[EventHub Auth] PROFILE CREATED successfully:', newProfile?.id);
        console.log('[EventHub Auth] FETCH PROFILE END');
        return newProfile as Profile;
      }
      
      console.log('[EventHub Auth] PROFILE FOUND:', data.id, 'Role:', data.role);
      console.log('[EventHub Auth] FETCH PROFILE END');
      return data as Profile;
    } catch (error) {
      console.error('[EventHub Auth] PROFILE FAILED - Unexpected error fetching/creating profile:', error);
      console.log('[EventHub Auth] FETCH PROFILE END');
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
  };

  useEffect(() => {
    console.log('[EventHub Auth] APP START');
    let active = true;
    let subscription: any = null;

    // Safety net: Force-terminate the loading state after 5 seconds if network request hangs
    const safetyTimeout = setTimeout(() => {
      if (active) {
        console.warn('[EventHub Auth] Auth initialization safety timeout triggered. Forcing load to complete.');
        setLoading(false);
        console.log('[EventHub Auth] LOADING FALSE (safety timeout)');
      }
    }, 5000);

    const initializeAuth = async () => {
      console.log('[EventHub Auth] AUTH INIT - Initializing Auth Listener');
      try {
        // Set up a single, stable auth state listener
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (!active) return;
            
            console.log('[EventHub Auth] Auth state changed event:', event, currentSession?.user?.email);

            try {
              if (currentSession?.user) {
                console.log('[EventHub Auth] SESSION FOUND - Verifying authenticity with server...');
                
                // Force loading=true during backend verification
                setLoading(true);
                
                // Validate session is actually still active on server to avoid stale logins (Safe from TypeError)
                const response = await supabase.auth.getUser();
                const verifiedUser = response.data?.user;
                const userError = response.error;
                
                if (userError || !verifiedUser) {
                  console.warn('[EventHub Auth] Session Invalid - server-side check failed. Performing cleanup.', userError);
                  await supabase.auth.signOut();
                  if (active) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                    console.log('[EventHub Auth] LOADING FALSE (invalid session)');
                    clearTimeout(safetyTimeout);
                  }
                  return;
                }

                console.log('[EventHub Auth] USER FOUND & Verified on server:', verifiedUser.email);
                console.log('[EventHub Auth] PROFILE FETCH START');

                // Load user profile
                const fullName = verifiedUser.user_metadata?.full_name || '';
                const profileData = await fetchProfile(verifiedUser.id, verifiedUser.email, fullName);
                
                if (active) {
                  if (profileData) {
                    console.log('[EventHub Auth] PROFILE FETCH SUCCESS for user:', verifiedUser.email, 'Role:', profileData.role);
                  } else {
                    console.log('[EventHub Auth] PROFILE FETCH FAILED (returned null)');
                  }
                  setSession(currentSession);
                  setUser(verifiedUser);
                  setProfile(profileData);
                  setLoading(false);
                  console.log('[EventHub Auth] LOADING FALSE (successful auth)');
                  clearTimeout(safetyTimeout);
                }
              } else {
                console.log('[EventHub Auth] User Missing - No active session detected');
                if (active) {
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                  setLoading(false);
                  console.log('[EventHub Auth] LOADING FALSE (no session)');
                  clearTimeout(safetyTimeout);
                }
              }
            } catch (callbackError) {
              console.error('[EventHub Auth] Unexpected error inside auth state change callback:', callbackError);
              if (active) {
                setLoading(false);
                console.log('[EventHub Auth] LOADING FALSE (callback exception)');
                clearTimeout(safetyTimeout);
              }
            }
          }
        );
        subscription = data?.subscription;
      } catch (error) {
        console.error('[EventHub Auth] Error during auth listener initialization:', error);
        if (active) {
          setLoading(false);
          console.log('[EventHub Auth] LOADING FALSE (error)');
          clearTimeout(safetyTimeout);
        }
      }
    };

    initializeAuth();

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';
  const isStudent = profile?.role === 'student';

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isStudent,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};