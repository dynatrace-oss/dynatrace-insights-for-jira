import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SeriesData } from '../types/dql';
import { ECHARTS_COLORS } from '../utils/chart-options';

/**
 * Hook to manage chart legend state including series sorting, color mapping, and visibility toggling.
 */
export function useLegendState(seriesData: SeriesData[]) {
  // Sort series by total value (descending) - most significant series first
  const sortedSeriesData = useMemo(() => {
    return [...seriesData].sort((a, b) => {
      const sumA = a.data.reduce<number>((acc, val) => acc + (val ?? 0), 0);
      const sumB = b.data.reduce<number>((acc, val) => acc + (val ?? 0), 0);
      return sumB - sumA;
    });
  }, [seriesData]);

  // Create a stable color map based on sorted series order
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    sortedSeriesData.forEach((s, index) => {
      map.set(s.name, ECHARTS_COLORS[index % ECHARTS_COLORS.length]);
    });
    return map;
  }, [sortedSeriesData]);

  // Track enabled series for legend filtering
  const [enabledSeries, setEnabledSeries] = useState<Set<string>>(new Set());

  // Sync enabled series when seriesData changes (e.g., new query results)
  useEffect(() => {
    setEnabledSeries(new Set(sortedSeriesData.map(s => s.name)));
  }, [sortedSeriesData]);

  // Handle toggling series visibility
  const toggleSeries = useCallback((seriesName: string) => {
    setEnabledSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesName)) {
        // Don't allow disabling all series
        if (newSet.size > 1) {
          newSet.delete(seriesName);
        }
      } else {
        newSet.add(seriesName);
      }
      return newSet;
    });
  }, []);

  // Filter series data based on enabled series
  const filteredSeriesData = useMemo(
    () => sortedSeriesData.filter(s => enabledSeries.has(s.name)),
    [sortedSeriesData, enabledSeries]
  );

  return {
    sortedSeriesData,
    filteredSeriesData,
    colorMap,
    enabledSeries,
    toggleSeries
  };
}
