<template>
  <header class="top-bar">
    <div>
      <div class="brand-mark">{{ t('topbar.brand.name') }}</div>
      <p class="brand-caption">{{ t('topbar.brand.caption') }}</p>
      <nav class="top-nav">
        <RouterLink class="top-nav__link" to="/">{{ t('topbar.nav.workbench') }}</RouterLink>
        <RouterLink class="top-nav__link" to="/prompt-playground">{{ t('topbar.nav.playground') }}</RouterLink>
        <RouterLink class="top-nav__link" to="/observability">{{ t('topbar.nav.observability') }}</RouterLink>
      </nav>
    </div>
    <div class="profile-pill">
      <label class="locale-switcher">
        <span class="locale-switcher__label">{{ t('topbar.locale.label') }}</span>
        <select class="locale-switcher__select" :value="locale" @change="handleLocaleChange">
          <option v-for="item in locales" :key="item" :value="item">
            {{ t(item === 'zh-cn' ? 'topbar.locale.zhCN' : 'topbar.locale.enUS') }}
          </option>
        </select>
      </label>
      <div class="profile-avatar">AR</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useI18n } from '../composables/useI18n'
import { useLocale } from '../composables/useLocale'
import type { AppLocale } from '../i18n'

const t = useI18n()
const { locale, locales, setLocale } = useLocale()

function handleLocaleChange(event: Event) {
  setLocale((event.target as HTMLSelectElement).value as AppLocale)
}
</script>
