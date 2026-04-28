import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import { useRef, useCallback } from 'react';
import type { ECharts } from 'echarts';
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
import { DqlQueryNotifications } from './DqlQueryNotifications.tsx';
import { useIssueId } from '../hooks/useIssueId.ts';
import { usePostSnapshot } from '../hooks/usePostSnapshot.ts';

const snapshotButtonLabels: Record<string, string> = {
  posting: 'Posting...',
  success: 'Posted!',
  error: 'Retry',
  idle: 'Share as Jira Comment',
};

export function IssuePanel() {
  const { config, isSaving, saveConfig } = useIssueConfig();
  const { tenantConfigs } = useTenantConfigs();
  const issueId = useIssueId();
  const echartsRef = useRef<ECharts | null>(null);

  const { query, chartType, timeframe, selectedTenantId, updateQuery, updateChartType, updateTimeframe, updateSelectedTenantId } = useIssueState({ config, isLoadingConfig: false });

  const { isExecuting, error, queryResult, resultKey, executeQuery } = useQueryExecution({
    tenantId: selectedTenantId,
    query,
    timeframe,
  });

  const currentTenant = tenantConfigs.find(t => t.id === selectedTenantId);

  const { status: snapshotStatus, error: snapshotError, postSnapshot } = usePostSnapshot({
    issueId,
    echartsRef,
    query,
    tenantUrl: currentTenant?.url,
    timeframe,
  });

  const handleSave = async () => {
    await saveConfig({
      ...config,
      selectedTenantId,
      tenantUrl: currentTenant?.url,
      queries: [{ query, chartType, timeframe }]
    });
  };

  const handleChartReady = useCallback((instance: ECharts) => {
    echartsRef.current = instance;
  }, []);

  useAutoExecuteQuery({ query, selectedTenantId, executeQuery });

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

      {error && <ConnectionError error={error} />}

      {hasBackendError && (
        <QueryExecutionError queryResult={queryResult} currentTenant={currentTenant} />
      )}

      {(isExecuting || isQuerySucceeded) && (
        <div className="relative mt-4">
          <div className="space-y-2">
            {isQuerySucceeded && (
              <>
                <div className="flex items-center justify-between">
                  <ChartTypeSelector selectedType={chartType} onTypeChange={updateChartType} />
                  <Button
                    onClick={postSnapshot}
                    isDisabled={snapshotStatus !== 'idle'}
                    appearance={snapshotStatus === 'success' ? 'primary' : 'default'}
                  >
                    {snapshotButtonLabels[snapshotStatus]}
                  </Button>
                </div>
                {snapshotStatus === 'error' && snapshotError && (
                  <div className="text-red-600 dark:text-red-400 text-sm">{snapshotError}</div>
                )}
                <DqlQueryNotifications queryResult={queryResult} />
                <ChartContainer key={resultKey} data={queryResult} type={chartType} onChartReady={handleChartReady} />
              </>
            )}
          </div>
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
