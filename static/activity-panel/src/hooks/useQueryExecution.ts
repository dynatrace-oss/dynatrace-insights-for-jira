import { useState } from 'react';
import { invoke } from '@forge/bridge';
import type { DqlResult } from '../types/dql';
import { resolveTimeframe, type TimeframeValue } from '../utils/timeframe';

interface UseQueryExecutionProps {
  tenantId: string | undefined
  query: string
  timeframe: TimeframeValue
}

export function useQueryExecution({ tenantId, query, timeframe }: UseQueryExecutionProps) {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [committedResult, setCommittedResult] = useState<DqlResult | null>(null);
  const [resultKey, setResultKey] = useState<number>(0);

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

      console.log('Executing DQL query with payload:', payload);

      const result = await invoke<DqlResult>('fetchDqlData', payload);

      console.log('DQL Query Result:', result);

      if (result) {
        setCommittedResult(result);
        setResultKey(k => k + 1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error executing DQL query:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    isExecuting,
    error,
    queryResult: committedResult,
    resultKey,
    executeQuery
  };
}
