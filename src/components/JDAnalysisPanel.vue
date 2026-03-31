<template>
  <GlassPanel :title="t('jd.panel.title')" :eyebrow="t('jd.panel.eyebrow')">
    <div class="stack-16">
      <div class="stack-8">
        <label class="field-label" for="jd-textarea">{{ t('jd.field.description') }}</label>
      </div>

      <div class="jd-textarea-shell">
        <textarea
          id="jd-textarea"
          v-model="jdText"
          class="input-shell textarea-shell textarea-shell--with-action"
          :placeholder="t('jd.placeholder.description')"
          rows="8"
        ></textarea>
        <button
          class="jd-ocr-button"
          type="button"
          :disabled="ocrStatus === 'loading'"
          @click="openImageDialog"
        >
          <LoadingInline v-if="ocrStatus === 'loading'" :label="t('jd.button.ocrLoading')" />
          <span v-else>{{ t('jd.button.ocrImage') }}</span>
        </button>
        <input ref="imageInputRef" type="file" class="sr-only" accept="image/*" @change="handleImageChange" />
      </div>

      <div class="single-action-row">
        <button
          class="action-button action-button--primary action-button--full"
          :disabled="analyzeStatus === 'loading'"
          @click="analyzeJobDescription"
        >
          <LoadingInline v-if="analyzeStatus === 'loading'" :label="t('jd.button.analyzing')" />
          <span v-else>{{ t('jd.button.analyzyJD') }}</span>
        </button>
      </div>

      <KeywordTicker v-if="jdKeywords.length > 0" :keywords="jdKeywords" />
    </div>
  </GlassPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '../composables/useI18n'
import { useWorkbench } from '../composables/useWorkbench'
import GlassPanel from './GlassPanel.vue'
import KeywordTicker from './KeywordTicker.vue'
import LoadingInline from './LoadingInline.vue'

const t = useI18n()
const imageInputRef = ref<HTMLInputElement | null>(null)
const { jdKeywords, jdText, analyzeStatus, ocrStatus, analyzeJobDescription, ocrJDImage } = useWorkbench()

function openImageDialog() {
  imageInputRef.value?.click()
}

async function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  await ocrJDImage(file)
  target.value = ''
}
</script>
