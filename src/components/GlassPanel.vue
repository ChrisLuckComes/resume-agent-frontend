<template>
  <section class="glass-panel" :class="panelClass">
    <header class="glass-panel__header">
      <div>
        <p class="panel-kicker">{{ eyebrow }}</p>
        <h2 class="panel-title">{{ title }}</h2>
      </div>
      <slot name="header"></slot>
    </header>
    <div class="glass-panel__body">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: '',
  },
  panelClass: {
    type: String,
    default: '',
  },
})
</script>
