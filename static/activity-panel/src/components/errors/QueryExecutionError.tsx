import type { DqlResult } from '../../types/dql';
import type { TenantConfig } from '../../types/tenant';
import { AlertIcon } from '../../assets/icons/AlertIcon';
import { ExternalLinkIcon } from '../../assets/icons/ExternalLinkIcon';
import { openSettingsPage } from '../../utils/navigation';

interface QueryExecutionErrorProps {
  queryResult: DqlResult
  currentTenant?: TenantConfig
}

export function QueryExecutionError({ queryResult, currentTenant }: QueryExecutionErrorProps) {
  const isAuthError = queryResult.code === 401 || queryResult.code === 403;
  const hasExtraInfo = queryResult.code || queryResult.exceptionType || currentTenant;

  return (
    <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
      <AlertIcon className="text-red-400 dark:text-red-500" />

      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Query execution failed: <span className="text-xs text-gray-500 dark:text-gray-400">{queryResult.error}</span>
      </p>

      {queryResult.errorMessage && (
        <pre className="w-full max-w-lg text-center text-sm font-mono font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 whitespace-pre-wrap break-words">
          {queryResult.errorMessage}
        </pre>
      )}

      {isAuthError && (
        <div className="w-full max-w-lg rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Authentication failed
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            The authentication token may have expired or is invalid. Please check your tenant configuration.
          </p>
          <button
            onClick={() => openSettingsPage()}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Go to configuration
            <ExternalLinkIcon />
          </button>
        </div>
      )}

      {hasExtraInfo && (
        <div className="w-full max-w-lg text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-1">
          {queryResult.code && (
            <p><span className="font-medium">Error code:</span> {queryResult.code}</p>
          )}
          {queryResult.exceptionType && (
            <p><span className="font-medium">Exception:</span> {queryResult.exceptionType}</p>
          )}
          {currentTenant && (
            <>
              <p><span className="font-medium">Tenant URL:</span> {currentTenant.url}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
