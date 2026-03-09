import { useCallback, useEffect, useState } from 'react';
import type { ChartType, IssueConfig } from '../types/issue-config';
import type { TimeframeValue } from '../utils/timeframe';

interface UseIssueStateProps {
  config: IssueConfig
  isLoadingConfig: boolean
}

const DEFAULT_TIMEFRAME: TimeframeValue = '2h';

export function useIssueState({ config, isLoadingConfig }: UseIssueStateProps) {
  const [query, setQuery] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeframe, setTimeframe] = useState<TimeframeValue>(DEFAULT_TIMEFRAME);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoadingConfig && config.queries[0]) {
      setQuery(config.queries[0].query);
      setChartType(config.queries[0].chartType);
      if (config.queries[0].timeframe) {
        setTimeframe(config.queries[0].timeframe);
      }
      setSelectedTenantId(config.selectedTenantId);
    }
  }, [isLoadingConfig, config]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateChartType = useCallback((newChartType: ChartType) => {
    setChartType(newChartType);
  }, []);

  const updateTimeframe = useCallback((newTimeframe: TimeframeValue) => {
    setTimeframe(newTimeframe);
  }, []);

  return {
    query,
    chartType,
    timeframe,
    selectedTenantId,
    updateQuery,
    updateChartType,
    updateTimeframe,
    updateSelectedTenantId: setSelectedTenantId
  };
}
