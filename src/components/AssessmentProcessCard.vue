<template>
  <div class="process-card">
    <div class="process-card__visual">
      <div class="process-card__core">
        <div class="process-card__ring process-card__ring--outer"></div>
        <div class="process-card__ring process-card__ring--inner"></div>
        <div class="process-card__center"></div>
      </div>
      <div class="process-card__scanline"></div>
    </div>

    <div class="process-card__content">
      <div class="process-card__header">
        <p class="section-hint">{{ t('assessment.process.liveBadge') }}</p>
        <span class="process-card__phase">{{ t(`assessment.state.${phase}`) }}</span>
      </div>

      <h3 class="process-card__title">{{ t(`${baseKey}.title`, processParams) }}</h3>
      <p class="process-card__body">{{ t(`${baseKey}.body`, processParams) }}</p>

      <div class="process-steps">
        <div
          v-for="(step, index) in stepItems"
          :key="step"
          class="process-step"
          :class="{ 'process-step--active': index === activeStepIndex }"
        >
          <span class="process-step__index">0{{ index + 1 }}</span>
          <span class="process-step__text">{{ step }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useI18n } from '../composables/useI18n'
import type { WorkbenchPhase } from '../types/resume-agent'

const props = defineProps<{ phase: Extract<WorkbenchPhase, 'analyzingJD' | 'evaluatingResume'>, candidateName?: string }>()

const t = useI18n()
const activeStepIndex = ref(0)

const processParams = computed(() => ({
  name: props.candidateName ?? '',
}))

const baseKey = computed(() => `assessment.process.${props.phase}`)
const stepItems = computed(() => [
  t(`${baseKey.value}.steps.0`),
  t(`${baseKey.value}.steps.1`),
  t(`${baseKey.value}.steps.2`),
  t(`${baseKey.value}.steps.3`),
])

let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    activeStepIndex.value = (activeStepIndex.value + 1) % stepItems.value.length
  }, 850)
})

onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearInterval(timer)
  }
})
</script>
