"use client";

import React, { useState } from 'react';
import { useJobBoards } from '@/hooks/useJobBoards';
import { useFavorites } from '@/hooks/useFavorites';

// This component wraps the application to provide user context and data
interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  // In a real implementation, this would come from the membership site
  const [userId, setUserId] = useState<string>('test-user-id');
  
  // Pass the userId to the children components
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
