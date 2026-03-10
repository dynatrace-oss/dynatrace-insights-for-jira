import type { TimeseriesRecord, SeriesData } from '../types/dql';

/**
 * Generate time points for a timeseries based on start time, interval, and count
 */
export function generateTimePoints(start: string, intervalNs: string, count: number): string[] {
  const startTime = new Date(start).getTime();
  const intervalMs = parseInt(intervalNs) / 1_000_000; // Convert nanoseconds to milliseconds

  return Array.from({ length: count }, (_, i) => {
    return new Date(startTime + i * intervalMs).toISOString();
  });
}

/**
 * Find the metric key (array with numeric data) and grouping key (dimension) in a record
 */
function findMetricAndGroupingKeys(record: TimeseriesRecord): { metricKey: string | null; groupingKey: string | null } {
  let metricKey: string | null = null;
  let groupingKey: string | null = null;

  for (const [key, value] of Object.entries(record)) {
    if (key === 'timeframe' || key === 'interval') {
      continue;
    }

    if (Array.isArray(value)) {
      // This is the metric array (e.g., "count()")
      const hasNumericData = value.some(v => typeof v === 'number');
      if (hasNumericData) {
        metricKey = key;
      }
    } else {
      // This is a grouping dimension (e.g., "service.name")
      groupingKey = key;
    }
  }

  return { metricKey, groupingKey };
}

/**
 * Extract series data from multiple DQL timeseries records.
 * Handles both single-record results and multi-record results with grouping dimensions.
 */
export function extractSeriesFromRecords(records: TimeseriesRecord[]): SeriesData[] {
  if (records.length === 0) {
    return [];
  }

  const { metricKey, groupingKey } = findMetricAndGroupingKeys(records[0]);

  if (!metricKey) {
    return [];
  }

  // Check if we have multiple records with a grouping dimension
  if (records.length > 1 && groupingKey) {
    // Multi-series: each record is a separate series, named by the grouping value
    return records.map(record => {
      const groupingValue = record[groupingKey];
      const seriesName = groupingValue !== null && groupingValue !== undefined ? String(groupingValue) : '(empty)';
      const data = record[metricKey] as (number | null)[];

      return {
        name: seriesName,
        data: data.map(v => (typeof v === 'number' ? v : null))
      };
    });
  }

  // Single record: extract all metric arrays as separate series
  return extractSeriesData(records[0]);
}

/**
 * Extract series data from a single DQL timeseries record
 * Handles undefined/null values by converting them to null for proper chart rendering
 */
export function extractSeriesData(record: TimeseriesRecord): SeriesData[] {
  const series: SeriesData[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (key === 'timeframe' || key === 'interval') {continue;}

    if (Array.isArray(value)) {
      // Check if it's a timeseries array (contains mostly numbers, nulls, or undefined)
      const hasNumericData = value.some(v => typeof v === 'number');

      if (hasNumericData) {
        // Convert undefined/null to null for proper chart gaps
        const sanitizedData = value.map(v =>
          typeof v === 'number' ? v : null
        );

        series.push({
          name: key,
          data: sanitizedData
        });
      }
    }
  }

  return series;
}

/**
 * Format large numbers with K/M suffixes for chart axis labels
 */
export function formatAxisValue(value: number): string {
  if (value >= 1000000) {return `${(value / 1000000).toFixed(1)}M`;}
  if (value >= 1000) {return `${(value / 1000).toFixed(1)}K`;}
  return value.toString();
}
