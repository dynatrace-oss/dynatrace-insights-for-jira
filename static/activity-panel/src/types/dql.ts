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
