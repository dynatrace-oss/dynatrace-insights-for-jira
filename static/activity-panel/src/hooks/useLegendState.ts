import { useState, useCallback, useMemo } from 'react';
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

  const [disabledSeries, setDisabledSeries] = useState<Set<string>>(new Set());

  // Handle toggling series visibility
  const toggleSeries = useCallback((seriesName: string) => {
    setDisabledSeries(prev => {
      if (prev.has(seriesName)) {
        // Currently hidden → show it
        const next = new Set(prev);
        next.delete(seriesName);
        return next;
      }
      // Currently visible → hide it, but never hide the last visible series
      const visibleCount = sortedSeriesData.length - prev.size;
      if (visibleCount <= 1) { return prev; }
      return new Set([...prev, seriesName]);
    });
  }, [sortedSeriesData]);

  // Filter series data based on disabled series
  const filteredSeriesData = useMemo(
    () => sortedSeriesData.filter(s => !disabledSeries.has(s.name)),
    [sortedSeriesData, disabledSeries]
  );

  return {
    sortedSeriesData,
    filteredSeriesData,
    colorMap,
    disabledSeries,
    toggleSeries
  };
}
