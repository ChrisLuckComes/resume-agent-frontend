<template>
  <div class="stack-10">
    <p class="section-hint">{{ t('jd.tags.title') }}</p>
    <div class="ticker-row">
      <span v-for="keyword in keywords" :key="keyword" class="keyword-chip">{{ keyword }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n'

defineProps({
  keywords: {
    type: Array as () => string[],
    required: true,
  },
})

const t = useI18n()
</script>
