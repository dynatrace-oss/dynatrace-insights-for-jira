import type { TimeframeValue } from '../utils/timeframe';

export type ChartType = 'line' | 'bar'

export interface QueryConfig {
  query: string
  chartType: ChartType
  timeframe?: TimeframeValue
}

export type BlockingOperator =
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'equals'
  | 'notEquals'

export interface BlockingRule {
  enabled: boolean
  query: string
  timeframe?: TimeframeValue
  operator: BlockingOperator
  threshold: number
}

export interface IssueConfig extends Record<string, unknown> {
  selectedTenantId?: string
  tenantUrl?: string
  queries: QueryConfig[]
  blockingRule?: BlockingRule
}
