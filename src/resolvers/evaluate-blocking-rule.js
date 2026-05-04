import api, { route } from '@forge/api';
import { fetchDqlData } from './fetch-dql-data';
import {
  compareWithOperator,
  extractScalarFromResult,
  formatBlockReason,
  operatorLabel
} from '../utils/scalar-extraction';

const ISSUE_PROPERTY_NAME = 'dt-insights-config';

const PRESET_TIMEFRAME_MS = {
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000
};

function resolveTimeframeWindow(timeframe) {
  const now = new Date();
  if (timeframe && typeof timeframe === 'object' && 'from' in timeframe && 'to' in timeframe) {
    return { from: new Date(timeframe.from), to: new Date(timeframe.to) };
  }
  if (timeframe === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: start, to: now };
  }
  if (timeframe === 'yesterday') {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { from: start, to: end };
  }
  const ms = PRESET_TIMEFRAME_MS[timeframe] ?? PRESET_TIMEFRAME_MS['2h'];
  return { from: new Date(now.getTime() - ms), to: now };
}

async function getIssueConfig(issueId) {
  const res = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueId}/properties/${ISSUE_PROPERTY_NAME}`,
    { method: 'GET' }
  );
  if (!res.ok) {return null;}
  const data = await res.json();
  return data.value ?? null;
}

export async function runBlockingEvaluation({ tenantId, query, timeframe, operator, threshold }) {
  if (!tenantId || !query) {
    return { status: 'invalid', title: 'Missing input', hint: 'Both tenant and query are required to evaluate the rule.' };
  }

  const { from, to } = resolveTimeframeWindow(timeframe);
  const queryResult = await fetchDqlData({
    payload: {
      tenantId,
      query,
      defaultTimeframeStart: from.toISOString(),
      defaultTimeframeEnd: to.toISOString()
    }
  });

  if (queryResult?.error || queryResult?.code) {
    return {
      status: 'query_error',
      error: queryResult.error ?? 'Query execution failed',
      errorMessage: queryResult.errorMessage,
      code: queryResult.code
    };
  }

  console.log(JSON.stringify(queryResult));

  const scalar = extractScalarFromResult(queryResult);
  if (!scalar.ok) {
    return { status: 'not_scalar', title: scalar.title, hint: scalar.hint };
  }

  const wouldBlock = compareWithOperator(scalar.value, operator, threshold);
  return {
    status: 'ok',
    value: scalar.value,
    wouldBlock,
    operator,
    threshold,
    operatorLabel: operatorLabel(operator),
    reason: wouldBlock ? formatBlockReason(scalar.value, operator, threshold) : null
  };
}

export const previewBlockingRule = async (req) => {
  const { tenantId, query, timeframe, operator, threshold } = req.payload ?? {};
  return runBlockingEvaluation({ tenantId, query, timeframe, operator, threshold });
};

const ALLOW = { result: true };

function block(message) {
  return { result: false, errorMessage: message };
}

export const evaluateBlockingRule = async (event) => {
  console.log('[blockingValidator] invoked', JSON.stringify({ event }, null, 2));
  const payload = event?.payload ?? event ?? {};
  const issue = payload.issue ?? {};
  const transition = payload.transition ?? {};
  const targetCategory = transition?.to?.statusCategory?.key
    ?? transition?.toStatus?.statusCategory?.key
    ?? transition?.destinationStatus?.statusCategory?.key;

  console.log('[blockingValidator] extracted', JSON.stringify({
    issue,
    transition,
    targetCategory
  }));

  if (targetCategory && targetCategory !== 'done') {
    console.log('[blockingValidator] allow: target category is not done', targetCategory);
    return ALLOW;
  }

  const issueId = issue.id ?? issue.issueId ?? issue.key;
  if (!issueId) {
    console.log('[blockingValidator] allow: no issueId in payload');
    return ALLOW;
  }

  const config = await getIssueConfig(issueId);
  console.log('[blockingValidator] loaded issue config', JSON.stringify(config));
  const rule = config?.blockingRule;
  if (!rule || !rule.enabled || !rule.query || !config?.selectedTenantId) {
    console.log('[blockingValidator] allow: rule missing/disabled or no tenant', {
      hasRule: Boolean(rule),
      enabled: rule?.enabled,
      hasQuery: Boolean(rule?.query),
      tenantId: config?.selectedTenantId
    });
    return ALLOW;
  }

  const evaluation = await runBlockingEvaluation({
    tenantId: config.selectedTenantId,
    query: rule.query,
    timeframe: rule.timeframe,
    operator: rule.operator,
    threshold: rule.threshold
  });
  console.log('[blockingValidator] evaluation result', JSON.stringify(evaluation));

  switch (evaluation.status) {
  case 'query_error':
    return block(`This issue cannot be closed — the Dynatrace query failed to run: ${evaluation.errorMessage ?? evaluation.error}`);
  case 'not_scalar':
    return block(`This issue cannot be closed — ${evaluation.title.toLowerCase()}. ${evaluation.hint}`);
  case 'ok':
    if (evaluation.wouldBlock) {
      return block(`This issue cannot be closed yet. ${evaluation.reason}`);
    }
    return ALLOW;
  default:
    return ALLOW;
  }
};
