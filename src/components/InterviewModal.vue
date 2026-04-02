<template>
  <div v-if="open" class="interview-modal-overlay" @click.self="closeInterviewModal()">
    <section class="interview-modal">
      <header class="interview-modal__header">
        <div class="interview-modal__identity-header">
          <div class="interview-modal__avatar">{{ avatarLabel }}</div>
          <div>
          <p class="panel-kicker">{{ t('interview.modal.eyebrow') }}</p>
          <h3 class="interview-modal__title">{{ t('interview.modal.title') }}</h3>
          <p class="interview-modal__subtitle">
            {{ t('interview.modal.subtitle', { name: selectedResume?.name ?? t('workbench.candidate.unnamed') }) }}
          </p>
            <p class="interview-modal__subtitle">{{ t('interview.identity.current', { identity: interviewIdentity || interviewIdentityDraft }) }}</p>
          </div>
        </div>
        <button class="interview-modal__close" type="button" @click="closeInterviewModal()">x</button>
      </header>

      <div class="interview-modal__body">
        <div class="interview-modal__intro">
          <p>{{ t('interview.modal.intro') }}</p>
          <p v-if="interviewStatus === 'loading'" class="interview-modal__phase">{{ t(`interview.phase.${interviewPhase}`) }}</p>
        </div>

        <div class="interview-identity-card">
          <label class="field-label" for="interview-identity">{{ t('interview.identity.label') }}</label>
          <div class="interview-identity-row">
            <input
              id="interview-identity"
              :value="interviewIdentityDraft"
              class="follow-up-input"
              :placeholder="t('interview.identity.placeholder')"
              @input="setInterviewIdentityDraft(($event.target as HTMLInputElement).value)"
            />
            <button class="action-button action-button--ghost" type="button" @click="confirmInterviewIdentity()">
              {{ t('interview.identity.confirm') }}
            </button>
          </div>
          <p class="interview-identity-hint">{{ t('interview.identity.hint') }}</p>
        </div>

        <div v-if="interviewErrorMessage" class="inline-alert inline-alert--error">{{ interviewErrorMessage }}</div>

        <div v-if="interviewHistory.length > 0" class="interview-history-card">
          <p class="field-label">{{ t('interview.history.title') }}</p>
          <div class="interview-history-list">
            <article v-for="item in interviewHistory" :key="item.sessionId" class="interview-history-item">
              <strong>{{ item.candidateName }}</strong>
              <span>{{ item.totalScore }} / 100 · {{ item.verdict }}</span>
              <time>{{ formatCreatedAt(item.createdAt) }}</time>
              <button class="action-button action-button--ghost" type="button" @click="loadInterviewHistoryDetail(item.sessionId)">
                {{ t('interview.history.viewDetail') }}
              </button>
            </article>
          </div>
        </div>

        <div v-if="interviewHistoryDetail" class="interview-history-detail">
          <p class="field-label">{{ t('interview.history.detailTitle') }}</p>
          <p class="interview-history-detail__meta">
            {{ interviewHistoryDetail.candidateName }} · {{ formatCreatedAt(interviewHistoryDetail.createdAt) }}
          </p>
          <div v-if="interviewHistoryDetail.result" class="interview-result-banner" :class="`interview-result-banner--${interviewHistoryDetail.result.verdict}`">
            <strong>{{ t(`interview.verdict.${interviewHistoryDetail.result.verdict}`) }}</strong>
            <span>{{ interviewHistoryDetail.result.totalScore }} / 100</span>
            <p>{{ interviewHistoryDetail.result.overallFeedback }}</p>
          </div>
        </div>

        <div class="interview-question-list">
          <InterviewQuestionCard
            v-for="(question, index) in interviewQuestions"
            :key="question.questionId"
            :index="index"
            :question="question"
            :answer="interviewAnswers[question.questionId]?.answer ?? ''"
            :voice-status="voiceStatusByQuestion[question.questionId] ?? 'idle'"
            :result="questionResultMap[question.questionId]"
            @answer-change="setInterviewAnswer(question.questionId, $event)"
            @voice-toggle="toggleVoice(question.questionId)"
          />
        </div>
      </div>

      <footer class="interview-modal__footer">
        <div v-if="interviewResult" class="interview-result-banner" :class="`interview-result-banner--${interviewResult.verdict}`">
          <strong>{{ t(`interview.verdict.${interviewResult.verdict}`) }}</strong>
          <span>{{ interviewResult.totalScore }} / 100</span>
          <p>{{ interviewResult.overallFeedback }}</p>
        </div>
        <button
          class="action-button action-button--primary"
          type="button"
          :disabled="interviewStatus === 'loading' || interviewSubmitStatus === 'loading' || interviewQuestions.length !== 10"
          @click="submitInterview()"
        >
          {{ interviewSubmitStatus === 'loading' ? t('interview.button.submitting') : t('interview.button.submit') }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n } from '../composables/useI18n'
import { useSpeechRecognition } from '../composables/useSpeechRecognition'
import { useWorkbench } from '../composables/useWorkbench'
import type { InterviewQuestionResult } from '../types/resume-agent'
import InterviewQuestionCard from './InterviewQuestionCard.vue'

const t = useI18n()
const {
  selectedResume,
  interviewModalOpen: open,
  interviewStatus,
  interviewSubmitStatus,
  interviewPhase,
  interviewQuestions,
  interviewAnswers,
  interviewResult,
  interviewIdentity,
  interviewIdentityDraft,
  interviewHistory,
  interviewHistoryDetail,
  interviewErrorMessage,
  voiceStatusByQuestion,
  closeInterviewModal,
  loadInterviewHistoryDetail,
  setInterviewIdentityDraft,
  confirmInterviewIdentity,
  setInterviewAnswer,
  appendInterviewAnswer,
  setVoiceStatus,
  submitInterview,
} = useWorkbench()

const { start, stop } = useSpeechRecognition()
const listeningQuestionId = ref<string | null>(null)

function formatCreatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

const questionResultMap = computed<Record<string, InterviewQuestionResult>>(() => {
  const results = interviewResult.value?.questionResults ?? []
  return Object.fromEntries(results.map((item) => [item.questionId, item]))
})

const avatarLabel = computed(() => {
  const base = (interviewIdentity.value || interviewIdentityDraft.value || 'GI').trim()
  return base.slice(0, 2).toUpperCase()
})

function toggleVoice(questionId: string) {
  const currentStatus = voiceStatusByQuestion.value[questionId] ?? 'idle'
  if (currentStatus === 'listening' || currentStatus === 'recognizing') {
    stop()
    setVoiceStatus(questionId, 'idle')
    listeningQuestionId.value = null
    return
  }

  if (listeningQuestionId.value && listeningQuestionId.value !== questionId) {
    stop()
    setVoiceStatus(listeningQuestionId.value, 'idle')
  }

  listeningQuestionId.value = questionId
  setVoiceStatus(questionId, 'listening')
  start((value) => {
    appendInterviewAnswer(questionId, value)
    setVoiceStatus(questionId, 'recognizing')
  })
}
</script>
