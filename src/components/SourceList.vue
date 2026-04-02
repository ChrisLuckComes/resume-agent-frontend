<template>
  <div v-if="resolvedSources.length > 0" class="source-block">
    <p v-if="title" class="source-block__title">{{ title }}</p>
    <ul class="source-list">
      <li v-for="source in resolvedSources" :key="source.sourceId" class="source-list__item">
        <span class="source-list__badge">{{ source.sourceId }}</span>
        <p class="source-list__snippet">{{ source.snippet }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { EvidenceSource } from '../types/resume-agent'

const props = defineProps<{
  sources: EvidenceSource[]
  sourceIds?: string[]
  title?: string
}>()

const resolvedSources = computed(() => {
  if (!props.sourceIds || props.sourceIds.length === 0) {
    return props.sources
  }

  const sourceMap = new Map(props.sources.map((source) => [source.sourceId, source]))
  return props.sourceIds
    .map((sourceId) => sourceMap.get(sourceId))
    .filter((source): source is EvidenceSource => Boolean(source))
})
</script>
