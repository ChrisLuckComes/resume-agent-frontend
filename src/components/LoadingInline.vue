<template>
  <span class="loading-inline">
    <span class="loading-inline__spinner" aria-hidden="true"></span>
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>
