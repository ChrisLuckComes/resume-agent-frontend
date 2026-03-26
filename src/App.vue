<template>
  <div class="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />
      <!-- 主工作区 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 上层多栏结构化工作区 -->
        <Dashboard />
        <!-- 底部固定聊天区 -->
        <div class="w-full bg-white shadow fixed left-60 right-0 bottom-0 z-20">
          <ChatBox />
        </div>
        <!-- 占位高度，防止内容被底部聊天区遮挡 -->
        <div class="h-36"></div>
      </div>
    </div>
    <footer class="text-center text-xs text-gray-400 py-2">© 2026 Resume Agent</footer>
  </div>
</template>

<script setup lang="ts">
// 防止根元素出现滚动条
import { onMounted } from 'vue'
onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  const app = document.getElementById('app')
  if (app) app.style.overflow = 'hidden'
})
import Dashboard from './components/Dashboard.vue'
import ChatBox from './components/ChatBox.vue'
import Sidebar from './components/Sidebar.vue'
</script>
