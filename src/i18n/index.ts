import { createI18n } from 'vue-i18n'

import enUS from '../locales/en-us'
import zhCN from '../locales/zh-cn'

export const DEFAULT_LOCALE = 'zh-cn'
export const FALLBACK_LOCALE = 'en-us'
export const LOCALE_STORAGE_KEY = 'resume-agent-locale'

export const messages = {
  'zh-cn': zhCN,
  'en-us': enUS,
} as const

export type AppLocale = keyof typeof messages
export const SUPPORTED_LOCALES = Object.keys(messages) as AppLocale[]

function resolveLocale(): AppLocale {
  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY) as AppLocale | null

  if (savedLocale && savedLocale in messages) {
    return savedLocale
  }

  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
})

export function translate(key: string, params?: Record<string, string | number>): string {
  return params ? i18n.global.t(key, params) : i18n.global.t(key)
}

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}
