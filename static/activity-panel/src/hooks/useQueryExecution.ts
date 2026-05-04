import { useState } from 'react';
import { invoke } from '@forge/bridge';
import type { DqlResult } from '../types/dql';
import { resolveTimeframe, type TimeframeValue } from '../utils/timeframe';

interface UseQueryExecutionProps {
  tenantId: string | undefined
  query: string
  timeframe: TimeframeValue
}

interface ExecutedParams {
  query: string;
  timeframe: TimeframeValue;
  tenantId: string | undefined;
}

export function useQueryExecution({ tenantId, query, timeframe }: UseQueryExecutionProps) {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [committedResult, setCommittedResult] = useState<DqlResult | null>(null);
  const [resultKey, setResultKey] = useState<number>(0);
  const [executedParams, setExecutedParams] = useState<ExecutedParams | null>(null);

  const executeQuery = async () => {
    setIsExecuting(true);
    setError(null);

    try {
      const { from, to } = resolveTimeframe(timeframe);

      const payload = {
        tenantId,
        query,
        defaultTimeframeStart: from.toISOString(),
        defaultTimeframeEnd: to.toISOString()
      };

      const result = await invoke<DqlResult>('fetchDqlData', payload);

      if (result) {
        setCommittedResult(result);
        setResultKey(k => k + 1);
        setExecutedParams({ query, timeframe, tenantId });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error executing DQL query:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const isDirty = executedParams !== null && (
    executedParams.query !== query ||
    executedParams.tenantId !== tenantId ||
    JSON.stringify(executedParams.timeframe) !== JSON.stringify(timeframe)
  );

  return {
    isExecuting,
    error,
    queryResult: committedResult,
    resultKey,
    executeQuery,
    isDirty,
  };
}
