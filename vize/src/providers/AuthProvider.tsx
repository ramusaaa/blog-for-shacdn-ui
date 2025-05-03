'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, code?: string) => Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isTwoFactorRequired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTwoFactorRequired, setIsTwoFactorRequired] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name as string,
        email: session.user.email as string,
        image: session.user.image as string,
      });
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [session, status]);

  const signIn = async (email: string, password: string, code?: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        code,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setIsTwoFactorRequired(true);
          return { success: false, requiresTwoFactor: true };
        }
        return { success: false, error: result.error };
      }

      setIsTwoFactorRequired(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Giriş yapılırken bir hata oluştu' };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt olurken bir hata oluştu');
      }

      // Kayıt başarılı olduktan sonra otomatik giriş yap
      await signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      setIsTwoFactorRequired(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, signIn, signUp, signOut, isLoading, isTwoFactorRequired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 