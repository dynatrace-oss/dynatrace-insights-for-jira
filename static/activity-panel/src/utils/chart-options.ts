import type { EChartsOption } from 'echarts';
import type { SeriesData } from '../types/dql';
import { formatAxisValue } from './dql-data';

// ECharts default color palette
export const ECHARTS_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
  '#2E4057', '#FFBE7D', '#FF7C43', '#A0CBE8', '#8CD17D',
  '#B6992D', '#499894', '#D37295', '#FABFD2', '#B5C1CF'
];

interface BaseChartOptions {
  seriesNames: string[];
  timePoints: string[];
  boundaryGap?: boolean;
}

function isDarkMode(): boolean {
  const colorMode = document.documentElement.getAttribute('data-color-mode');
  if (colorMode === 'dark') {
    return true;
  }

  return document.documentElement.classList.contains('dark') ||
         document.body.classList.contains('dark');
}

export function getThemeColors() {
  const dark = isDarkMode();
  return {
    textColor: dark ? '#e5e7eb' : '#374151',
    axisLineColor: dark ? '#4b5563' : '#d1d5db',
    splitLineColor: dark ? '#374151' : '#f3f4f6',
    backgroundColor: dark ? '#1f2937' : '#ffffff'
  };
}

/**
 * Calculates an ECharts category-axis `interval` value so that no more than
 * `maxLabels` tick labels are rendered on the X axis.
 * An interval of 0 means "show every label".
 */
function computeLabelInterval(totalPoints: number, maxLabels = 20): number {
  if (totalPoints <= maxLabels) {
    return 0;
  }
  return Math.ceil(totalPoints / maxLabels) - 1;
}

export function getBaseTimeseriesOptions({
  seriesNames,
  timePoints,
  boundaryGap = true
}: BaseChartOptions): EChartsOption {
  const colors = getThemeColors();
  const labelInterval = computeLabelInterval(timePoints.length);

  return {
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.axisLineColor,
      borderWidth: 1,
      padding: 10,
      textStyle: {
        color: colors.textColor,
        fontSize: 12
      }
    },
    legend: {
      data: seriesNames,
      show: seriesNames.length > 1,
      type: 'scroll',
      orient: 'vertical',
      right: 5,
      top: 10,
      width: 150,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: colors.textColor,
        fontSize: 12,
        overflow: 'truncate',
        width: 120,
      },
      pageIconColor: colors.textColor,
      pageTextStyle: {
        color: colors.textColor,
      },
    },
    grid: {
      left: '3%',
      right: seriesNames.length > 1 ? '165px' : '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap,
      data: timePoints,
      axisLabel: {
        interval: labelInterval,
        rotate: 45,
        fontSize: 10,
        color: colors.textColor,
        formatter: (value: string) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) { return value; }
          const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          const dayMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `${dayMonth} - ${time}`;
        }
      },
      axisLine: {
        lineStyle: {
          color: colors.axisLineColor
        }
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: formatAxisValue,
        color: colors.textColor
      },
      axisLine: {
        lineStyle: {
          color: colors.axisLineColor
        }
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor
        }
      }
    }
  };
}

export function getLineSeriesOptions(
  seriesData: SeriesData[],
  colorMap?: Map<string, string>
): EChartsOption['series'] {
  return seriesData.map(s => ({
    name: s.name,
    type: 'line' as const,
    smooth: true,
    data: s.data,
    connectNulls: false,
    symbol: 'none',
    itemStyle: colorMap?.get(s.name) ? { color: colorMap.get(s.name) } : undefined,
    lineStyle: colorMap?.get(s.name) ? { color: colorMap.get(s.name) } : undefined,
  }));
}

export function getBarSeriesOptions(
  seriesData: SeriesData[],
  colorMap?: Map<string, string>
): EChartsOption['series'] {
  return seriesData.map(s => ({
    name: s.name,
    type: 'bar' as const,
    stack: 'total',
    data: s.data,
    itemStyle: colorMap?.get(s.name) ? { color: colorMap.get(s.name) } : undefined,
    emphasis: {
      focus: 'series'
    }
  }));
}

export const lineChartTooltipOptions = {
  axisPointer: {
    type: 'line' as const
  }
};

export const barChartTooltipOptions = {
  axisPointer: {
    type: 'shadow' as const
  }
};
