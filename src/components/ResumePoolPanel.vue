<template>
  <GlassPanel :title="t('resume.panel.title')" :eyebrow="t('resume.panel.eyebrow')">
    <div class="stack-16">
      <div class="resume-toolbar">
        <button class="action-button action-button--secondary" :disabled="uploadStatus === 'loading'" @click="openFileDialog">
          <LoadingInline v-if="uploadStatus === 'loading'" :label="t('resume.button.uploading')" />
          <span v-else>{{ t('resume.button.import') }}</span>
        </button>
        <input ref="fileInputRef" type="file" class="sr-only" accept=".docx,.pdf,application/pdf" @change="handleFileChange" />

        <p v-if="resumeListStatus === 'loading' && resumes.length === 0" class="empty-inline-copy">
          {{ t('resume.loading.list') }}
        </p>

        <div class="resume-flow" v-if="resumes.length > 0">
          <CandidateChip
            v-for="resume in resumes"
            :key="resume.id"
            :candidate="resume"
            :selected="selectedResumeId === resume.id"
            @select="selectResume"
            @remove="confirmRemoveResume"
          />
        </div>
      </div>

      <p v-if="resumes.length === 0" class="empty-inline-copy">
        {{ t('resume.empty.hint') }}
      </p>
    </div>
  </GlassPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '../composables/useI18n'
import { useWorkbench } from '../composables/useWorkbench'
import CandidateChip from './CandidateChip.vue'
import GlassPanel from './GlassPanel.vue'
import LoadingInline from './LoadingInline.vue'

const fileInputRef = ref<HTMLInputElement | null>(null)
const t = useI18n()
const { resumes, selectedResumeId, resumeListStatus, uploadStatus, uploadResumeFile, removeResume, selectResume } = useWorkbench()

function openFileDialog() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  await uploadResumeFile(file)
  target.value = ''
}

async function confirmRemoveResume(resumeId: number) {
  const accepted = window.confirm(t('resume.confirm.remove'))

  if (accepted) {
    await removeResume(resumeId)
  }
}
</script>
