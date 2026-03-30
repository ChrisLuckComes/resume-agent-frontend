<template>
  <div class="app-shell">
    <div class="app-shell__backdrop"></div>
    <TopBar />
    <main class="workspace-grid">
      <ControlPanel />
      <AssessmentPanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useWorkbench } from '../composables/useWorkbench'
import AssessmentPanel from './AssessmentPanel.vue'
import ControlPanel from './ControlPanel.vue'
import TopBar from './TopBar.vue'

const { hydrateResumes } = useWorkbench()

onMounted(() => {
  hydrateResumes()
})
</script>
