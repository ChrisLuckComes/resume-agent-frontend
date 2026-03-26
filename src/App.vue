<template>
  <div class="min-h-screen w-full bg-[#fff] flex flex-row">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <main class="flex-1 flex flex-col items-center justify-end px-2 relative">
        <span class="text-base font-bold text-black absolute left-0 top-0 mt-4 ml-4">简历智能助手</span>
        <div class="w-full max-w-3xl flex flex-col gap-4 mt-6">
          <ChatBox />
        </div>
      </main>
      <footer class="text-center text-xs text-gray-400 py-2">© 2026 Resume Agent</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatBox from './components/ChatBox.vue'
import Sidebar from './components/Sidebar.vue'
</script>
