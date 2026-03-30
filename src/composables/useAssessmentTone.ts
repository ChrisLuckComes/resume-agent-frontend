import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { MATCH_SCORE_THRESHOLDS } from '../constants/resume-agent'

export function useAssessmentTone(scoreSource: MaybeRefOrGetter<number>) {
  const score = computed(() => toValue(scoreSource))

  const tone = computed(() => {
    if (score.value >= MATCH_SCORE_THRESHOLDS.strong) {
      return 'positive'
    }

    if (score.value >= MATCH_SCORE_THRESHOLDS.warning) {
      return 'warning'
    }

    return 'danger'
  })

  const scoreClass = computed(() => `score-${tone.value}`)
  const badgeLabel = computed(() => {
    if (tone.value === 'positive') {
      return 'assessment.score.highMatch'
    }

    if (tone.value === 'warning') {
      return 'assessment.score.moderateMatch'
    }

    return 'assessment.score.lowMatch'
  })

  return {
    tone,
    scoreClass,
    badgeLabel,
  }
}
