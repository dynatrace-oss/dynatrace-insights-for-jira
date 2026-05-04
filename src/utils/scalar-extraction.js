const NON_META_KEY = (key) => key !== 'timeframe' && key !== 'interval';

function coerceNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {return value;}
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) {return n;}
  }
  return null;
}

export function extractScalarFromResult(queryResult) {
  const records = queryResult?.result?.records;
  if (!records || records.length === 0) {
    return {
      ok: false,
      title: 'Query returned no data',
      hint: 'The blocking rule requires a query that returns a single numeric value.'
    };
  }
  if (records.length > 1) {
    return {
      ok: false,
      title: 'Query returned multiple records',
      hint: 'The blocking rule requires a single scalar value, but this query returned multiple records.'
    };
  }

  const record = records[0];
  const numericValues = [];
  for (const [key, value] of Object.entries(record)) {
    if (!NON_META_KEY(key)) {continue;}
    if (Array.isArray(value)) {
      const nums = value.map(coerceNumber).filter((v) => v !== null);
      if (nums.length > 1) {
        return {
          ok: false,
          title: 'Query returned a timeseries',
          hint: 'The blocking rule requires a single numeric value, but this query returned a timeseries.'
        };
      }
      if (nums.length === 1) {
        numericValues.push(nums[0]);
      }
    } else {
      const n = coerceNumber(value);
      if (n !== null) {numericValues.push(n);}
    }
  }

  if (numericValues.length === 0) {
    return {
      ok: false,
      title: 'Query returned no numeric value',
      hint: 'The blocking rule requires the query to produce a numeric field.'
    };
  }
  if (numericValues.length > 1) {
    return {
      ok: false,
      title: 'Query returned multiple numeric values',
      hint: 'The blocking rule requires exactly one numeric field.'
    };
  }

  return { ok: true, value: numericValues[0] };
}

export function compareWithOperator(value, operator, threshold) {
  switch (operator) {
    case 'lessThan': return value < threshold;
    case 'lessThanOrEqual': return value <= threshold;
    case 'greaterThan': return value > threshold;
    case 'greaterThanOrEqual': return value >= threshold;
    case 'equals': return value === threshold;
    case 'notEquals': return value !== threshold;
    default: return false;
  }
}

export function operatorLabel(operator) {
  switch (operator) {
    case 'lessThan': return '<';
    case 'lessThanOrEqual': return '≤';
    case 'greaterThan': return '>';
    case 'greaterThanOrEqual': return '≥';
    case 'equals': return '=';
    case 'notEquals': return '≠';
    default: return operator;
  }
}

const OPERATOR_PHRASE = {
  lessThan: 'less than',
  lessThanOrEqual: 'less than or equal to',
  greaterThan: 'greater than',
  greaterThanOrEqual: 'greater than or equal to',
  equals: 'equal to',
  notEquals: 'not equal to'
};

export function formatNumber(value) {
  if (!Number.isFinite(value)) {return String(value);}
  return value.toLocaleString('en-US');
}

export function formatBlockReason(value, operator, threshold) {
  const phrase = OPERATOR_PHRASE[operator] ?? operator;
  return `The Dynatrace metric currently reads ${formatNumber(value)}, which is ${phrase} the configured threshold of ${formatNumber(threshold)}.`;
}
