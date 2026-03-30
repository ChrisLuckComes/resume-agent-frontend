<template>
  <GlassPanel :title="t('assessment.panel.title')" :eyebrow="t('assessment.panel.eyebrow')" panel-class="assessment-panel">
    <div class="report-shell">
      <template v-if="selectedResume && hasAssessment">
        <div class="report-top-grid">
          <div class="score-panel">
            <p class="section-hint">{{ t('assessment.score.label') }}</p>
            <LoadingInline v-if="evaluationStatus === 'loading'" :label="t('assessment.loading.withName', { name: selectedResume.name })" />
            <div class="score-value" :class="scoreClass">{{ report.matchScore }}%</div>
            <span class="score-badge" :class="scoreClass">{{ t(badgeLabel) }}</span>
            <p class="score-caption">{{ report.title }}</p>
          </div>

          <div class="radar-panel">
            <RadarChart :metrics="report.radarMetrics" />
          </div>
        </div>

        <div class="report-copy-grid">
          <section class="report-copy-card">
            <h3 class="report-copy-title">{{ t('assessment.section.summary') }}</h3>
            <p class="report-copy-body">{{ report.summary }}</p>
          </section>

          <section class="report-copy-card">
            <h3 class="report-copy-title report-copy-title--positive">{{ t('assessment.section.highlights') }}</h3>
            <ul class="signal-list">
              <li v-for="item in report.highlights" :key="item" class="signal-list__item signal-list__item--positive">
                {{ item }}
              </li>
            </ul>
          </section>

          <section class="report-copy-card">
            <h3 class="report-copy-title report-copy-title--danger">{{ t('assessment.section.risks') }}</h3>
            <ul class="signal-list">
              <li v-for="item in report.risks" :key="item" class="signal-list__item signal-list__item--danger">
                {{ item }}
              </li>
            </ul>
          </section>
        </div>
      </template>

      <AssessmentProcessCard v-else-if="processingPhase" :phase="processingPhase" :candidate-name="selectedResume?.name" />

      <AssessmentPreviewCard v-else :phase="previewPhase" />
    </div>
  </GlassPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useAssessmentTone } from '../composables/useAssessmentTone'
import { useI18n } from '../composables/useI18n'
import { useWorkbench } from '../composables/useWorkbench'
import type { WorkbenchPhase } from '../types/resume-agent'
import AssessmentPreviewCard from './AssessmentPreviewCard.vue'
import AssessmentProcessCard from './AssessmentProcessCard.vue'
import GlassPanel from './GlassPanel.vue'
import LoadingInline from './LoadingInline.vue'
import RadarChart from './RadarChart.vue'

const t = useI18n()
const { selectedResume, report, hasAssessment, workbenchPhase, evaluationStatus } = useWorkbench()
const scoreSource = computed(() => report.value.matchScore)
const { scoreClass, badgeLabel } = useAssessmentTone(scoreSource)
const processingPhase = computed<Extract<WorkbenchPhase, 'analyzingJD' | 'evaluatingResume'> | null>(() => {
  if (workbenchPhase.value === 'analyzingJD') {
    return 'analyzingJD'
  }

  if (evaluationStatus.value === 'loading' && selectedResume.value !== null) {
    return 'evaluatingResume'
  }

  return null
})
const previewPhase = computed<WorkbenchPhase>(() =>
  workbenchPhase.value === 'waitingResume' ? 'waitingResume' : 'ready',
)
</script>
