<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart as EchartsRadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([EchartsRadarChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{ data: number[], indicators: { name: string, max: number }[] }>()
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {},
    radar: {
      indicator: props.indicators,
      radius: '50%',
      splitArea: { areaStyle: { color: ['#f3f4f6', '#fff'] } },
      axisLine: { lineStyle: { color: '#a5b4fc' } },
      splitLine: { lineStyle: { color: '#a5b4fc' } },
      name: { color: '#6366f1', fontWeight: 'bold' }
    },
    series: [{
      type: 'radar',
      data: [{ value: props.data, areaStyle: { color: 'rgba(99,102,241,0.2)' }, lineStyle: { color: '#6366f1' } }]
    }]
  })
}
onMounted(renderChart)
watch(() => props.data, renderChart)
</script>
<style scoped>
div { min-width: 120px; min-height: 120px; }
</style>
