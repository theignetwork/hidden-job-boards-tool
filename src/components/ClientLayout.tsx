'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AppWrapper from '@/components/AppWrapper';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <AppWrapper>
          {children}
        </AppWrapper>
      </AuthProvider>
    </Suspense>
  );
}
