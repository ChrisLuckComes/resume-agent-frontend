import type {
  ChatRequest,
  EvaluateResumeRequest,
  InterviewStartRequest,
  InterviewHistoryResponse,
  InterviewSessionDetail,
  InterviewSubmitRequest,
  InterviewSubmitResult,
  JobDescriptionAnalysisRequest,
  JobDescriptionAnalysisResponse,
  OCRResponse,
  ResumeListResponse,
  UploadResumeForm,
  UploadResumeResponse,
} from './types/resume-agent'
import { ensureOk, parseJsonResponse } from './api/request'

export async function analyzeJobDescription(
  payload: JobDescriptionAnalysisRequest,
): Promise<JobDescriptionAnalysisResponse> {
  const response = await fetch('/api/analyze_jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jd_text: payload.text,
    }),
  })

  return parseJsonResponse<JobDescriptionAnalysisResponse>(response)
}

export async function uploadResume(form: UploadResumeForm): Promise<UploadResumeResponse> {
  const formData = new FormData()
  formData.append('file', form.file)
  formData.append('candidate_name', form.candidate_name)
  formData.append('phone', form.phone)
  formData.append('user_id', form.user_id)
  const resp = await fetch('/api/upload_resume', {
    method: 'POST',
    body: formData,
  })
  return parseJsonResponse<UploadResumeResponse>(resp)
}

export async function ocrJobDescriptionImage(file: File): Promise<OCRResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/ocr_jd_image', {
    method: 'POST',
    body: formData,
  })
  return parseJsonResponse<OCRResponse>(response)
}

export async function fetchResumes(userId: string): Promise<ResumeListResponse> {
  const response = await fetch(`/api/resumes?user_id=${encodeURIComponent(userId)}`)
  return parseJsonResponse<ResumeListResponse>(response)
}

export async function deleteResume(resumeId: number, userId: string): Promise<void> {
  const response = await fetch(`/api/resumes/${resumeId}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
  await ensureOk(response)
}

export async function chatWithAI(req: ChatRequest): Promise<Response> {
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}

export async function evaluateResume(payload: EvaluateResumeRequest): Promise<unknown> {
  const response = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse<unknown>(response)
}

export async function evaluateResumeStream(payload: EvaluateResumeRequest): Promise<Response> {
  const response = await fetch('/api/evaluate_stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return ensureOk(response)
}

export async function startInterviewStream(payload: InterviewStartRequest): Promise<Response> {
  const response = await fetch('/api/interview/start_stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return ensureOk(response)
}

export async function submitInterviewAnswers(payload: InterviewSubmitRequest): Promise<InterviewSubmitResult> {
  const response = await fetch('/api/interview/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      answers: payload.answers.map((answer) => ({
        question_id: answer.questionId,
        question: answer.question,
        category: answer.category,
        answer: answer.answer,
      })),
    }),
  })

  return parseJsonResponse<InterviewSubmitResult>(response)
}

export async function fetchInterviewHistory(payload: {
  user_id: string
  interview_identity: string
  resume_id?: number
}): Promise<InterviewHistoryResponse> {
  const response = await fetch('/api/interview/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse<InterviewHistoryResponse>(response)
}

export async function fetchInterviewHistoryDetail(sessionId: string, userId: string): Promise<InterviewSessionDetail> {
  const response = await fetch(`/api/interview/history/${encodeURIComponent(sessionId)}?user_id=${encodeURIComponent(userId)}`)
  return parseJsonResponse<InterviewSessionDetail>(response)
}
