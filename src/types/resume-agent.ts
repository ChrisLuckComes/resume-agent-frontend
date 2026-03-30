export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export type ResumeStatus = 'pending' | 'ready' | 'error'

export type WorkbenchPhase =
  | 'ready'
  | 'analyzingJD'
  | 'waitingResume'
  | 'evaluatingResume'
  | 'completed'

export interface SelectOption {
  labelKey: string
  value: string
}

export interface UserContext {
  userId: string
  phone: string
}

export interface JobDescriptionAnalysisRequest {
  text: string
  targetSeniority?: string
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
  target_seniority: string
  jd_keywords?: string[]
}

export interface RadarMetric {
  name: string
  max: number
  value: number
}

export interface AssessmentReport {
  summary: string
  highlights: string[]
  risks: string[]
  matchScore: number
  title: string
  radarMetrics: RadarMetric[]
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

export interface ChatEventError {
  type: 'error'
  message: string
}

export interface ChatEventDone {
  type: 'done'
}

export type ChatStreamEvent = ChatEventChunk | ChatEventSuggestions | ChatEventError | ChatEventDone

export interface FollowUpMessage {
  id: string
  role: 'user' | 'ai'
  text: string
}

export interface FollowUpCard {
  question: string
  answer: string
}
