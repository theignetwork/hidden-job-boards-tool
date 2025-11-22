"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

// This component wraps the application to provide user context and data
interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { wpUserId, loading: authLoading } = useAuth();
  
  // Show authenticating state while JWT is being verified
  if (authLoading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Authenticating...</div>
      </div>
    );
  }
  
  // Pass the verified WordPress user ID to children components
  const userId = wpUserId ? String(wpUserId) : null;
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { userId } as any);
    }
    return child;
  });
  
  return (
    <div className="bg-gray-950 min-h-screen">
      {childrenWithProps}
    </div>
  );
}
