<template>
  <article class="interview-question-card">
    <div class="interview-question-card__header">
      <span class="interview-question-card__index">{{ indexLabel }}</span>
      <span class="interview-question-card__category">{{ t(categoryLabel) }}</span>
    </div>

    <p class="interview-question-card__question">{{ question.question }}</p>
    <p v-if="question.intent" class="interview-question-card__intent">{{ question.intent }}</p>

    <div class="interview-answer-shell">
      <textarea
        :value="answer"
        class="interview-answer-textarea"
        :placeholder="t('interview.placeholder.answer')"
        @input="$emit('answer-change', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <button
        class="interview-voice-button"
        type="button"
        :disabled="voiceStatus === 'unsupported'"
        @click="$emit('voice-toggle')"
      >
        {{ t(buttonLabel) }}
      </button>
    </div>

    <p v-if="voiceStatusLabel" class="interview-question-card__voice-status">{{ t(voiceStatusLabel) }}</p>

    <div v-if="result" class="interview-question-card__result">
      <div class="interview-question-card__score">{{ result.score }}分</div>
      <p class="interview-question-card__feedback">{{ result.feedback }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '../composables/useI18n'
import type {
  InterviewQuestion,
  InterviewQuestionResult,
  SpeechRecognitionStatus,
} from '../types/resume-agent'

const props = defineProps<{
  index: number
  question: InterviewQuestion
  answer: string
  voiceStatus: SpeechRecognitionStatus
  result?: InterviewQuestionResult
}>()

defineEmits<{
  'answer-change': [value: string]
  'voice-toggle': []
}>()

const t = useI18n()

const indexLabel = computed(() => `Q${props.index + 1}`)

const categoryLabel = computed(() => `interview.category.${props.question.category}`)

const buttonLabel = computed(() =>
  props.voiceStatus === 'listening' || props.voiceStatus === 'recognizing'
    ? 'interview.button.stopVoice'
    : 'interview.button.startVoice',
)

const voiceStatusLabel = computed(() => {
  if (props.voiceStatus === 'idle') {
    return ''
  }
  return `interview.voiceStatus.${props.voiceStatus}`
})
</script>
