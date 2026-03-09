import { router } from '@forge/bridge';
import { TimeseriesIcon } from '../../assets/icons/TimeseriesIcon';
import { ExternalLinkIcon } from '../../assets/icons/ExternalLinkIcon';

const MAKE_TIMESERIES_DOCS = 'https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language/commands/aggregation-commands#makeTimeseries';

export function NoTimeseriesData() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
      <TimeseriesIcon className="text-gray-400 dark:text-gray-500" />

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No timeseries data found in the result
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Single value or table data is not supported yet.
        </p>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs space-y-1">
        <p>
          Use an aggregation like{' '}
          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-gray-800 dark:text-gray-200">
            makeTimeseries
          </code>{' '}
          to transform your data into a timeseries format.
        </p>
        <button
          onClick={() => router.open(MAKE_TIMESERIES_DOCS)}
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Check out the Dynatrace documentation for examples
          <ExternalLinkIcon />
        </button>
      </div>
    </div>
  );
}
