<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full border border-gray-100">
    <div class="font-bold text-base mb-3 flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-purple-500"></span>简历智能评估报告
    </div>
    <div v-if="eva" class="flex flex-col gap-4">
      <!-- 结论与分数区块 -->
      <div class="flex flex-row gap-2 items-center mb-1">
        <div class="flex flex-col gap-0.5 flex-1">
          <div class="text-xs text-gray-500">评估结论</div>
          <div class="font-bold text-base text-gray-800 leading-tight">{{ eva.decision }}</div>
        </div>
        <div class="flex flex-col items-center justify-center min-w-[100px]">
          <div class="text-3xl font-extrabold text-blue-700 leading-none">{{ eva.match_score }}<span class="text-base align-top font-bold">分</span></div>
          <div class="mt-1 px-2 py-0.5 rounded-full text-white text-xs font-semibold" :class="eva.match_score >= 85 ? 'bg-green-500' : eva.match_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'">
            {{ eva.match_score >= 85 ? '强匹配' : eva.match_score >= 70 ? '中匹配' : '弱匹配' }}
          </div>
        </div>
      </div>
      <div class="text-xs text-gray-500 mb-2">评估区间: {{ eva.decision_range || '' }}</div>
      <!-- 雷达图单独一块，增加更大padding-top防止被遮挡 -->
      <div class="w-full flex justify-center items-center">
        <RadarChart
          v-if="eva.radarData && eva.radarIndicators"
          :data="eva.radarData"
          :indicators="eva.radarIndicators"
        />
      </div>
      <!-- 技术栈气泡区块 -->
      <div class="flex gap-2 mt-1 overflow-x-auto">
        <span v-for="tech in eva.tech_stack" :key="tech" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200 whitespace-nowrap">{{ tech }}</span>
      </div>
      <!-- 结构化卡片区块 -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-1 border border-gray-100">
          <div class="font-bold text-xs mb-1 text-gray-700 flex items-center gap-1">关键成就
            <span
              v-if="eva.key_achievements && eva.key_achievements.length"
              class="ml-1 text-blue-400 cursor-pointer"
              title="查看引用"
              @mouseenter="showCitation = true"
              @mouseleave="showCitation = false"
            >🔗</span>
          </div>
          <ul class="list-disc pl-5 text-xs text-gray-700">
            <li v-for="item in eva.key_achievements" :key="item">{{ item }}</li>
          </ul>
          <!-- 引用弹窗 -->
          <div v-if="showCitation" class="absolute z-50 left-1/2 -translate-x-1/2 top-12 bg-white border border-blue-200 rounded-xl shadow-lg p-4 w-72 text-xs text-gray-700">
            <div class="font-bold mb-2 text-blue-700">引用原文片段</div>
            <div v-for="frag in eva.citations || ['示例：JsonSchema 元数据引擎驱动业务 100% 配置化渲染']" :key="frag" class="mb-1 last:mb-0">{{ frag }}</div>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-1 border border-gray-100">
          <div class="font-bold text-xs mb-1 text-red-700 flex items-center gap-1">风险提示</div>
          <ul class="list-disc pl-5 text-xs text-red-700">
            <li v-for="risk in eva.risks" :key="risk">{{ risk }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-400 text-sm mt-12 text-center">请上传简历并点击分析</div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import RadarChart from './RadarChart.vue'
// 组件通过props接收eva数据，或由父组件/外部API传入
const props = defineProps<{ eva?: any }>()
const eva = toRef(props, 'eva')
const showCitation = ref(false)
</script>
