<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full border border-gray-100">
    <div class="font-bold text-base mb-3 flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-blue-500"></span>JD描述与分析
    </div>
    <textarea v-model="jdText" rows="6" class="w-full border border-gray-200 rounded-lg p-2 mb-3 text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none" placeholder="输入JD描述..." />
    <div class="flex flex-wrap gap-2 mb-3 min-h-[28px]">
      <span v-for="kw in jdKeywords" :key="kw" class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{{ kw }}</span>
    </div>
    <button class="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg py-2 mt-auto font-semibold shadow-sm" @click="analyzeJD">分析JD关键词</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const jdText = ref('')
const jdKeywords = ref(['熟悉Vue3', '性能调优', 'Electron经验'])
function analyzeJD() {
  // TODO: JD分析API
  jdKeywords.value = ['Vue3', '性能优化', 'Electron']
}
</script>
