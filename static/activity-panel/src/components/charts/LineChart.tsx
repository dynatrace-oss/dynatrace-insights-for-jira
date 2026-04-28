import { memo } from 'react';
import ReactECharts from 'echarts-for-react/lib/core';
import type { ECharts, EChartsOption } from 'echarts';
import { echarts } from '../../utils/echarts-setup.ts';
import {
  getBaseTimeseriesOptions,
  getLineSeriesOptions,
  lineChartTooltipOptions
} from '../../utils/chart-options.ts';
import { createTooltipFormatter } from '../../utils/tooltip-formatter.ts';
import { useForceRenderOnThemeChange } from '../../hooks/useTheme.ts';
import type { SeriesData } from '../../types/dql.ts';

interface LineChartProps {
  seriesData: SeriesData[]
  timePoints: string[]
  colorMap?: Map<string, string>
  onChartReady?: (instance: ECharts) => void
}

export const LineChart = memo(({ seriesData, timePoints, colorMap, onChartReady }: LineChartProps) => {
  useForceRenderOnThemeChange();

  const baseOptions = getBaseTimeseriesOptions({
    seriesNames: seriesData.map(s => s.name),
    timePoints,
    boundaryGap: false
  });

  const option: EChartsOption = {
    ...baseOptions,
    tooltip: {
      ...baseOptions.tooltip,
      ...lineChartTooltipOptions,
      trigger: 'axis',
      formatter: createTooltipFormatter
    },
    series: getLineSeriesOptions(seriesData, colorMap)
  };

  return (
    <div className="w-full h-[300px]">
      <ReactECharts
        echarts={echarts}
        option={option}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
        className="w-full h-full"
        onChartReady={onChartReady}
      />
    </div>
  );
});
