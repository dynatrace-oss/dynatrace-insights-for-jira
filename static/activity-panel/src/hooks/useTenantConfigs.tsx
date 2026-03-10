import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';
import type { TenantConfig, TenantConfigsResponse } from '../types/tenant';

interface TenantConfigsContextValue {
  tenantConfigs: TenantConfig[]
  isLoading: boolean
  error: Error | null
}

const TenantConfigsContext = createContext<TenantConfigsContextValue | null>(null);

function TenantConfigsProviderInner({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tenantConfigs'],
    queryFn: async () => {
      const result = await invoke<TenantConfigsResponse>('getTenantConfigs');
      return result.tenantConfigs;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const value: TenantConfigsContextValue = {
    tenantConfigs: data ?? [],
    isLoading,
    error: error as Error | null
  };

  return (
    <TenantConfigsContext.Provider value={value}>
      {children}
    </TenantConfigsContext.Provider>
  );
}

export function TenantConfigsProvider({ children }: { children: ReactNode }) {
  return (
    <TenantConfigsProviderInner>{children}</TenantConfigsProviderInner>
  );
}

export function useTenantConfigs(): TenantConfigsContextValue {
  const context = useContext(TenantConfigsContext);
  if (!context) {
    throw new Error('useTenantConfigs must be used within a TenantConfigsProvider');
  }
  return context;
}
