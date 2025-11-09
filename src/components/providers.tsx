"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { useState } from 'react'
import { AuthProvider } from './auth-provider'
import { AdminAuthProvider } from './admin/AdminAuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <AdminAuthProvider>
            {children}
            <Toaster
              position="top-center"
              expand={false}
              richColors
              toastOptions={{
                style: {
                  background: 'rgba(12, 16, 28, 0.95)',
                  color: 'white',
                  border: '1px solid rgba(75, 142, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  backdropFilter: 'blur(12px)',
                  maxWidth: '500px',
                  wordBreak: 'break-word',
                  marginTop: 'max(env(safe-area-inset-top), 16px)',
                  marginLeft: 'max(env(safe-area-inset-left), 16px)',
                  marginRight: 'max(env(safe-area-inset-right), 16px)',
                },
                className: 'sonner-toast',
              }}
            />
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
