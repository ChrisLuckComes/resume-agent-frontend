// resume-agent 前后端接口定义
// 所有与后端交互的 API 类型和方法

// 上传简历请求参数（表单）
export interface UploadResumeForm {
  file: File
  candidate_name: string
  phone: string
  user_id: string
}

// 上传简历响应结构
export interface UploadResumeResponse {
  message: string
  resume_id: number
  status: string // "pending" 等
}

// 聊天请求体
export interface ChatRequest {
  user_id: string
  text: string
  role: 'user' | 'ai'
}

// 聊天响应结构
export interface ChatResponse {
  reply: string
}

// 上传简历 API
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

// 聊天流式 API（fetch + ReadableStream）
export async function chatWithAI(req: ChatRequest): Promise<Response> {
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}
