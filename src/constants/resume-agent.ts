import type { SelectOption, UserContext } from '../types/resume-agent'

export const TARGET_SENIORITY_OPTIONS: SelectOption[] = [
  {
    labelKey: 'jd.seniority.option.junior',
    value: 'junior',
  },
  {
    labelKey: 'jd.seniority.option.mid',
    value: 'mid',
  },
  {
    labelKey: 'jd.seniority.option.senior',
    value: 'senior',
  },
  {
    labelKey: 'jd.seniority.option.lead',
    value: 'lead',
  },
]

export const DEFAULT_TARGET_SENIORITY = 'senior'

export const DEFAULT_USER_CONTEXT: UserContext = {
  userId: 'resume-agent-demo',
  phone: '13800000000',
}

export const MATCH_SCORE_THRESHOLDS = {
  strong: 80,
  warning: 60,
} as const

export const MAX_RADAR_SCORE = 100

export const FOLLOW_UP_SUGGESTIONS = [
  '这位候选人与 JD 关键词的匹配证据分别是什么？',
  '这位候选人距离目标级别还有哪些关键差距？',
]

export const RESUME_LIMIT = 8

export const FAKE_THINKING_FRAMES = 4
