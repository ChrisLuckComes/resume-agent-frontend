<template>
  <GlassPanel :title="t('assessment.panel.title')" :eyebrow="t('assessment.panel.eyebrow')" panel-class="assessment-panel">
    <div class="report-shell">
      <template v-if="selectedResume && (hasAssessment || evaluationStatus === 'loading')">
        <div class="report-top-grid">
          <div class="score-panel">
            <p class="section-hint">{{ t('assessment.score.label') }}</p>
            <LoadingInline v-if="evaluationStatus === 'loading'" :label="t('assessment.loading.withName', { name: selectedResume.name })" />
            <p v-if="evaluationStatus === 'loading' && evaluationPhaseLabel" class="assessment-phase-label">{{ evaluationPhaseLabel }}</p>
            <template v-if="hasScoreBlock">
              <div class="score-value" :class="scoreClass">{{ report.matchScore }}%</div>
              <span class="score-badge" :class="scoreClass">{{ t(badgeLabel) }}</span>
              <p class="score-caption">{{ report.title }}</p>
              <button class="action-button action-button--primary assessment-interview-button" type="button" @click="openInterviewModal()">
                {{ t('interview.button.open') }}
              </button>
            </template>
            <div v-else class="assessment-skeleton-score">
              <span class="assessment-skeleton assessment-skeleton--score"></span>
              <span class="assessment-skeleton assessment-skeleton--badge"></span>
              <span class="assessment-skeleton assessment-skeleton--caption"></span>
            </div>
          </div>

          <div class="radar-panel">
            <RadarChart v-if="hasRadarMetrics" :metrics="report.radarMetrics" />
            <div v-else class="assessment-skeleton-radar" aria-hidden="true">
              <span class="assessment-skeleton assessment-skeleton--radar-orbit"></span>
              <span class="assessment-skeleton assessment-skeleton--radar-line assessment-skeleton--radar-line-a"></span>
              <span class="assessment-skeleton assessment-skeleton--radar-line assessment-skeleton--radar-line-b"></span>
              <span class="assessment-skeleton assessment-skeleton--radar-core"></span>
            </div>
          </div>
        </div>

        <div class="report-copy-grid">
          <section class="report-copy-card">
            <h3 class="report-copy-title">{{ t('assessment.section.summary') }}</h3>
            <p v-if="hasSummary" class="report-copy-body">{{ report.summary }}</p>
            <div v-else class="assessment-skeleton-stack" aria-hidden="true">
              <span class="assessment-skeleton assessment-skeleton--text-lg"></span>
              <span class="assessment-skeleton assessment-skeleton--text-md"></span>
              <span class="assessment-skeleton assessment-skeleton--text-sm"></span>
            </div>
            <SourceList
              v-if="report.summarySourceIds.length > 0 && report.sources.length > 0"
              :title="t('assessment.sources.title')"
              :sources="report.sources"
              :source-ids="report.summarySourceIds"
            />
          </section>

          <section class="report-copy-card">
            <h3 class="report-copy-title report-copy-title--positive">{{ t('assessment.section.highlights') }}</h3>
            <ul v-if="hasHighlights" class="signal-list">
              <li v-for="item in report.highlights" :key="item.text" class="signal-list__item signal-list__item--positive">
                <p class="signal-list__copy">{{ item.text }}</p>
                <SourceList :sources="report.sources" :source-ids="item.sourceIds" />
              </li>
            </ul>
            <ul v-else class="signal-list signal-list--skeleton" aria-hidden="true">
              <li v-for="index in skeletonItems" :key="`highlight-${index}`" class="signal-list__item signal-list__item--positive">
                <span class="assessment-skeleton assessment-skeleton--text-lg"></span>
                <span class="assessment-skeleton assessment-skeleton--text-sm"></span>
              </li>
            </ul>
          </section>

          <section class="report-copy-card">
            <h3 class="report-copy-title report-copy-title--danger">{{ t('assessment.section.risks') }}</h3>
            <ul v-if="hasRisks" class="signal-list">
              <li v-for="item in report.risks" :key="item.text" class="signal-list__item signal-list__item--danger">
                <p class="signal-list__copy">{{ item.text }}</p>
                <SourceList :sources="report.sources" :source-ids="item.sourceIds" />
              </li>
            </ul>
            <ul v-else class="signal-list signal-list--skeleton" aria-hidden="true">
              <li v-for="index in skeletonItems" :key="`risk-${index}`" class="signal-list__item signal-list__item--danger">
                <span class="assessment-skeleton assessment-skeleton--text-md"></span>
                <span class="assessment-skeleton assessment-skeleton--text-xs"></span>
              </li>
            </ul>
          </section>
        </div>
      </template>

      <AssessmentProcessCard v-else-if="processingPhase" :phase="processingPhase" :candidate-name="selectedResume?.name" />

      <AssessmentPreviewCard v-else :phase="previewPhase" />
    </div>
  </GlassPanel>
  <InterviewModal />
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
import SourceList from './SourceList.vue'
import InterviewModal from './InterviewModal.vue'

const t = useI18n()
const { selectedResume, report, hasAssessment, workbenchPhase, evaluationStatus, evaluationPhase, openInterviewModal } = useWorkbench()
const skeletonItems = [1, 2, 3]
const scoreSource = computed(() => report.value.matchScore)
const { scoreClass, badgeLabel } = useAssessmentTone(scoreSource)
const hasScoreBlock = computed(() => report.value.matchScore > 0 || Boolean(report.value.title))
const hasRadarMetrics = computed(() => report.value.radarMetrics.length > 0)
const hasSummary = computed(() => report.value.summary.trim().length > 0)
const hasHighlights = computed(() => report.value.highlights.length > 0)
const hasRisks = computed(() => report.value.risks.length > 0)
const evaluationPhaseLabel = computed(() => {
  if (evaluationStatus.value !== 'loading') {
    return ''
  }

  return t(`assessment.phase.${evaluationPhase.value}`)
})
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
