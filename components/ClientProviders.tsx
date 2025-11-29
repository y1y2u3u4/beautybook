'use client';

import { ReactNode } from 'react';
import { GuideProvider } from './guide';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <GuideProvider>
      {children}
    </GuideProvider>
  );
}
