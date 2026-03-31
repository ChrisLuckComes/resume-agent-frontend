import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  DEFAULT_USER_CONTEXT,
  RESUME_LIMIT,
} from '../constants/resume-agent'
import {
  analyzeJobDescription as analyzeJobDescriptionRequest,
  chatWithAI,
  deleteResume as deleteResumeRequest,
  evaluateResume,
  fetchResumes,
  ocrJobDescriptionImage,
  uploadResume,
} from '../api'
import type {
  AssessmentReport,
  ChatStreamEvent,
  FollowUpCard,
  FollowUpMessage,
  ResumeListItem,
  ResumeCandidate,
  WorkbenchPhase,
} from '../types/resume-agent'
import {
  buildEvaluationPlaceholder,
  buildFollowUpContext,
  normalizeAssessmentReport,
  normalizeKeywords,
  sanitizeCandidateName,
} from '../utils/workbench'
import { translate } from '../i18n'

let temporaryResumeId = -1

export const useWorkbenchStore = defineStore('workbench', () => {
  const userContext = ref(DEFAULT_USER_CONTEXT)
  const jdText = ref('')
  const jdKeywords = ref<string[]>([])
  const resumes = ref<ResumeCandidate[]>([])
  const selectedResumeId = ref<number | null>(null)
  const report = ref<AssessmentReport>(buildEvaluationPlaceholder())
  const followUpDraft = ref('')
  const followUpSuggestions = ref<string[]>([])
  const followUpMessages = ref<FollowUpMessage[]>([])
  const lastFollowUp = ref<FollowUpCard | null>(null)
  const errorMessage = ref('')
  const resumeListStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const analyzeStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const ocrStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const uploadStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const evaluationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const followUpStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

  const selectedResume = computed(() => resumes.value.find((resume) => resume.id === selectedResumeId.value) ?? null)
  const hasAssessment = computed(() => evaluationStatus.value === 'success' && selectedResume.value !== null)
  const workbenchPhase = computed<WorkbenchPhase>(() => {
    if (evaluationStatus.value === 'loading') {
      return 'evaluatingResume'
    }

    if (hasAssessment.value) {
      return 'completed'
    }

    if (analyzeStatus.value === 'loading') {
      return 'analyzingJD'
    }

    if (jdKeywords.value.length > 0 && resumes.value.length === 0) {
      return 'waitingResume'
    }

    return 'ready'
  })

  async function analyzeJobDescription() {
    const trimmedText = jdText.value.trim()
    if (!trimmedText) {
      errorMessage.value = translate('workbench.error.provideJDFirst')
      analyzeStatus.value = 'error'
      return
    }

    analyzeStatus.value = 'loading'
    errorMessage.value = ''

    try {
      const response = await analyzeJobDescriptionRequest({
        text: trimmedText,
      })
      jdKeywords.value = normalizeKeywords(response)
      analyzeStatus.value = 'success'
    } catch (error) {
      jdKeywords.value = []
      analyzeStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : translate('workbench.error.analyzeFailed')
      return
    }

    if (selectedResume.value) {
      await evaluateSelectedResume(selectedResume.value.id)
    }
  }

  async function uploadResumeFile(file: File) {
    if (resumes.value.length >= RESUME_LIMIT) {
      errorMessage.value = translate('workbench.error.resumeLimit', { count: RESUME_LIMIT })
      uploadStatus.value = 'error'
      return
    }

    const candidateName = sanitizeCandidateName(file.name)
    const optimisticCandidate: ResumeCandidate = {
      id: temporaryResumeId,
      name: candidateName,
      fileName: file.name,
      phone: userContext.value.phone,
      status: 'pending',
      uploadMessage: translate('resume.status.uploading'),
    }

    temporaryResumeId -= 1
    resumes.value = [optimisticCandidate, ...resumes.value]
    uploadStatus.value = 'loading'
    errorMessage.value = ''

    try {
      const response = await uploadResume({
        file,
        candidate_name: candidateName,
        phone: userContext.value.phone,
        user_id: userContext.value.userId,
      })

      resumes.value = resumes.value.map((resume) =>
        resume.id === optimisticCandidate.id
          ? {
              ...resume,
              id: response.resume_id,
              status: mapResumeStatus(response.status),
              uploadMessage: response.message || translate('workbench.error.resumeReady'),
            }
          : resume,
      )
      uploadStatus.value = 'success'
    } catch (error) {
      const message = error instanceof Error ? error.message : translate('workbench.error.uploadFailed')
      resumes.value = resumes.value.map((resume) =>
        resume.id === optimisticCandidate.id
          ? {
              ...resume,
              status: 'error',
              uploadMessage: message,
            }
          : resume,
      )
      uploadStatus.value = 'error'
      errorMessage.value = message
    }
  }

  async function ocrJDImage(file: File) {
    ocrStatus.value = 'loading'
    errorMessage.value = ''

    try {
      const response = await ocrJobDescriptionImage(file)
      jdText.value = [jdText.value.trim(), response.text.trim()].filter(Boolean).join('\n\n')
      ocrStatus.value = 'success'
    } catch (error) {
      ocrStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : translate('workbench.error.ocrFailed')
    }
  }

  async function removeResume(resumeId: number) {
    const resume = resumes.value.find((item) => item.id === resumeId) ?? null
    if (!resume) {
      return
    }

    if (resumeId < 0) {
      removeResumeLocally(resumeId)
      return
    }

    try {
      await deleteResumeRequest(resumeId, userContext.value.userId)
    } catch (error) {
      if (resume.status !== 'error') {
        throw error
      }
    }

    removeResumeLocally(resumeId)
  }

  function removeResumeLocally(resumeId: number) {
    resumes.value = resumes.value.filter((resume) => resume.id !== resumeId)

    if (selectedResumeId.value === resumeId) {
      selectedResumeId.value = null
      report.value = buildEvaluationPlaceholder()
      evaluationStatus.value = 'idle'
      followUpMessages.value = []
      lastFollowUp.value = null
    }
  }

  function hydrateResumes() {
    if (resumeListStatus.value === 'loading') {
      return
    }

    resumeListStatus.value = 'loading'
    void fetchResumes(userContext.value.userId)
      .then((response) => {
        resumes.value = response.items.map(mapResumeListItem)
        resumeListStatus.value = 'success'
      })
      .catch((error) => {
        resumeListStatus.value = 'error'
        errorMessage.value = error instanceof Error ? error.message : translate('workbench.error.resumeListFailed')
      })
  }

  async function selectResume(resumeId: number) {
    const nextResume = resumes.value.find((resume) => resume.id === resumeId)
    if (!nextResume) {
      return
    }

    selectedResumeId.value = resumeId

    if (!jdText.value.trim()) {
      errorMessage.value = translate('workbench.error.analyzeJDFirst')
      return
    }

    await evaluateSelectedResume(resumeId)
  }

  function setFollowUpDraft(value: string) {
    followUpDraft.value = value
  }

  async function sendFollowUpQuestion(question?: string) {
    const prompt = (question ?? followUpDraft.value).trim()
    if (!prompt || !selectedResume.value) {
      return
    }

    followUpDraft.value = ''
    followUpStatus.value = 'loading'
    const userMessage: FollowUpMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt,
    }
    const aiMessage: FollowUpMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: '',
    }

    lastFollowUp.value = null
    followUpMessages.value.push(userMessage, aiMessage)

    try {
      const response = await chatWithAI({
        user_id: userContext.value.userId,
        candidate_name: selectedResume.value.name,
        role: 'user',
        resume_id: selectedResume.value.id,
        text: `${buildFollowUpContext(selectedResume.value.name, jdKeywords.value)}\n${translate('workbench.prompt.question', { prompt })}`,
      })

      if (!response.body) {
        throw new Error(translate('workbench.error.noStream'))
      }

      const reader = response.body.getReader()
      let collectedText = ''
      let isDone = false

      while (!isDone) {
        const { value, done } = await reader.read()
        isDone = done

        if (!value) {
          continue
        }

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split(/\r?\n/)
        for (const line of lines) {
          if (!line.startsWith('data:')) {
            continue
          }

          const content = line.slice(5).trim()
          if (!content) {
            continue
          }

          const event = parseChatEvent(content)
          if (!event) {
            continue
          }

          if (event.type === 'chunk') {
            collectedText += event.content
          }

          if (event.type === 'suggestions') {
            followUpSuggestions.value = event.items
          }

          if (event.type === 'error') {
            throw new Error(event.message)
          }
        }

        aiMessage.text = collectedText
        followUpMessages.value = [...followUpMessages.value]
      }

      lastFollowUp.value = {
        question: prompt,
        answer: collectedText || translate('workbench.error.noAnswer'),
      }
      followUpStatus.value = 'success'
    } catch (error) {
      const message = error instanceof Error ? error.message : translate('workbench.error.followUpFailed')
      aiMessage.text = message
      followUpMessages.value = [...followUpMessages.value]
      followUpStatus.value = 'error'
      errorMessage.value = message
    }
  }

  async function evaluateSelectedResume(resumeId: number) {
    const candidate = resumes.value.find((resume) => resume.id === resumeId) ?? null
    if (!candidate) {
      return
    }

    evaluationStatus.value = 'loading'
    errorMessage.value = ''

    try {
      const response = await evaluateResume({
        user_id: userContext.value.userId,
        resume_id: candidate.id,
        candidate_name: candidate.name,
        phone: candidate.phone,
        jd_text: jdText.value,
        jd_keywords: jdKeywords.value,
      })
      report.value = normalizeAssessmentReport(response, jdKeywords.value, candidate)
      evaluationStatus.value = 'success'
    } catch (error) {
      report.value = normalizeAssessmentReport({}, jdKeywords.value, candidate)
      evaluationStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : translate('workbench.error.assessmentFailed')
    }
  }

  return {
    userContext,
    jdText,
    jdKeywords,
    resumes,
    selectedResumeId,
    selectedResume,
    report,
    followUpDraft,
    followUpSuggestions,
    followUpMessages,
    lastFollowUp,
    errorMessage,
    resumeListStatus,
    analyzeStatus,
    ocrStatus,
    uploadStatus,
    evaluationStatus,
    followUpStatus,
    hasAssessment,
    workbenchPhase,
    hydrateResumes,
    analyzeJobDescription,
    ocrJDImage,
    uploadResumeFile,
    removeResume,
    selectResume,
    setFollowUpDraft,
    sendFollowUpQuestion,
  }
})

function mapResumeStatus(status: string): ResumeCandidate['status'] {
  if (status === 'completed') {
    return 'ready'
  }
  if (status === 'failed') {
    return 'error'
  }
  return 'pending'
}

function mapResumeListItem(item: ResumeListItem): ResumeCandidate {
  return {
    id: item.resume_id,
    name: item.candidate_name,
    fileName: item.candidate_name,
    phone: item.phone,
    status: mapResumeStatus(item.status),
    uploadMessage: item.updated_at,
  }
}

function parseChatEvent(content: string): ChatStreamEvent | null {
  try {
    return JSON.parse(content) as ChatStreamEvent
  } catch {
    return null
  }
}
