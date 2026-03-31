export type KnownNotificationType = 'SCAN_LIMIT_GBYTES' | 'BYTE_LIMIT_ADDED'

export interface DqlNotification {
  notificationType: string
  severity: string
  message: string
}

export interface TimeseriesRecord {
  timeframe: {
    start: string
    end: string
  }
  interval: string
  [key: string]: unknown
}

export interface DqlResult {
  state: string
  progress: number
  result?: {
    records: TimeseriesRecord[]
    types: unknown[]
    metadata: {
      grail: {
        canonicalQuery: string
        analysisTimeframe: {
          start: string
          end: string
        }
        notifications?: DqlNotification[]
        [key: string]: unknown
      }
    }
  }
  // Error fields from backend
  code?: number
  error?: string
  errorMessage?: string
  exceptionType?: string
}

export interface SeriesData {
  name: string
  data: (number | null)[]
}
