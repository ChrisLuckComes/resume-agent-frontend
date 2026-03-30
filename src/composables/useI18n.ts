import { useI18n as useVueI18n } from 'vue-i18n'

export function useI18n() {
  const { t } = useVueI18n()

  return t
}
