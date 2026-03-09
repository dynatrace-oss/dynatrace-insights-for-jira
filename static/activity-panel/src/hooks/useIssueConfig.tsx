import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useIssueProperties } from './useIssueProperties.ts';
import { useTenantConfigs } from './useTenantConfigs.tsx';
import type { IssueConfig, ChartType } from '../types/issue-config';

interface IssueConfigContextValue {
  config: IssueConfig
  isLoading: boolean
  error: Error | null
  isSaving: boolean
  saveConfig: (config: IssueConfig) => Promise<void>
}

const IssueConfigContext = createContext<IssueConfigContextValue | null>(null);

const DEFAULT_QUERY = 'fetch logs | makeTimeseries(count())';
const DEFAULT_CHART_TYPE: ChartType = 'line';

interface IssueConfigProviderProps {
  children: ReactNode
  issueId: string | undefined
}

export function IssueConfigProvider({ children, issueId }: IssueConfigProviderProps) {
  const { tenantConfigs } = useTenantConfigs();
  const { properties, isLoading, error, saveProperties, isSaving } = useIssueProperties<IssueConfig>({
    issueId,
    propertyName: 'dt-insights-config'
  });

  const defaultConfig: IssueConfig = useMemo(() => {
    const firstTenant = tenantConfigs[0];
    return {
      selectedTenantId: firstTenant?.id,
      tenantUrl: firstTenant?.url,
      queries: [
        {
          query: DEFAULT_QUERY,
          chartType: DEFAULT_CHART_TYPE
        }
      ]
    };
  }, [tenantConfigs]);
  console.log('Properties in IssueConfigProvider:', properties);
  // Merge saved properties with defaults
  const config: IssueConfig = useMemo(() => {
    if (!properties) {
      return defaultConfig;
    }

    const queries = properties.queries?.length > 0 ? properties.queries : defaultConfig.queries;

    return {
      selectedTenantId: properties.selectedTenantId ?? defaultConfig.selectedTenantId,
      tenantUrl: properties.tenantUrl ?? defaultConfig.tenantUrl,
      queries
    };
  }, [properties, defaultConfig]);

  const value: IssueConfigContextValue = {
    config,
    isLoading,
    error,
    isSaving,
    saveConfig: saveProperties
  };
  console.log('Value in IssueConfigProvider:', value);
  return <IssueConfigContext.Provider value={value}>{children}</IssueConfigContext.Provider>;
}

export function useIssueConfig(): IssueConfigContextValue {
  const context = useContext(IssueConfigContext);
  if (!context) {
    throw new Error('useIssueConfig must be used within an IssueConfigProvider');
  }
  return context;
}
