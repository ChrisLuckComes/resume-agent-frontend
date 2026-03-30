<template>
  <div class="preview-card">
    <div class="preview-card__header">
      <div>
        <p class="section-hint">{{ t('assessment.preview.kicker') }}</p>
        <h3 class="preview-card__title">{{ t('assessment.preview.title') }}</h3>
      </div>
      <span class="preview-card__badge">{{ t('assessment.preview.demoBadge') }}</span>
    </div>

    <p class="preview-card__notice">{{ t(noticeKey) }}</p>

    <div class="report-top-grid report-top-grid--preview">
      <div class="score-panel score-panel--preview">
        <p class="section-hint">{{ t('assessment.score.label') }}</p>
        <div class="score-value score-positive">92%</div>
        <span class="score-badge score-positive">{{ t('assessment.score.highMatch') }}</span>
        <p class="score-caption">{{ t('assessment.preview.roleTitle') }}</p>
      </div>

      <div class="radar-panel radar-panel--preview">
        <RadarChart :metrics="demoMetrics" />
      </div>
    </div>

    <div class="preview-copy-grid">
      <section class="report-copy-card">
        <h3 class="report-copy-title">{{ t('assessment.section.summary') }}</h3>
        <p class="report-copy-body">{{ t('assessment.preview.summary') }}</p>
      </section>

      <section class="report-copy-card">
        <h3 class="report-copy-title report-copy-title--positive">{{ t('assessment.section.highlights') }}</h3>
        <ul class="signal-list">
          <li v-for="item in highlightItems" :key="item" class="signal-list__item signal-list__item--positive">
            {{ item }}
          </li>
        </ul>
      </section>

      <section class="report-copy-card">
        <h3 class="report-copy-title report-copy-title--danger">{{ t('assessment.section.risks') }}</h3>
        <ul class="signal-list">
          <li v-for="item in riskItems" :key="item" class="signal-list__item signal-list__item--danger">
            {{ item }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '../composables/useI18n'
import type { RadarMetric, WorkbenchPhase } from '../types/resume-agent'
import RadarChart from './RadarChart.vue'

const props = defineProps<{ phase: WorkbenchPhase }>()

const t = useI18n()

const demoMetrics = computed<RadarMetric[]>(() => [
  { name: t('assessment.preview.radar.reactTs'), max: 100, value: 91 },
  { name: t('assessment.preview.radar.architecture'), max: 100, value: 84 },
  { name: t('assessment.preview.radar.collaboration'), max: 100, value: 88 },
  { name: t('assessment.preview.radar.delivery'), max: 100, value: 86 },
  { name: t('assessment.preview.radar.problemSolving'), max: 100, value: 82 },
])

const highlightItems = computed(() => [
  t('assessment.preview.highlights.0'),
  t('assessment.preview.highlights.1'),
  t('assessment.preview.highlights.2'),
])

const riskItems = computed(() => [
  t('assessment.preview.risks.0'),
  t('assessment.preview.risks.1'),
])

const noticeKey = computed(() =>
  props.phase === 'waitingResume'
    ? 'assessment.preview.noticeWaitingResume'
    : 'assessment.preview.noticeReady',
)
</script>
