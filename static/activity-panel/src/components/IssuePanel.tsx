import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import { ChartContainer } from './charts/ChartContainer.tsx';
import { ChartTypeSelector } from './charts/ChartTypeSelector.tsx';
import { TimeframeSelector } from './TimeframeSelector.tsx';
import { QueryEditor } from './dql/QueryEditor.tsx';
import { ConnectionError } from './errors/ConnectionError.tsx';
import { QueryExecutionError } from './errors/QueryExecutionError.tsx';
import { useIssueConfig } from '../hooks/useIssueConfig.tsx';
import { useIssueState } from '../hooks/useIssueState.ts';
import { useQueryExecution } from '../hooks/useQueryExecution.ts';
import { useTenantConfigs } from '../hooks/useTenantConfigs.tsx';
import { useAutoExecuteQuery } from '../hooks/useAutoExecuteQuery.ts';
import { TenantSelector } from './TenantSelector.tsx';

export function IssuePanel() {
  const { config, isSaving, saveConfig } = useIssueConfig();
  const { tenantConfigs } = useTenantConfigs();

  const { query, chartType, timeframe, selectedTenantId, updateQuery, updateChartType, updateTimeframe, updateSelectedTenantId } = useIssueState({ config, isLoadingConfig: false });

  const { isExecuting, error, queryResult, resultKey, executeQuery } = useQueryExecution({
    tenantId: selectedTenantId,
    query: query,
    timeframe: timeframe
  });

  const handleSave = async () => {
    const currentTenantUrl = tenantConfigs.find(t => t.id === selectedTenantId)?.url;
    await saveConfig({
      ...config,
      selectedTenantId,
      tenantUrl: currentTenantUrl,
      queries: [{ query, chartType, timeframe }]
    });
  };

  useAutoExecuteQuery({ query, selectedTenantId, executeQuery });

  // Get current tenant info for error display
  const currentTenant = tenantConfigs.find(t => t.id === selectedTenantId);

  // Check if result has backend errors (like 403, token expired, etc.)
  const hasBackendError = queryResult && (queryResult.error || queryResult.code);
  const isQuerySucceeded = queryResult && queryResult.state === 'SUCCEEDED' && !hasBackendError;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0 self-stretch flex flex-col">
          <div className="flex-1 h-full">
            <QueryEditor
              query={query}
              tenantId={selectedTenantId}
              onQueryChange={updateQuery}
              onExecute={executeQuery}
              isExecuting={isExecuting}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between shrink-0 self-stretch gap-2">
          <TenantSelector
            tenants={tenantConfigs}
            selectedTenantId={selectedTenantId}
            onChange={updateSelectedTenantId}
          />
          <TimeframeSelector value={timeframe} onChange={updateTimeframe} />
          <div className="flex justify-between gap-2 mt-auto w-full">
            <Button
              onClick={executeQuery}
              isDisabled={isExecuting || !query.trim()}
              appearance="primary"
            >
              {isExecuting ? 'Running...' : 'Run Query'}
            </Button>
            <Button
              onClick={handleSave}
              isDisabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save to Issue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Network/invocation errors */}
      {error && <ConnectionError error={error} />}

      {/* Backend errors (403, token expired, etc.) */}
      {hasBackendError && (
        <QueryExecutionError queryResult={queryResult} currentTenant={currentTenant} />
      )}

      {/* Query results with overlay spinner during execution */}
      {(isExecuting || isQuerySucceeded) && (
        <div className="relative mt-4 space-y-2">
          {isQuerySucceeded && (
            <>
              <div className="flex items-center justify-between">
                <ChartTypeSelector selectedType={chartType} onTypeChange={updateChartType} />
              </div>
              <ChartContainer key={resultKey} data={queryResult} type={chartType} />
            </>
          )}
          {isExecuting && (
            <div className="absolute inset-0 flex items-center justify-center rounded bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm" style={{ minHeight: '120px' }}>
              <Spinner size="large" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
