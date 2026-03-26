<template>
  <aside :class="['h-screen bg-[#f9f9f9] border-r border-gray-200 flex flex-col transition-all duration-300', collapsed ? 'w-16' : 'w-60']">
    <div class="flex items-center h-14 px-4 gap-2 border-b border-gray-200">
      <button class="focus:outline-none" @click="collapsed = !collapsed" style="background:none;border:none;padding:0;">
        <BookLogo :collapsed="collapsed" />
      </button>
    </div>
    <div class="flex-1"></div>
  </aside>
</template>

<script setup lang="tsx">
import { ref } from 'vue';

const collapsed = ref(false);

// 书本logo组件，点击时旋转
const BookLogo = (props: { collapsed?: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{transition:'transform 0.3s', transform: props.collapsed ? 'rotate(-90deg)' : 'none'}}>
    <rect x="4" y="6" width="24" height="20" rx="4" fill="#23272f"/>
    <rect x="7" y="9" width="18" height="14" rx="2" fill="#fff"/>
    <path d="M11 13h10M11 17h10" stroke="#23272f" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
)
</script>

<style scoped>
</style>
