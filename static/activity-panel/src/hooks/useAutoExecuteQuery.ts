import { useEffect, useRef } from 'react';
interface UseAutoExecuteQueryProps {
  isLoadingConfig: boolean;
  query: string;
  selectedTenantId: string | undefined;
  executeQuery: () => void;
}
export function useAutoExecuteQuery({ isLoadingConfig, query, selectedTenantId, executeQuery }: UseAutoExecuteQueryProps) {
  const hasAutoExecuted = useRef(false);
  useEffect(() => {
    if (!isLoadingConfig && query && selectedTenantId && !hasAutoExecuted.current) {
      hasAutoExecuted.current = true;
      executeQuery();
    }
  }, [isLoadingConfig, query, selectedTenantId]);
}
