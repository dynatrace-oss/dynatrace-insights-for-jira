import { useMemo, memo } from 'react';
import { extractSeriesFromRecords, generateTimePoints } from '../../utils/dql-data.ts';
import { useLegendState } from '../../hooks/useLegendState.ts';
import type { DqlResult } from '../../types/dql.ts';
import { LineChart } from './LineChart.tsx';
import { BarChart } from './BarChart.tsx';
import { NoTimeseriesData } from './NoTimeseriesData.tsx';
import { ChartLegend } from './ChartLegend.tsx';

type ChartType = 'line' | 'bar'

interface ChartContainerProps {
  data: DqlResult
  type?: ChartType
}

/**
 * Container component that handles data validation, extraction, and renders the appropriate chart.
 */
export const ChartContainer = memo(({ data, type = 'line' }: ChartContainerProps) => {
  const records = data?.result?.records;

  const seriesData = useMemo(
    () => records?.length ? extractSeriesFromRecords(records) : [],
    [records]
  );

  const { sortedSeriesData, filteredSeriesData, colorMap, disabledSeries, toggleSeries } = useLegendState(seriesData);

  // Validate data exists
  if (!records?.length) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
        No data available for chart
      </div>
    );
  }

  // Validate series data exists
  if (sortedSeriesData.length === 0) {
    return <NoTimeseriesData />;
  }

  // Extract time points from first record (all records share same timeframe)
  const record = records[0];
  const dataPointCount = sortedSeriesData[0].data.length;
  const timePoints = generateTimePoints(
    record.timeframe.start,
    record.interval,
    dataPointCount
  );

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <ChartComponent seriesData={filteredSeriesData} timePoints={timePoints} colorMap={colorMap} />
      </div>
      {sortedSeriesData.length > 1 && (
        <ChartLegend
          seriesData={sortedSeriesData}
          disabledSeries={disabledSeries}
          onToggleSeries={toggleSeries}
          colorMap={colorMap}
        />
      )}
    </div>
  );
});
