<template>
  <div class="app-shell page-shell">
    <div class="app-shell__backdrop"></div>
    <TopBar />
    <main class="page-stack">
      <GlassPanel :title="t('observability.panel.title')" :eyebrow="t('observability.panel.eyebrow')">
        <div class="stack-16">
          <div class="filter-grid">
            <label class="stack-8">
              <span class="field-label">Source</span>
              <select class="input-shell input-shell--control" :value="filters.source ?? ''" @change="setFilter('source', ($event.target as HTMLSelectElement).value)">
                <option value="">All</option>
                <option value="production">production</option>
                <option value="playground">playground</option>
              </select>
            </label>
            <label class="stack-8">
              <span class="field-label">Feature</span>
              <input class="input-shell input-shell--control" :value="filters.feature ?? ''" @input="setFilter('feature', ($event.target as HTMLInputElement).value)" />
            </label>
            <label class="stack-8">
              <span class="field-label">Prompt</span>
              <input class="input-shell input-shell--control" :value="filters.prompt_name ?? ''" @input="setFilter('prompt_name', ($event.target as HTMLInputElement).value)" />
            </label>
            <button class="action-button action-button--primary page-action" type="button" @click="load()">
              {{ status === 'loading' ? t('observability.button.loading') : t('observability.button.refresh') }}
            </button>
          </div>

          <p v-if="errorMessage" class="inline-alert inline-alert--error">{{ errorMessage }}</p>

          <div v-if="summary" class="metrics-grid">
            <article v-for="item in summaryCards" :key="item.label" class="metric-card">
              <p class="section-hint">{{ item.label }}</p>
              <p class="metric-card__value">{{ item.value }}</p>
            </article>
          </div>

          <div class="report-copy-grid">
            <section class="report-copy-card">
              <h3 class="report-copy-title">Latency Trend</h3>
              <TrendLineChart :points="latencyPoints" series-name="Latency" color="#7fffdc" />
            </section>

            <section class="report-copy-card">
              <h3 class="report-copy-title">Token Trend</h3>
              <TrendLineChart :points="tokenPoints" series-name="Tokens" color="#63a7ff" />
            </section>

            <section class="report-copy-card">
              <h3 class="report-copy-title">Cost Trend</h3>
              <TrendLineChart :points="costPoints" series-name="Cost" color="#ffd166" mode="currency" />
            </section>

            <section class="report-copy-card">
              <h3 class="report-copy-title">Request Logs</h3>
              <div class="log-table">
                <div class="log-table__head">
                  <span>Stage</span>
                  <span>Model</span>
                  <span>Latency</span>
                  <span>Tokens</span>
                  <span>Status</span>
                </div>
                <div v-for="log in logs" :key="log.id" class="log-table__row">
                  <span>{{ log.stage }}</span>
                  <span>{{ log.model_name }}</span>
                  <span>{{ log.latency_ms }} ms</span>
                  <span>{{ log.total_tokens ?? '-' }}</span>
                  <span>{{ log.success ? 'success' : 'error' }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </GlassPanel>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import GlassPanel from '../components/GlassPanel.vue'
import TopBar from '../components/TopBar.vue'
import TrendLineChart from '../components/TrendLineChart.vue'
import { useI18n } from '../composables/useI18n'
import { useObservabilityStore } from '../stores/observability'

const t = useI18n()
const store = useObservabilityStore()
const { filters, summary, logs, trends, status, errorMessage } = storeToRefs(store)

const summaryCards = computed(() => {
  const currentSummary = summary.value
  if (!currentSummary) {
    return []
  }
  return [
    { label: 'Total Calls', value: currentSummary.total_calls },
    { label: 'Success Rate', value: `${(currentSummary.success_rate * 100).toFixed(1)}%` },
    { label: 'Avg Latency', value: `${currentSummary.avg_latency_ms.toFixed(1)} ms` },
    { label: 'Total Tokens', value: currentSummary.total_tokens },
    { label: 'Estimated Cost', value: currentSummary.total_estimated_cost.toFixed(6) },
  ]
})

const latencyPoints = computed(() =>
  trends.value.map((point) => ({
    label: point.bucket,
    value: point.latency_ms_avg,
  })),
)

const tokenPoints = computed(() =>
  trends.value.map((point) => ({
    label: point.bucket,
    value: point.total_tokens,
  })),
)

const costPoints = computed(() =>
  trends.value.map((point) => ({
    label: point.bucket,
    value: point.total_estimated_cost,
  })),
)

function setFilter(key: 'source' | 'feature' | 'prompt_name', value: string) {
  store.updateFilters({ [key]: value || undefined })
}

async function load() {
  await store.load()
}

onMounted(() => {
  void load()
})
</script>
