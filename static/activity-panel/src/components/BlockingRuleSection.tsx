import { useCallback, useState } from 'react';
import Button from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import Spinner from '@atlaskit/spinner';
import { invoke } from '@forge/bridge';
import { QueryEditor } from './dql/QueryEditor.tsx';
import { TimeframeSelector } from './TimeframeSelector.tsx';
import type { BlockingOperator, BlockingRule } from '../types/issue-config.ts';
import type { TimeframeValue } from '../utils/timeframe.ts';

interface BlockingRuleSectionProps {
  rule: BlockingRule
  tenantId: string | undefined
  onChange: (rule: BlockingRule) => void
}

type PreviewResult =
  | { status: 'ok'; value: number; wouldBlock: boolean; operator: BlockingOperator; threshold: number; operatorLabel: string; reason: string | null }
  | { status: 'not_scalar'; title: string; hint: string }
  | { status: 'query_error'; error: string; errorMessage?: string; code?: number }
  | { status: 'invalid'; title: string; hint: string }

const formatNumber = (n: number) => (Number.isFinite(n) ? n.toLocaleString('en-US') : String(n));

const OPERATORS: BlockingOperator[] = [
  'lessThan',
  'lessThanOrEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'equals',
  'notEquals'
];

const OPERATOR_LABELS: Record<BlockingOperator, string> = {
  lessThan: '<',
  lessThanOrEqual: '≤',
  greaterThan: '>',
  greaterThanOrEqual: '≥',
  equals: '=',
  notEquals: '≠'
};

const OPERATOR_DESCRIPTIONS: Record<BlockingOperator, string> = {
  lessThan: 'less than',
  lessThanOrEqual: 'less than or equal',
  greaterThan: 'greater than',
  greaterThanOrEqual: 'greater than or equal',
  equals: 'equal to',
  notEquals: 'not equal to'
};

export function BlockingRuleSection({ rule, tenantId, onChange }: BlockingRuleSectionProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(rule.enabled);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [invocationError, setInvocationError] = useState<string | null>(null);

  const updateRule = (patch: Partial<BlockingRule>) => onChange({ ...rule, ...patch });

  const evaluateNow = useCallback(async () => {
    setIsEvaluating(true);
    setInvocationError(null);
    try {
      const result = await invoke<PreviewResult>('previewBlockingRule', {
        tenantId,
        query: rule.query,
        timeframe: rule.timeframe ?? '2h',
        operator: rule.operator,
        threshold: rule.threshold
      });
      setPreview(result);
    } catch (err) {
      setInvocationError(err instanceof Error ? err.message : 'Failed to evaluate rule');
    } finally {
      setIsEvaluating(false);
    }
  }, [tenantId, rule.query, rule.timeframe, rule.operator, rule.threshold]);

  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md">
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Blocking rule
          </span>
          {rule.enabled && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              enabled
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={e => updateRule({ enabled: e.target.checked })}
            />
            <span>Prevent closing the issue when this rule is violated</span>
          </label>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            The query must return a single numeric value. When the target status is in the Done category,
            the transition is blocked if the value is {OPERATOR_DESCRIPTIONS[rule.operator]} the threshold.
          </p>

          <div className="flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <QueryEditor
                query={rule.query}
                tenantId={tenantId}
                onQueryChange={(q) => updateRule({ query: q })}
                onExecute={evaluateNow}
                isExecuting={isEvaluating}
              />
            </div>
            <div className="shrink-0 self-stretch flex flex-col gap-2">
              <TimeframeSelector
                value={rule.timeframe ?? '2h'}
                onChange={(tf: TimeframeValue) => updateRule({ timeframe: tf })}
              />
              <Button
                onClick={evaluateNow}
                isDisabled={isEvaluating || !rule.query.trim() || !tenantId}
              >
                {isEvaluating ? 'Running...' : 'Evaluate now'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Block when value is</span>
            <DropdownMenu trigger={OPERATOR_LABELS[rule.operator]} shouldRenderToParent spacing="compact">
              <DropdownItemGroup>
                {OPERATORS.map(op => (
                  <DropdownItem
                    key={op}
                    onClick={() => updateRule({ operator: op })}
                    isSelected={op === rule.operator}
                  >
                    {OPERATOR_LABELS[op]} — {OPERATOR_DESCRIPTIONS[op]}
                  </DropdownItem>
                ))}
              </DropdownItemGroup>
            </DropdownMenu>
            <input
              type="number"
              value={Number.isFinite(rule.threshold) ? rule.threshold : 0}
              onChange={e => updateRule({ threshold: parseFloat(e.target.value) })}
              className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {isEvaluating && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Spinner size="small" />
              <span>Evaluating query...</span>
            </div>
          )}

          {!isEvaluating && invocationError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
              {invocationError}
            </div>
          )}

          {!isEvaluating && preview?.status === 'query_error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
              {preview.errorMessage ?? preview.error}
            </div>
          )}

          {!isEvaluating && (preview?.status === 'not_scalar' || preview?.status === 'invalid') && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                {preview.title}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {preview.hint}
              </p>
            </div>
          )}

          {!isEvaluating && preview?.status === 'ok' && (
            <div
              className={`p-3 rounded-md text-sm border ${
                preview.wouldBlock
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              }`}
            >
              {preview.wouldBlock ? (
                <>
                  <strong>Closing will be blocked.</strong> {preview.reason}
                </>
              ) : (
                <>
                  <strong>Closing is allowed.</strong>{' '}
                  Current value {formatNumber(preview.value)} satisfies the rule ({preview.operatorLabel} {formatNumber(preview.threshold)}).
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
