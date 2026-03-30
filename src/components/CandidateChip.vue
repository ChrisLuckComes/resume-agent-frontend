<template>
  <button class="candidate-chip" :class="chipClasses" :disabled="candidate.status === 'pending'" @click="$emit('select', candidate.id)">
    <span class="candidate-chip__label">{{ candidate.name }}</span>
    <span class="candidate-chip__status">{{ t(statusLabel) }}</span>
    <span class="candidate-chip__close" @click.stop="$emit('remove', candidate.id)">x</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '../composables/useI18n'
import type { ResumeCandidate } from '../types/resume-agent'

const props = defineProps({
  candidate: {
    type: Object as () => ResumeCandidate,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

defineEmits<{
  select: [resumeId: number]
  remove: [resumeId: number]
}>()

const chipClasses = computed(() => ({
  'candidate-chip--selected': props.selected,
  'candidate-chip--error': props.candidate.status === 'error',
}))

const t = useI18n()

const statusLabel = computed(() => {
  if (props.candidate.status === 'pending') {
    return 'resume.status.uploading'
  }

  if (props.candidate.status === 'error') {
    return 'resume.status.error'
  }

  return 'resume.status.ready'
})
</script>
