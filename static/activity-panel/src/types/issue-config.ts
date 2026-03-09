import type { TimeframeValue } from '../utils/timeframe';

export type ChartType = 'line' | 'bar'

export interface QueryConfig {
  query: string
  chartType: ChartType
  timeframe?: TimeframeValue
}

export interface IssueConfig extends Record<string, unknown> {
  selectedTenantId?: string
  tenantUrl?: string
  queries: QueryConfig[]
}
