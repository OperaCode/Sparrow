import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserProfile } from '@/types';
import { mockProfile } from '@/lib/mockData';

interface AuthContextValue {
  session: { user: { id: string; phone?: string } } | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthed: boolean;
  signIn: () => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  setProfile: (p: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: false,
  isAuthed: false,
  signIn: () => {},
  signOut: () => {},
  refreshProfile: async () => {},
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const session = isAuthed ? { user: { id: 'mock-user-id', phone: mockProfile.phone } } : null;

  const signIn = () => {
    setIsAuthed(true);
  };

  const signOut = () => {
    setIsAuthed(false);
    setProfile(null);
  };

  const refreshProfile = async () => {};

  return (
    <AuthContext.Provider value={{ session, profile, loading: false, isAuthed, signIn, signOut, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
