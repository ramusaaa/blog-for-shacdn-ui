'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/lib/notification-context';
import { Notifications } from '@/components/Notifications';
import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              {children}
              <Notifications />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 