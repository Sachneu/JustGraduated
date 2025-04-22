import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

const MainLayout = ({ children }) => {
  // Redirect to onboarding (add logic here if needed)

  return (
    <ClerkProvider>
      <div className="container mx-auto mt-24 mb-20">{children}</div>
    </ClerkProvider>
  );
};

export default MainLayout;