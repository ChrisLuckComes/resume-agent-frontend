import {
  MATCH_SCORE_THRESHOLDS,
  MAX_RADAR_SCORE,
} from '../constants/resume-agent'
import { translate } from '../i18n'
import type {
  AssessmentReport,
  RadarMetric,
  ResumeCandidate,
} from '../types/resume-agent'

const EMPTY_SUMMARY = ''

export function sanitizeCandidateName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const normalized = baseName.replace(/[._-]+/g, ' ').trim()

  return normalized || translate('workbench.candidate.unnamed')
}

export function normalizeKeywords(response: { keywords: string[] }): string[] {
  return uniqueStrings(response.keywords).slice(0, 6)
}

export function normalizeAssessmentReport(payload: unknown, keywords: string[], candidate: ResumeCandidate | null): AssessmentReport {
  const raw = asRecord(payload)
  const evaluation = asRecord(raw.evaluation ?? raw.report ?? raw)
  const matchScore = toBoundedScore(evaluation.match_score ?? evaluation.matchScore ?? evaluation.score)
  const highlights = normalizeStringList(evaluation.highlights ?? evaluation.key_achievements ?? evaluation.keyAchievements)
  const risks = normalizeStringList(evaluation.risks ?? evaluation.concerns)
  const summary =
    toText(evaluation.summary) ??
    toText(evaluation.decision) ??
    buildSummary(matchScore, candidate?.name ?? translate('workbench.assessment.defaultCandidateName'), keywords)
  const title =
    toText(evaluation.title) ??
    toText(evaluation.decision_range) ??
    toText(evaluation.decision) ??
    buildTitle(matchScore)

  return {
    summary,
    highlights: highlights.length > 0 ? highlights : buildHighlights(keywords, candidate?.name ?? translate('workbench.assessment.defaultCandidateShortName')),
    risks: risks.length > 0 ? risks : buildRisks(keywords, matchScore),
    matchScore,
    title,
    radarMetrics: normalizeRadarMetrics(evaluation, keywords, matchScore),
  }
}

export function buildEvaluationPlaceholder(): AssessmentReport {
  return {
    summary: EMPTY_SUMMARY,
    highlights: [],
    risks: [],
    matchScore: 0,
    title: '',
    radarMetrics: [],
  }
}

export function buildFollowUpContext(candidateName: string, jdKeywords: string[]): string {
  const keywordSegment = jdKeywords.length > 0
    ? ` ${translate('workbench.prompt.jdFocus', { keywords: jdKeywords.join(', ') })}`
    : ''

  return `${translate('workbench.prompt.candidateContext', { candidateName })}${keywordSegment}`.trim()
}

function normalizeRadarMetrics(evaluation: Record<string, unknown>, keywords: string[], matchScore: number): RadarMetric[] {
  const radarMetrics = evaluation.radar_metrics
  if (Array.isArray(radarMetrics)) {
    const normalized = radarMetrics
      .map((item) => asRecord(item))
      .map((item) => ({
        name: toText(item.name) ?? translate('workbench.assessment.fallbackDimension'),
        max: MAX_RADAR_SCORE,
        value: toBoundedScore(item.value ?? item.score),
      }))
      .filter((item) => item.name)

    if (normalized.length > 0) {
      return normalized.slice(0, 6)
    }
  }

  const radarData = Array.isArray(evaluation.radarData) ? evaluation.radarData : []
  const radarIndicators = Array.isArray(evaluation.radarIndicators) ? evaluation.radarIndicators : []
  if (radarData.length > 0 && radarIndicators.length > 0) {
    return radarIndicators.slice(0, 6).map((indicator, index) => {
      const indicatorRecord = asRecord(indicator)
      return {
        name: toText(indicatorRecord.name) ?? translate('workbench.assessment.fallbackDimension'),
        max: MAX_RADAR_SCORE,
        value: toBoundedScore(radarData[index]),
      }
    })
  }

  const dimensions = [
    translate('workbench.assessment.fallbackDimensions.techDepth'),
    translate('workbench.assessment.fallbackDimensions.projectExperience'),
    translate('workbench.assessment.fallbackDimensions.softSkills'),
    translate('workbench.assessment.fallbackDimensions.backgroundExamples'),
    translate('workbench.assessment.fallbackDimensions.aiSkills'),
  ]

  return dimensions.slice(0, 5).map((name, index) => ({
    name,
    max: MAX_RADAR_SCORE,
    value: buildFallbackRadarValue(matchScore, index),
  }))
}

function buildFallbackRadarValue(matchScore: number, index: number): number {
  const offsets = [0, -8, -14, -10, -6]
  const offset = offsets[index] ?? -12

  return toBoundedScore(matchScore + offset)
}

function buildTitle(matchScore: number): string {
  if (matchScore >= MATCH_SCORE_THRESHOLDS.strong) {
    return translate('assessment.fallback.title.strong')
  }

  if (matchScore >= MATCH_SCORE_THRESHOLDS.warning) {
    return translate('assessment.fallback.title.potential')
  }

  return translate('assessment.fallback.title.review')
}

function buildSummary(matchScore: number, candidateName: string, keywords: string[]): string {
  const keywordText = keywords.length > 0
    ? keywords.slice(0, 3).join(', ')
    : translate('workbench.assessment.defaultKeywordText')

  if (matchScore >= MATCH_SCORE_THRESHOLDS.strong) {
    return translate('assessment.fallback.summary.strong', { candidateName, keywordText })
  }

  if (matchScore >= MATCH_SCORE_THRESHOLDS.warning) {
    return translate('assessment.fallback.summary.potential', { candidateName, keywordText })
  }

  return translate('assessment.fallback.summary.review', { candidateName, keywordText })
}

function buildHighlights(keywords: string[], candidateName: string): string[] {
  const primaryKeywords = keywords.length > 0
    ? keywords.slice(0, 3)
    : [translate('workbench.assessment.fallbackHighlight.coreFrontend')]

  return primaryKeywords.map((keyword, index) => {
    if (index === 0) {
      return translate('assessment.fallback.highlights.primary', { candidateName, keyword })
    }

    return translate('assessment.fallback.highlights.secondary', { keyword })
  })
}

function buildRisks(keywords: string[], matchScore: number): string[] {
  const primaryKeyword = keywords[0] ?? translate('workbench.assessment.defaultKeywordText')

  if (matchScore >= MATCH_SCORE_THRESHOLDS.warning) {
    return [translate('assessment.fallback.risks.validation', { keyword: primaryKeyword })]
  }

  return [
    translate('assessment.fallback.risks.limitedEvidence', { keyword: primaryKeyword }),
    translate('assessment.fallback.risks.ownership'),
  ]
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return uniqueStrings(value.map((item) => toText(item)).filter(Boolean) as string[])
}

function uniqueStrings(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, collection) => collection.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
}

function toText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function toBoundedScore(value: unknown): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  if (Number.isNaN(numericValue)) {
    return 72
  }

  return Math.max(0, Math.min(MAX_RADAR_SCORE, Math.round(numericValue)))
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}
