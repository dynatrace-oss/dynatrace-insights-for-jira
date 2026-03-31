import { useEffect, useRef } from 'react';
interface UseAutoExecuteQueryProps {
  query: string;
  selectedTenantId: string | undefined;
  executeQuery: () => void;
}
export function useAutoExecuteQuery({ query, selectedTenantId, executeQuery }: UseAutoExecuteQueryProps) {
  const hasAutoExecuted = useRef(false);
  useEffect(() => {
    if (query && selectedTenantId && !hasAutoExecuted.current) {
      hasAutoExecuted.current = true;
      executeQuery();
    }
  }, [query, selectedTenantId]);
}
