<template>
  <aside class="w-60 h-screen bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 flex flex-col shadow-sm">
    <div class="h-16 flex items-center justify-center font-bold text-xl tracking-wide text-blue-700 bg-white border-b border-gray-100 select-none">
      <svg class="inline-block mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="4" fill="#2563eb"/><rect x="6" y="8" width="12" height="8" rx="2" fill="#fff"/><path d="M9 11h6M9 14h6" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round"/></svg>
      Resume Agent
    </div>
    <nav class="flex-1 flex flex-col gap-1 px-3 py-6">
      <div class="mb-4">
        <span class="text-xs text-gray-400 pl-2">导航</span>
      </div>
      <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition group">
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="3" y="5" width="12" height="8" rx="2" fill="#dbeafe"/><rect x="6" y="8" width="6" height="2" rx="1" fill="#2563eb"/></svg>
        Dashboard
      </button>
      <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition group">
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M4 5h10v8H4z" fill="#f3f4f6"/><path d="M6 7h6v4H6z" fill="#2563eb"/></svg>
        历史
      </button>
      <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 font-medium hover:bg-blue-100 hover:text-blue-700 transition group">
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="#f3f4f6"/><path d="M9 6v3l2 2" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round"/></svg>
        设置
      </button>
      <div class="border-t border-gray-100 my-6"></div>
      <div class="pl-2 text-xs text-gray-400 mb-2">帮助与支持</div>
      <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-500 font-normal hover:bg-blue-50 hover:text-blue-700 transition group">
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#2563eb" stroke-width="1.2"/><path d="M8 11v-1M8 5.5a1.5 1.5 0 0 1 1.5 1.5c0 .828-.672 1.5-1.5 1.5S6.5 7.828 6.5 7" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/></svg>
        帮助中心
      </button>
    </nav>
    <div class="px-4 py-3 border-t border-gray-100 bg-white">
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#2563eb" stroke-width="1.2"/><path d="M8 11v-1M8 5.5a1.5 1.5 0 0 1 1.5 1.5c0 .828-.672 1.5-1.5 1.5S6.5 7.828 6.5 7" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/></svg>
        2026 Resume Agent
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
