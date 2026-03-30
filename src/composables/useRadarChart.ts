import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import type { ECharts, EChartsCoreOption } from 'echarts/core'

import type { RadarMetric } from '../types/resume-agent'

let echartsModulePromise: Promise<typeof import('echarts/core')> | null = null

async function loadECharts() {
  if (!echartsModulePromise) {
    echartsModulePromise = Promise.all([
      import('echarts/core'),
      import('echarts/charts'),
      import('echarts/components'),
      import('echarts/renderers'),
    ]).then(([echarts, charts, components, renderers]) => {
      echarts.use([charts.RadarChart, components.TooltipComponent, renderers.CanvasRenderer])
      return echarts
    })
  }

  return echartsModulePromise
}

export function useRadarChart(chartRef: Ref<HTMLDivElement | null>, metricsRef: Ref<RadarMetric[]>) {
  let chart: ECharts | null = null
  let isUnmounted = false

  const renderChart = async () => {
    if (!chartRef.value || metricsRef.value.length === 0) {
      return
    }

    const echarts = await loadECharts()

    if (isUnmounted || !chartRef.value || metricsRef.value.length === 0) {
      return
    }

    chart ??= echarts.init(chartRef.value)

    const option: EChartsCoreOption = {
      animationDuration: 600,
      tooltip: {
        trigger: 'item',
      },
      radar: {
        indicator: metricsRef.value.map((metric) => ({ name: metric.name, max: metric.max })),
        radius: '68%',
        splitNumber: 4,
        axisName: {
          color: '#d2fff4',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(167, 255, 234, 0.18)',
          },
        },
        splitArea: {
          areaStyle: {
            color: [
              'rgba(11, 23, 31, 0.22)',
              'rgba(11, 23, 31, 0.14)',
              'rgba(11, 23, 31, 0.1)',
              'rgba(11, 23, 31, 0.06)',
            ],
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(124, 252, 216, 0.28)',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: metricsRef.value.map((metric) => metric.value),
              areaStyle: {
                color: 'rgba(121, 255, 219, 0.22)',
              },
              lineStyle: {
                color: '#7fffdc',
                width: 2,
              },
              itemStyle: {
                color: '#b6ffee',
              },
            },
          ],
        },
      ],
    }

    chart.setOption(option)
  }

  const resizeChart = () => {
    chart?.resize()
  }

  onMounted(() => {
    void renderChart()
    window.addEventListener('resize', resizeChart)
  })

  watch(metricsRef, () => {
    if (metricsRef.value.length === 0) {
      chart?.clear()
      return
    }

    void renderChart()
  }, { deep: true })

  onBeforeUnmount(() => {
    isUnmounted = true
    window.removeEventListener('resize', resizeChart)
    chart?.dispose()
    chart = null
  })
}
