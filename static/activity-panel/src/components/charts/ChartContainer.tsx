import { useMemo, memo } from 'react';
import type { ECharts } from 'echarts';
import { extractSeriesFromRecords, generateTimePoints } from '../../utils/dql-data.ts';
import { ECHARTS_COLORS } from '../../utils/chart-options.ts';
import type { DqlResult } from '../../types/dql.ts';
import { LineChart } from './LineChart.tsx';
import { BarChart } from './BarChart.tsx';
import { NoTimeseriesData } from './NoTimeseriesData.tsx';

type ChartType = 'line' | 'bar'

interface ChartContainerProps {
  data: DqlResult
  type?: ChartType
  onChartReady?: (instance: ECharts) => void
}

export const ChartContainer = memo(({ data, type = 'line', onChartReady }: ChartContainerProps) => {
  const records = data?.result?.records;

  const seriesData = useMemo(
    () => records?.length ? extractSeriesFromRecords(records) : [],
    [records]
  );

  const { sortedSeriesData, colorMap } = useMemo(() => {
    const sorted = [...seriesData].sort((a, b) => {
      const sumA = a.data.reduce<number>((acc, val) => acc + (val ?? 0), 0);
      const sumB = b.data.reduce<number>((acc, val) => acc + (val ?? 0), 0);
      return sumB - sumA;
    });

    const colors = new Map<string, string>();
    sorted.forEach((s, i) => colors.set(s.name, ECHARTS_COLORS[i % ECHARTS_COLORS.length]));

    return { sortedSeriesData: sorted, colorMap: colors };
  }, [seriesData]);

  if (!records?.length) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
        No data available for chart
      </div>
    );
  }

  if (sortedSeriesData.length === 0) {
    return <NoTimeseriesData />;
  }

  const record = records[0];
  const timePoints = generateTimePoints(
    record.timeframe.start,
    record.interval,
    sortedSeriesData[0].data.length
  );

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <ChartComponent key={type} seriesData={sortedSeriesData} timePoints={timePoints} colorMap={colorMap} onChartReady={onChartReady} />
  );
});
