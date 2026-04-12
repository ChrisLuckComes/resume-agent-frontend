import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  fetchObservabilityLogs,
  fetchObservabilitySummary,
  fetchObservabilityTrends,
} from '../api/observability'
import type {
  ObservabilityFilters,
  ObservabilityLogItem,
  ObservabilitySummary,
  ObservabilityTrendPoint,
} from '../types/observability'

const DEFAULT_FILTERS: ObservabilityFilters = {
  page: 1,
  page_size: 20,
}

export const useObservabilityStore = defineStore('observability', () => {
  const filters = ref<ObservabilityFilters>({ ...DEFAULT_FILTERS })
  const summary = ref<ObservabilitySummary | null>(null)
  const logs = ref<ObservabilityLogItem[]>([])
  const trends = ref<ObservabilityTrendPoint[]>([])
  const total = ref(0)
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const errorMessage = ref('')

  const page = computed(() => filters.value.page ?? 1)
  const pageSize = computed(() => filters.value.page_size ?? 20)

  async function load() {
    status.value = 'loading'
    errorMessage.value = ''
    try {
      const [summaryResponse, logsResponse, trendsResponse] = await Promise.all([
        fetchObservabilitySummary(filters.value),
        fetchObservabilityLogs(filters.value),
        fetchObservabilityTrends(filters.value),
      ])
      summary.value = summaryResponse
      logs.value = logsResponse.items
      total.value = logsResponse.total
      trends.value = trendsResponse.points
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load observability data.'
    }
  }

  function updateFilters(next: Partial<ObservabilityFilters>) {
    filters.value = {
      ...filters.value,
      ...next,
    }
  }

  return {
    filters,
    summary,
    logs,
    trends,
    total,
    page,
    pageSize,
    status,
    errorMessage,
    load,
    updateFilters,
  }
})
