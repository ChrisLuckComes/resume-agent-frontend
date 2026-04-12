import type {
  ObservabilityFilters,
  ObservabilityLogsResponse,
  ObservabilitySummary,
  ObservabilityTrendsResponse,
} from '../types/observability'
import { parseJsonResponse } from './request'

function buildQueryString(filters: ObservabilityFilters): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function fetchObservabilitySummary(filters: ObservabilityFilters): Promise<ObservabilitySummary> {
  const response = await fetch(`/api/observability/summary${buildQueryString(filters)}`)
  return parseJsonResponse<ObservabilitySummary>(response)
}

export async function fetchObservabilityLogs(filters: ObservabilityFilters): Promise<ObservabilityLogsResponse> {
  const response = await fetch(`/api/observability/logs${buildQueryString(filters)}`)
  return parseJsonResponse<ObservabilityLogsResponse>(response)
}

export async function fetchObservabilityTrends(filters: ObservabilityFilters): Promise<ObservabilityTrendsResponse> {
  const response = await fetch(`/api/observability/trends${buildQueryString(filters)}`)
  return parseJsonResponse<ObservabilityTrendsResponse>(response)
}
