import { useState, useRef, useEffect, useCallback } from 'react';
import { invoke } from '@forge/bridge';

export interface QueryError {
  message: string;
  start: {
    column: number;
    index: number;
    line: number;
  };
  end: {
    column: number;
    index: number;
    line: number;
  };
}

interface VerifyResponse {
  errors: QueryError[];
}

interface UseQueryVerificationOptions {
  tenantId: string | undefined;
  query: string;
  enabled: boolean;
  debounceMs?: number;
}

interface UseQueryVerificationReturn {
  errors: QueryError[];
  isVerifying: boolean;
}

export function useQueryVerification({
  tenantId,
  query,
  enabled,
  debounceMs = 500
}: UseQueryVerificationOptions): UseQueryVerificationReturn {
  const [errors, setErrors] = useState<QueryError[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVerifiedQueryRef = useRef<string>('');

  const verifyQuery = useCallback(async (queryToVerify: string) => {
    if (!queryToVerify.trim() || !tenantId) {
      setErrors([]);
      return;
    }

    if (queryToVerify === lastVerifiedQueryRef.current) {
      return;
    }

    setIsVerifying(true);

    try {
      const response = await invoke<VerifyResponse>('verifyDqlQuery', {
        tenantId,
        query: queryToVerify
      });

      lastVerifiedQueryRef.current = queryToVerify;
      setErrors(response?.errors || []);
    } catch (err) {
      console.error('Error verifying DQL query:', err); // eslint-disable-line no-console
      setErrors([]);
    } finally {
      setIsVerifying(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      verifyQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, enabled, debounceMs, verifyQuery]);

  useEffect(() => {
    if (!enabled) {
      setErrors([]);
      lastVerifiedQueryRef.current = '';
    }
  }, [enabled]);

  return {
    errors,
    isVerifying
  };
}
