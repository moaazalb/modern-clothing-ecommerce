
'use client';

import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { Provider } from 'react-redux';

import { makeStore } from '@/store/store';
import type { AppStore } from '@/store/store';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provides a single Redux store instance to the application.
 */
export function StoreProvider({
  children,
}: StoreProviderProps): ReactElement {
  const [store] = useState<AppStore>(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}
