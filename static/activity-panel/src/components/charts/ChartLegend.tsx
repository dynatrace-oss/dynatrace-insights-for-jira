import type { SeriesData } from '../../types/dql';

interface ChartLegendProps {
  seriesData: SeriesData[];
  enabledSeries: Set<string>;
  onToggleSeries: (seriesName: string) => void;
  colorMap: Map<string, string>;
}

/**
 * Custom chart legend component that displays series names with toggle functionality.
 * Displays on the right side of the chart.
 */
export function ChartLegend({ seriesData, enabledSeries, onToggleSeries, colorMap }: ChartLegendProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[120px] max-w-[180px] overflow-y-auto max-h-[300px] px-2">
      {seriesData.map((series) => {
        const isEnabled = enabledSeries.has(series.name);
        const color = colorMap.get(series.name) || '#9ca3af';

        return (
          <button
            key={series.name}
            onClick={() => onToggleSeries(series.name)}
            className={`
              flex items-center gap-2 px-2 py-0 rounded text-sm text-left
              transition-all duration-150 ease-in-out
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${isEnabled ? 'opacity-100' : 'opacity-50'}
            `}
            title={series.name}
          >
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                backgroundColor: isEnabled ? color : '#9ca3af',
                border: `1px solid ${isEnabled ? color : '#000000'}`
              }}
            />
            <span className="truncate text-gray-800 dark:text-gray-200">
              {series.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
