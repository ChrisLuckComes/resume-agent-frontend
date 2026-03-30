import { computed } from 'vue'

import { i18n, setLocale, SUPPORTED_LOCALES, type AppLocale } from '../i18n'

export function useLocale() {
  const locale = computed(() => i18n.global.locale.value as AppLocale)

  function updateLocale(nextLocale: AppLocale) {
    setLocale(nextLocale)
  }

  return {
    locale,
    locales: SUPPORTED_LOCALES,
    setLocale: updateLocale,
  }
}
