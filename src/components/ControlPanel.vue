<template>
  <div class="control-column">
    <div v-if="errorMessage" class="inline-alert inline-alert--error">{{ errorMessage }}</div>
    <JDAnalysisPanel />
    <ResumePoolPanel />
    <FollowUpPanel />
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from '../composables/useWorkbench'
import FollowUpPanel from './FollowUpPanel.vue'
import JDAnalysisPanel from './JDAnalysisPanel.vue'
import ResumePoolPanel from './ResumePoolPanel.vue'

const { errorMessage } = useWorkbench()
</script>
