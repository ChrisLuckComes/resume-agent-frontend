<template>
  <div ref="chartRef" class="trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'

import { useLineChart, type LineChartPoint } from '../composables/useLineChart'

const props = defineProps<{
  points: LineChartPoint[]
  seriesName: string
  color: string
  mode?: 'plain' | 'currency'
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const pointsRef = toRef(props, 'points')

useLineChart(chartRef, pointsRef, {
  seriesName: props.seriesName,
  color: props.color,
  yAxisFormatter: props.mode === 'currency' ? (value) => value.toFixed(4) : undefined,
})
</script>
