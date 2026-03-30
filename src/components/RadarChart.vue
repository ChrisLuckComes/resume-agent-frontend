<template>
  <div ref="chartRef" class="radar-chart"></div>
</template>

<script setup lang="ts">
import { toRef, ref } from 'vue'

import { useRadarChart } from '../composables/useRadarChart'
import type { RadarMetric } from '../types/resume-agent'

const props = defineProps({
  metrics: {
    type: Array as () => RadarMetric[],
    default: () => [],
  },
})

const chartRef = ref<HTMLDivElement | null>(null)
const metricsRef = toRef(props, 'metrics')

useRadarChart(chartRef, metricsRef)
</script>
