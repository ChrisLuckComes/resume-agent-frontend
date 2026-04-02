import {
  MATCH_SCORE_THRESHOLDS,
  MAX_RADAR_SCORE,
  SYNTHETIC_PHONE_PREFIX,
  SYNTHETIC_PHONE_SUFFIX_LENGTH,
} from '../constants/resume-agent'
import { translate } from '../i18n'
import type {
  AssessmentItem,
  AssessmentReport,
  EvidenceSource,
  EvaluationStreamEvent,
  InterviewQuestion,
  InterviewHistoryItem,
  InterviewHistoryResponse,
  InterviewQuestionResult,
  InterviewSessionDetail,
  InterviewSubmitResult,
  RadarMetric,
  ResumeCandidate,
} from '../types/resume-agent'

const EMPTY_SUMMARY = ''

export function sanitizeCandidateName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const normalized = baseName.replace(/[._-]+/g, ' ').trim()

  return normalized || translate('workbench.candidate.unnamed')
}

export function buildCandidatePhone(fileName: string, fallbackPhone: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const digits = Array.from(baseName)
    .map((char) => String(char.codePointAt(0) ?? 0))
    .join('')
    .replace(/\D/g, '')

  if (!digits) {
    return fallbackPhone
  }

  const suffix = digits.slice(-SYNTHETIC_PHONE_SUFFIX_LENGTH).padStart(SYNTHETIC_PHONE_SUFFIX_LENGTH, '0')
  return `${SYNTHETIC_PHONE_PREFIX}${suffix}`
}

export function normalizeKeywords(response: { keywords: string[] }): string[] {
  return uniqueStrings(response.keywords).slice(0, 6)
}

export function normalizeAssessmentReport(payload: unknown, keywords: string[], candidate: ResumeCandidate | null): AssessmentReport {
  const raw = asRecord(payload)
  const evaluation = asRecord(raw.evaluation ?? raw.report ?? raw)
  const matchScore = toBoundedScore(evaluation.match_score ?? evaluation.matchScore ?? evaluation.score)
  const sources = normalizeSources(evaluation.sources)
  const highlights = normalizeAssessmentItems(evaluation.highlights ?? evaluation.key_achievements ?? evaluation.keyAchievements)
  const risks = normalizeAssessmentItems(evaluation.risks ?? evaluation.concerns)
  const summary =
    toText(evaluation.summary) ??
    toText(evaluation.decision) ??
    buildSummary(matchScore, candidate?.name ?? translate('workbench.assessment.defaultCandidateName'), keywords)
  const summarySourceIds = normalizeSourceIds(evaluation.summary_source_ids ?? evaluation.summarySourceIds, sources)
  const title =
    toText(evaluation.title) ??
    toText(evaluation.decision_range) ??
    toText(evaluation.decision) ??
    buildTitle(matchScore)

  return {
    summary,
    summarySourceIds,
    highlights: highlights.length > 0 ? bindItemsToSources(highlights, sources) : buildHighlights(keywords, candidate?.name ?? translate('workbench.assessment.defaultCandidateShortName'), sources),
    risks: risks.length > 0 ? bindItemsToSources(risks, sources) : buildRisks(keywords, matchScore, sources),
    matchScore,
    title,
    radarMetrics: normalizeRadarMetrics(evaluation, keywords, matchScore),
    sources,
  }
}

export function buildEvaluationPlaceholder(): AssessmentReport {
  return {
    summary: EMPTY_SUMMARY,
    summarySourceIds: [],
    highlights: [],
    risks: [],
    matchScore: 0,
    title: '',
    radarMetrics: [],
    sources: [],
  }
}

export function normalizeChatSources(value: unknown): EvidenceSource[] {
  return normalizeSources(value)
}

export function mergeAssessmentStreamEvent(report: AssessmentReport, event: EvaluationStreamEvent): AssessmentReport {
  switch (event.type) {
    case 'sources':
      return {
        ...report,
        sources: normalizeSources(event.sources),
      }
    case 'score':
      return {
        ...report,
        matchScore: toBoundedScore(event.match_score),
        title: toText(event.title) ?? report.title,
      }
    case 'radar_metrics':
      return {
        ...report,
        radarMetrics: normalizeRadarMetrics({ radar_metrics: event.radar_metrics }, [], report.matchScore),
      }
    case 'summary':
      return {
        ...report,
        summary: toText(event.summary) ?? report.summary,
        summarySourceIds: normalizeSourceIds(event.summary_source_ids, report.sources),
      }
    case 'highlights':
      return {
        ...report,
        highlights: bindItemsToSources(normalizeAssessmentItems(event.highlights), report.sources),
      }
    case 'risks':
      return {
        ...report,
        risks: bindItemsToSources(normalizeAssessmentItems(event.risks), report.sources),
      }
    case 'result':
      return report
    default:
      return report
  }
}

export function buildFollowUpContext(candidateName: string, jdKeywords: string[]): string {
  const keywordSegment = jdKeywords.length > 0
    ? ` ${translate('workbench.prompt.jdFocus', { keywords: jdKeywords.join(', ') })}`
    : ''

  return `${translate('workbench.prompt.candidateContext', { candidateName })}${keywordSegment}`.trim()
}

export function normalizeInterviewQuestion(value: unknown): InterviewQuestion | null {
  const raw = asRecord(value)
  const questionId = toText(raw.question_id) ?? toText(raw.questionId)
  const category = toText(raw.category)
  const question = toText(raw.question)
  const intent = toText(raw.intent) ?? ''
  if (!questionId || !category || !question) {
    return null
  }

  return {
    questionId,
    category: category as InterviewQuestion['category'],
    question,
    intent,
    sourceIds: normalizeStringList(raw.source_ids ?? raw.sourceIds),
  }
}

export function normalizeInterviewSubmitResult(value: unknown): InterviewSubmitResult {
  const raw = asRecord(value)
  return {
    totalScore: toBoundedScore(raw.total_score ?? raw.totalScore),
    verdict: normalizeInterviewVerdict(raw.verdict),
    overallFeedback: toText(raw.overall_feedback) ?? toText(raw.overallFeedback) ?? '',
    strengths: normalizeStringList(raw.strengths),
    risks: normalizeStringList(raw.risks),
    questionResults: normalizeInterviewQuestionResults(raw.question_results ?? raw.questionResults),
  }
}

export function normalizeInterviewHistory(value: unknown): InterviewHistoryResponse {
  const raw = asRecord(value)
  const items = Array.isArray(raw.items) ? raw.items : []
  return {
    items: items
      .map((item) => asRecord(item))
      .map((item): InterviewHistoryItem => ({
        sessionId: toText(item.session_id) ?? toText(item.sessionId) ?? '',
        interviewIdentity: toText(item.interview_identity) ?? toText(item.interviewIdentity) ?? '',
        candidateName: toText(item.candidate_name) ?? toText(item.candidateName) ?? '',
        verdict: toText(item.verdict) ?? '',
        totalScore: toBoundedScore(item.total_score ?? item.totalScore),
        createdAt: toText(item.created_at) ?? toText(item.createdAt) ?? '',
      }))
      .filter((item) => item.sessionId),
  }
}

export function normalizeInterviewSessionDetail(value: unknown): InterviewSessionDetail {
  const raw = asRecord(value)
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : []
  const rawAnswers = Array.isArray(raw.answers) ? raw.answers : []

  return {
    sessionId: toText(raw.session_id) ?? toText(raw.sessionId) ?? '',
    interviewIdentity: toText(raw.interview_identity) ?? toText(raw.interviewIdentity) ?? '',
    candidateName: toText(raw.candidate_name) ?? toText(raw.candidateName) ?? '',
    status: toText(raw.status) ?? '',
    questions: rawQuestions.map((item) => normalizeInterviewQuestion(item)).filter((item): item is InterviewQuestion => item !== null),
    answers: rawAnswers
      .map((item) => asRecord(item))
      .map((item) => ({
        questionId: toText(item.question_id) ?? toText(item.questionId) ?? '',
        question: toText(item.question) ?? '',
        category: (toText(item.category) ?? 'technical_depth') as InterviewQuestion['category'],
        answer: toText(item.answer) ?? '',
      }))
      .filter((item) => item.questionId),
    result: Object.keys(asRecord(raw.result)).length > 0 ? normalizeInterviewSubmitResult(raw.result) : null,
    createdAt: toText(raw.created_at) ?? toText(raw.createdAt) ?? '',
    updatedAt: toText(raw.updated_at) ?? toText(raw.updatedAt) ?? '',
  }
}

function normalizeInterviewQuestionResults(value: unknown): InterviewQuestionResult[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => asRecord(item))
    .map((item) => ({
      questionId: toText(item.question_id) ?? toText(item.questionId) ?? '',
      score: toBoundedScore(item.score),
      feedback: toText(item.feedback) ?? '',
      strengths: normalizeStringList(item.strengths),
      improvements: normalizeStringList(item.improvements),
    }))
    .filter((item) => item.questionId)
}

function normalizeInterviewVerdict(value: unknown): InterviewSubmitResult['verdict'] {
  const text = toText(value)
  if (text === '通过') {
    return 'passed'
  }
  if (text === '待定') {
    return 'pending'
  }
  return 'rejected'
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

function buildHighlights(keywords: string[], candidateName: string, sources: EvidenceSource[]): AssessmentItem[] {
  const primaryKeywords = keywords.length > 0
    ? keywords.slice(0, 3)
    : [translate('workbench.assessment.fallbackHighlight.coreFrontend')]

  return primaryKeywords.map((keyword, index) => {
    if (index === 0) {
      return {
        text: translate('assessment.fallback.highlights.primary', { candidateName, keyword }),
        sourceIds: sources.slice(0, 1).map((source) => source.sourceId),
      }
    }

    return {
      text: translate('assessment.fallback.highlights.secondary', { keyword }),
      sourceIds: sources.slice(0, 1).map((source) => source.sourceId),
    }
  })
}

function buildRisks(keywords: string[], matchScore: number, sources: EvidenceSource[]): AssessmentItem[] {
  const primaryKeyword = keywords[0] ?? translate('workbench.assessment.defaultKeywordText')

  if (matchScore >= MATCH_SCORE_THRESHOLDS.warning) {
    return [{
      text: translate('assessment.fallback.risks.validation', { keyword: primaryKeyword }),
      sourceIds: sources.slice(0, 1).map((source) => source.sourceId),
    }]
  }

  return [
    {
      text: translate('assessment.fallback.risks.limitedEvidence', { keyword: primaryKeyword }),
      sourceIds: [],
    },
    {
      text: translate('assessment.fallback.risks.ownership'),
      sourceIds: sources.slice(0, 1).map((source) => source.sourceId),
    },
  ]
}

function bindItemsToSources(items: AssessmentItem[], sources: EvidenceSource[]): AssessmentItem[] {
  return items.map((item) => ({
    text: item.text,
    sourceIds: normalizeSourceIds(item.sourceIds, sources),
  }))
}

function normalizeAssessmentItems(value: unknown): AssessmentItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          text: item.trim(),
          sourceIds: [],
        }
      }

      const record = asRecord(item)
      return {
        text: toText(record.text) ?? toText(record.value) ?? '',
        sourceIds: Array.isArray(record.source_ids)
          ? record.source_ids.map((sourceId) => String(sourceId).trim()).filter(Boolean)
          : Array.isArray(record.sourceIds)
            ? record.sourceIds.map((sourceId) => String(sourceId).trim()).filter(Boolean)
            : [],
      }
    })
    .filter((item) => item.text)
}

function normalizeSources(value: unknown): EvidenceSource[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  return value
    .map((item) => asRecord(item))
    .map((item, index) => ({
      sourceId: toText(item.source_id) ?? toText(item.sourceId) ?? `source_${index + 1}`,
      snippet: toText(item.snippet) ?? '',
    }))
    .filter((item) => item.snippet && !seen.has(item.sourceId) && (seen.add(item.sourceId), true))
}

function normalizeSourceIds(value: unknown, sources: EvidenceSource[]): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const allowedSourceIds = new Set(sources.map((source) => source.sourceId))
  return value
    .map((item) => String(item).trim())
    .filter((item, index, collection) => item && allowedSourceIds.has(item) && collection.indexOf(item) === index)
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
