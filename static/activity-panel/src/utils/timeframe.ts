type FixedIntervals =
  | '30m'
  | '1h'
  | '2h'
  | '6h'
  | '12h'
  | '24h'
  | '3d'
  | '7d'
  | '14d';

type DynamicPeriods =
  | 'today'
  | 'yesterday';

export type PredefinedTimeframe = FixedIntervals | DynamicPeriods;

function isDynamicPeriod(value: string): value is DynamicPeriods {
  const dynamicPeriods: DynamicPeriods[] = ['today', 'yesterday'];
  return dynamicPeriods.includes(value as DynamicPeriods);
}

const predefinedTimeframeToMilliseconds: { [key in FixedIntervals]: number } = {
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000
};

export const TIMEFRAME_OPTIONS: { value: PredefinedTimeframe | 'custom'; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: '30m', label: 'Last 30m' },
  { value: '1h', label: 'Last 1h' },
  { value: '2h', label: 'Last 2h' },
  { value: '6h', label: 'Last 6h' },
  { value: '12h', label: 'Last 12h' },
  { value: '24h', label: 'Last 24h' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' }
];

export interface CustomTimeframe {
  from: number;
  to: number;
}

export type TimeframeValue = PredefinedTimeframe | CustomTimeframe;

export const isCustomTimeframe = (value: unknown): value is CustomTimeframe => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'from' in value &&
    'to' in value &&
    typeof (value as CustomTimeframe).from === 'number' &&
    typeof (value as CustomTimeframe).to === 'number'
  );
};

export const isPredefinedTimeframe = (value: unknown): value is PredefinedTimeframe => {
  const predefined: PredefinedTimeframe[] = [
    '30m', '1h', '2h', '6h', '12h', '24h', '3d', '7d', '14d', 'today', 'yesterday'
  ];
  return typeof value === 'string' && predefined.includes(value as PredefinedTimeframe);
};

export interface ResolvedTimeframe {
  from: Date;
  to: Date;
}

export const resolveTimeframe = (value: TimeframeValue): ResolvedTimeframe => {
  if (isCustomTimeframe(value)) {
    return {
      from: new Date(value.from),
      to: new Date(value.to)
    };
  }

  const now = new Date();

  if (isDynamicPeriod(value)) {
    if (value === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return { from: startOfDay, to: now };
    }
    if (value === 'yesterday') {
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return { from: startOfYesterday, to: endOfYesterday };
    }
  }

  const milliseconds = predefinedTimeframeToMilliseconds[value as FixedIntervals];
  return {
    from: new Date(now.getTime() - milliseconds),
    to: now
  };
};

export const formatTimeframeLabel = (value: TimeframeValue): string => {
  if (isCustomTimeframe(value)) {
    const from = new Date(value.from);
    const to = new Date(value.to);
    return `${from.toLocaleDateString()} ${from.toLocaleTimeString()} - ${to.toLocaleDateString()} ${to.toLocaleTimeString()}`;
  }
  const option = TIMEFRAME_OPTIONS.find(opt => opt.value === value);
  return option?.label ?? value;
};
