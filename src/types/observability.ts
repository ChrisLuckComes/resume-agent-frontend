export interface ObservabilitySummary {
  total_calls: number
  success_rate: number
  fallback_rate: number
  avg_latency_ms: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  total_estimated_cost: number
}

export interface ObservabilityLogItem {
  id: number
  request_id: string
  source: string
  feature: string
  stage: string
  model_name: string
  prompt_name: string
  prompt_version_id?: number | null
  input_summary: string
  output_summary: string
  input_tokens?: number | null
  output_tokens?: number | null
  total_tokens?: number | null
  latency_ms: number
  estimated_cost?: number | null
  success: boolean
  fallback_used: boolean
  error_message?: string | null
  created_at: string
}

export interface ObservabilityLogsResponse {
  items: ObservabilityLogItem[]
  total: number
  page: number
  page_size: number
}

export interface ObservabilityTrendPoint {
  bucket: string
  latency_ms_avg: number
  total_tokens: number
  total_estimated_cost: number
  total_calls: number
}

export interface ObservabilityTrendsResponse {
  points: ObservabilityTrendPoint[]
}

export interface ObservabilityFilters {
  source?: string
  feature?: string
  stage?: string
  model_name?: string
  prompt_name?: string
  start_at?: string
  end_at?: string
  page?: number
  page_size?: number
}
