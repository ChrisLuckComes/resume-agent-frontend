import type { UserContext } from '../types/resume-agent'

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
