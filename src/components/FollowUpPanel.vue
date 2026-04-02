<template>
  <GlassPanel :title="t('followup.panel.title')" :eyebrow="t('followup.panel.eyebrow')">
    <div class="stack-16">
      <div v-if="followUpMessages.length > 0" class="follow-up-thread">
        <article
          v-for="message in followUpMessages"
          :key="message.id"
          class="follow-up-bubble"
          :class="message.role === 'user' ? 'follow-up-bubble--user' : 'follow-up-bubble--ai'"
        >
          <p class="follow-up-bubble__role">{{ message.role === 'user' ? t('followup.role.user') : t('followup.role.ai') }}</p>
          <p class="follow-up-bubble__text">{{ message.text }}</p>
          <SourceList
            v-if="message.role === 'ai'"
            :title="t('followup.sources.title')"
            :sources="message.sources"
          />
        </article>
      </div>

      <div v-else-if="lastFollowUp" class="follow-up-card">
        <p class="follow-up-card__question">{{ lastFollowUp.question }}</p>
        <p class="follow-up-card__answer">{{ lastFollowUp.answer }}</p>
        <SourceList :title="t('followup.sources.title')" :sources="lastFollowUp.sources" />
      </div>

      <div class="follow-up-composer">
        <div class="follow-up-input-shell">
          <input
            :value="followUpDraft"
            class="follow-up-input"
            :placeholder="t('followup.placeholder.input')"
            @input="setFollowUpDraft(($event.target as HTMLInputElement).value)"
            @keydown.enter.prevent="sendFollowUpQuestion()"
          />
          <button class="action-button action-button--ghost" :disabled="followUpStatus === 'loading' || !selectedResume" @click="sendFollowUpQuestion()">
            <LoadingInline v-if="followUpStatus === 'loading'" :label="t('followup.button.sending')" />
            <span v-else>{{ t('followup.button.ask') }}</span>
          </button>
        </div>

        <div class="suggestion-row suggestion-row--follow-up">
          <div v-for="suggestion in displaySuggestions" :key="suggestion" class="suggestion-chip-wrap">
            <button
              class="suggestion-chip"
              :aria-label="suggestion"
              :disabled="followUpStatus === 'loading' || !selectedResume"
              @click="sendFollowUpQuestion(suggestion)"
            >
              <span class="suggestion-chip__label">{{ suggestion }}</span>
            </button>
            <span class="suggestion-chip__tooltip" role="tooltip">{{ suggestion }}</span>
          </div>
        </div>
      </div>
    </div>
  </GlassPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '../composables/useI18n'
import { useWorkbench } from '../composables/useWorkbench'
import GlassPanel from './GlassPanel.vue'
import LoadingInline from './LoadingInline.vue'
import SourceList from './SourceList.vue'

const t = useI18n()
const {
  followUpDraft,
  followUpStatus,
  followUpSuggestions,
  followUpMessages,
  lastFollowUp,
  selectedResume,
  setFollowUpDraft,
  sendFollowUpQuestion,
} = useWorkbench()

const displaySuggestions = computed(() =>
  followUpSuggestions.value.length > 0
    ? followUpSuggestions.value
    : [t('followup.suggestion.alignment'), t('followup.suggestion.seniorityGap')],
)
</script>
