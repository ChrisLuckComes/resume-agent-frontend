export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export type ResumeStatus = 'pending' | 'ready' | 'error'

export type WorkbenchPhase =
  | 'ready'
  | 'analyzingJD'
  | 'waitingResume'
  | 'evaluatingResume'
  | 'completed'

export interface UserContext {
  userId: string
  phone: string
}

export interface JobDescriptionAnalysisRequest {
  text: string
}

export interface JobDescriptionAnalysisResponse {
  keywords: string[]
}

export interface OCRResponse {
  text: string
}

export interface UploadResumeForm {
  file: File
  candidate_name: string
  phone: string
  user_id: string
}

export interface UploadResumeResponse {
  message: string
  resume_id: number
  status: string
}

export interface ResumeListItem {
  resume_id: number
  candidate_name: string
  phone: string
  status: string
  updated_at: string
}

export interface ResumeListResponse {
  items: ResumeListItem[]
}

export interface EvaluateResumeRequest {
  user_id: string
  resume_id: number
  candidate_name: string
  phone: string
  jd_text: string
  jd_keywords?: string[]
}

export interface RadarMetric {
  name: string
  max: number
  value: number
}

export interface EvidenceSource {
  sourceId: string
  snippet: string
}

export interface AssessmentItem {
  text: string
  sourceIds: string[]
}

export interface AssessmentReport {
  summary: string
  summarySourceIds: string[]
  highlights: AssessmentItem[]
  risks: AssessmentItem[]
  matchScore: number
  title: string
  radarMetrics: RadarMetric[]
  sources: EvidenceSource[]
}

export interface ResumeCandidate {
  id: number
  name: string
  fileName: string
  phone: string
  status: ResumeStatus
  uploadMessage: string
}

export interface ChatRequest {
  user_id: string
  text: string
  role: 'user' | 'ai'
  candidate_name?: string
  resume_id?: number
}

export interface ChatEventChunk {
  type: 'chunk'
  content: string
}

export interface ChatEventSuggestions {
  type: 'suggestions'
  items: string[]
}

export interface ChatEventSources {
  type: 'sources'
  items: Array<{
    source_id: string
    snippet: string
  }>
}

export interface ChatEventError {
  type: 'error'
  message: string
}

export interface ChatEventDone {
  type: 'done'
}

export type ChatStreamEvent = ChatEventChunk | ChatEventSuggestions | ChatEventSources | ChatEventError | ChatEventDone

export interface EvaluationStreamPhaseEvent {
  type: 'phase'
  phase: 'preparing' | 'sources' | 'scoring' | 'radar' | 'summary' | 'highlights' | 'risks' | 'finalizing'
}

export interface EvaluationStreamSourcesEvent {
  type: 'sources'
  sources: Array<{
    source_id: string
    snippet: string
  }>
}

export interface EvaluationStreamScoreEvent {
  type: 'score'
  match_score: number
  title: string
}

export interface EvaluationStreamRadarEvent {
  type: 'radar_metrics'
  radar_metrics: RadarMetric[]
}

export interface EvaluationStreamSummaryEvent {
  type: 'summary'
  summary: string
  summary_source_ids: string[]
}

export interface EvaluationStreamHighlightsEvent {
  type: 'highlights'
  highlights: Array<{
    text: string
    source_ids: string[]
  }>
}

export interface EvaluationStreamRisksEvent {
  type: 'risks'
  risks: Array<{
    text: string
    source_ids: string[]
  }>
}

export interface EvaluationStreamResultEvent {
  type: 'result'
  evaluation: unknown
}

export interface EvaluationStreamErrorEvent {
  type: 'error'
  message: string
}

export interface EvaluationStreamDoneEvent {
  type: 'done'
}

export type EvaluationStreamEvent =
  | EvaluationStreamPhaseEvent
  | EvaluationStreamSourcesEvent
  | EvaluationStreamScoreEvent
  | EvaluationStreamRadarEvent
  | EvaluationStreamSummaryEvent
  | EvaluationStreamHighlightsEvent
  | EvaluationStreamRisksEvent
  | EvaluationStreamResultEvent
  | EvaluationStreamErrorEvent
  | EvaluationStreamDoneEvent

export interface FollowUpMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  sources: EvidenceSource[]
}

export interface FollowUpCard {
  question: string
  answer: string
  sources: EvidenceSource[]
}

export type InterviewStreamPhase = 'preparing' | 'generating'

export type InterviewQuestionCategory =
  | 'technical_depth'
  | 'ownership'
  | 'problem_solving'
  | 'communication'
  | 'risk_check'

export type InterviewVerdict = 'passed' | 'pending' | 'rejected'

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'recognizing' | 'denied' | 'unsupported' | 'error'

export interface InterviewQuestion {
  questionId: string
  category: InterviewQuestionCategory
  question: string
  intent: string
  sourceIds: string[]
}

export interface InterviewAnswerDraft {
  questionId: string
  question: string
  category: InterviewQuestionCategory
  answer: string
}

export interface InterviewStartRequest {
  user_id: string
  resume_id: number
  candidate_name: string
  phone: string
  interview_identity: string
  jd_text: string
  jd_keywords?: string[]
}

export interface InterviewQuestionResult {
  questionId: string
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface InterviewSubmitRequest {
  user_id: string
  resume_id: number
  candidate_name: string
  phone: string
  interview_identity: string
  session_id?: string
  jd_text: string
  jd_keywords?: string[]
  answers: InterviewAnswerDraft[]
}

export interface InterviewSubmitResult {
  totalScore: number
  verdict: InterviewVerdict
  overallFeedback: string
  strengths: string[]
  risks: string[]
  questionResults: InterviewQuestionResult[]
}

export interface InterviewHistoryItem {
  sessionId: string
  interviewIdentity: string
  candidateName: string
  verdict: string
  totalScore: number
  createdAt: string
}

export interface InterviewHistoryResponse {
  items: InterviewHistoryItem[]
}

export interface InterviewSessionDetail {
  sessionId: string
  interviewIdentity: string
  candidateName: string
  status: string
  questions: InterviewQuestion[]
  answers: InterviewAnswerDraft[]
  result: InterviewSubmitResult | null
  createdAt: string
  updatedAt: string
}

export interface InterviewStreamPhaseEvent {
  type: 'phase'
  phase: InterviewStreamPhase
}

export interface InterviewStreamQuestionEvent {
  type: 'question'
  question: {
    question_id: string
    category: InterviewQuestionCategory
    question: string
    intent: string
    source_ids: string[]
  }
}

export interface InterviewStreamSessionEvent {
  type: 'session'
  session_id: string
}

export interface InterviewStreamErrorEvent {
  type: 'error'
  message: string
}

export interface InterviewStreamDoneEvent {
  type: 'done'
}

export type InterviewStreamEvent =
  | InterviewStreamPhaseEvent
  | InterviewStreamSessionEvent
  | InterviewStreamQuestionEvent
  | InterviewStreamErrorEvent
  | InterviewStreamDoneEvent
