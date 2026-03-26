<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full border border-gray-100 items-center">
    <div class="font-bold text-base mb-3 flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>简历上传与状态
    </div>
    <div class="flex flex-col items-center justify-center flex-1 w-full">
      <div class="border-2 border-dashed border-gray-300 rounded-xl w-full h-32 flex flex-col items-center justify-center cursor-pointer mb-3 hover:border-blue-400 transition" @click="triggerFileInput">
        <svg width="44" height="44" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2"/><path d="M22 14v16M14 22h16" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/></svg>
        <div class="text-gray-400 text-sm mt-2">拖拽简历至此<br>或点击上传（.docx）</div>
        <input ref="fileInputRef" type="file" class="hidden" @change="onFileChange" />
      </div>
      <div v-if="resumeName" class="text-xs text-gray-500 mt-1">当前简历: <span class="font-semibold text-gray-700">{{ resumeName }}</span></div>
      <div v-if="resumeStatus" class="text-xs mt-1">处理状态: <span :class="statusColor">{{ resumeStatus }}</span></div>
      <div v-if="resumeStatus === 'COMPLETED'" class="text-xs mt-1"><a href="#" class="text-blue-600 underline">查看处理日志</a></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const fileInputRef = ref<HTMLInputElement | null>(null)
const resumeName = ref('')
const resumeStatus = ref('')
const statusColor = computed(() => resumeStatus.value === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600')
function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click()
}
function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  resumeName.value = file.name
  resumeStatus.value = 'PENDING'
  // TODO: 上传API
}
</script>
