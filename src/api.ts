import type {
  ChatRequest,
  EvaluateResumeRequest,
  JobDescriptionAnalysisRequest,
  JobDescriptionAnalysisResponse,
  OCRResponse,
  ResumeListResponse,
  UploadResumeForm,
  UploadResumeResponse,
} from './types/resume-agent'

export async function analyzeJobDescription(
  payload: JobDescriptionAnalysisRequest,
): Promise<JobDescriptionAnalysisResponse> {
  const response = await fetch('/api/analyze_jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jd_text: payload.text,
      target_seniority: payload.targetSeniority,
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
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
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function ocrJobDescriptionImage(file: File): Promise<OCRResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/ocr_jd_image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function fetchResumes(userId: string): Promise<ResumeListResponse> {
  const response = await fetch(`/api/resumes?user_id=${encodeURIComponent(userId)}`)
  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response.json()
}

export async function deleteResume(resumeId: number, userId: string): Promise<void> {
  const response = await fetch(`/api/resumes/${resumeId}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(await response.text())
  }
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

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}
