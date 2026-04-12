import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import type { ECharts, EChartsCoreOption } from 'echarts/core'

export interface LineChartPoint {
  label: string
  value: number
}

let echartsModulePromise: Promise<typeof import('echarts/core')> | null = null

async function loadECharts() {
  if (!echartsModulePromise) {
    echartsModulePromise = Promise.all([
      import('echarts/core'),
      import('echarts/charts'),
      import('echarts/components'),
      import('echarts/renderers'),
    ]).then(([echarts, charts, components, renderers]) => {
      echarts.use([
        charts.LineChart,
        charts.BarChart,
        components.TooltipComponent,
        components.GridComponent,
        components.LegendComponent,
        components.DatasetComponent,
        renderers.CanvasRenderer,
      ])
      return echarts
    })
  }

  return echartsModulePromise
}

export function useLineChart(
  chartRef: Ref<HTMLDivElement | null>,
  pointsRef: Ref<LineChartPoint[]>,
  options: {
    seriesName: string
    color: string
    yAxisFormatter?: (value: number) => string
  },
) {
  let chart: ECharts | null = null
  let isUnmounted = false

  const renderChart = async () => {
    if (!chartRef.value || pointsRef.value.length === 0) {
      chart?.clear()
      return
    }

    const echarts = await loadECharts()
    if (isUnmounted || !chartRef.value) {
      return
    }

    chart ??= echarts.init(chartRef.value)

    const option: EChartsCoreOption = {
      animationDuration: 500,
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: 24,
        right: 16,
        top: 18,
        bottom: 28,
      },
      xAxis: {
        type: 'category',
        data: pointsRef.value.map((point) => point.label),
        axisLabel: {
          color: 'rgba(228, 255, 248, 0.72)',
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(124, 252, 216, 0.22)',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'rgba(228, 255, 248, 0.72)',
          formatter: (value: number) => options.yAxisFormatter?.(value) ?? String(value),
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(124, 252, 216, 0.1)',
          },
        },
      },
      series: [
        {
          name: options.seriesName,
          type: 'line',
          smooth: true,
          data: pointsRef.value.map((point) => point.value),
          lineStyle: {
            width: 3,
            color: options.color,
          },
          areaStyle: {
            color: options.color,
            opacity: 0.12,
          },
          itemStyle: {
            color: options.color,
          },
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

  watch(
    pointsRef,
    () => {
      void renderChart()
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    isUnmounted = true
    window.removeEventListener('resize', resizeChart)
    chart?.dispose()
    chart = null
  })
}
