<template>
  <div class="flex flex-row gap-6 w-full px-8 pt-4 pb-4" style="box-shadow: 0 4px 16px 0 rgba(60,60,100,0.06); border-bottom: none;">
    <div class="flex-1 min-w-[280px] max-w-[340px]">
      <JDCard />
    </div>
    <div class="flex-1 min-w-[280px] max-w-[340px]">
      <ResumeUploadCard />
    </div>
    <div class="flex-[2] min-w-[340px] max-w-[560px]">
      <EvaluationReportCard :eva="eva" />
    </div>
  </div>
</template>

<script setup lang="ts">
import JDCard from './JDCard.vue'
import ResumeUploadCard from './ResumeUploadCard.vue'
import EvaluationReportCard, { ResumeEvaluation } from './EvaluationReportCard.vue'
import { ref } from 'vue'

// ResumeEvaluation 类型定义见 EvaluationReportCard.vue
const eva = ref<ResumeEvaluation>({
  decision: 'Highly Recommended / Senior Frontend Expert',
  match_score: 92,
  decision_range: 'Highly Frontend Expert',
  radarData: [80, 90, 70, 85, 75],
  radarIndicators: [
    { name: '技术深度', max: 100 },
    { name: '项目经验', max: 100 },
    { name: '软技能', max: 100 },
    { name: '背景实力', max: 100 },
    { name: 'AI提效', max: 100 },
  ],
  key_achievements: ['主导Electron桌面端重构', 'JsonSchema元数据驱动', '性能压缩文档缩小93%'],
  ai_bonus: '深度集成AI开发流',
  risks: ['2022年及2025年两段工作经历时间较短'],
  tech_stack: ['Vue 2/3', 'TypeScript', 'Electron', 'Vite', 'Module Federation', 'Node.js', 'JsonSchema'],
  citations: ['JsonSchema 元数据引擎驱动业务 100% 配置化渲染', '性能压缩文档缩小93%（XB 2KB）']
})
</script>

<style scoped>
</style>
