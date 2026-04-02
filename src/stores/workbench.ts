import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  INTERVIEW_IDENTITY_PREFIX,
  INTERVIEW_IDENTITY_STORAGE_KEY,
} from '../constants/interview'
import {
  DEFAULT_USER_CONTEXT,
  RESUME_LIMIT,
  USER_CONTEXT_STORAGE_KEYS,
} from '../constants/resume-agent'
import {
  analyzeJobDescription as analyzeJobDescriptionRequest,
  chatWithAI,
  deleteResume as deleteResumeRequest,
  evaluateResumeStream,
  fetchInterviewHistoryDetail,
  fetchInterviewHistory,
  fetchResumes,
  ocrJobDescriptionImage,
  startInterviewStream,
  submitInterviewAnswers,
  uploadResume,
} from '../api'
import type {
  AssessmentReport,
  ChatStreamEvent,
  EvidenceSource,
  EvaluationStreamEvent,
  FollowUpCard,
  FollowUpMessage,
  InterviewAnswerDraft,
  InterviewHistoryItem,
  InterviewQuestion,
  InterviewSessionDetail,
  InterviewStreamEvent,
  InterviewSubmitResult,
  SpeechRecognitionStatus,
  ResumeListItem,
  ResumeCandidate,
  WorkbenchPhase,
} from '../types/resume-agent'
import {
  buildEvaluationPlaceholder,
  buildFollowUpContext,
  mergeAssessmentStreamEvent,
  normalizeChatSources,
  normalizeAssessmentReport,
  normalizeInterviewHistory,
  normalizeInterviewQuestion,
  normalizeInterviewSessionDetail,
  normalizeInterviewSubmitResult,
  normalizeKeywords,
  buildCandidatePhone,
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
  const interviewStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const interviewSubmitStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const evaluationPhase = ref<'idle' | 'preparing' | 'sources' | 'scoring' | 'radar' | 'summary' | 'highlights' | 'risks' | 'finalizing'>('idle')
  const interviewModalOpen = ref(false)
  const interviewPhase = ref<'idle' | 'preparing' | 'generating'>('idle')
  const interviewQuestions = ref<InterviewQuestion[]>([])
  const interviewAnswers = ref<Record<string, InterviewAnswerDraft>>({})
  const interviewResult = ref<InterviewSubmitResult | null>(null)
  const interviewSessionId = ref('')
  const interviewIdentity = ref('')
  const interviewIdentityDraft = ref('')
  const interviewHistory = ref<InterviewHistoryItem[]>([])
  const interviewHistoryDetail = ref<InterviewSessionDetail | null>(null)
  const interviewErrorMessage = ref('')
  const activeVoiceQuestionId = ref<string | null>(null)
  const voiceStatusByQuestion = ref<Record<string, SpeechRecognitionStatus>>({})

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
      phone: buildCandidatePhone(file.name, userContext.value.phone),
      status: 'pending',
      uploadMessage: translate('resume.status.uploading'),
    }

    temporaryResumeId -= 1
    resumes.value = [
      optimisticCandidate,
      ...resumes.value.filter((resume) => resume.phone !== optimisticCandidate.phone),
    ]
    uploadStatus.value = 'loading'
    errorMessage.value = ''

    try {
      const response = await uploadResume({
        file,
        candidate_name: candidateName,
        phone: optimisticCandidate.phone,
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
      resetInterviewState()
    }
  }

  function hydrateResumes() {
    hydrateUserContext()

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
      sources: [],
    }
    const aiMessage: FollowUpMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: '',
      sources: [],
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
      let collectedSources: EvidenceSource[] = []
      let isDone = false
      const decoder = new TextDecoder()
      let streamBuffer = ''

      while (!isDone) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }

        if (!value) {
          continue
        }

        streamBuffer += decoder.decode(value, { stream: true })
        const segments = streamBuffer.split(/\r?\n\r?\n/)
        streamBuffer = segments.pop() ?? ''

        for (const segment of segments) {
          const event = parseChatSseEvent(segment)
          if (!event) {
            continue
          }

          if (event.type === 'chunk') {
            collectedText += event.content
          }

          if (event.type === 'suggestions') {
            followUpSuggestions.value = event.items
          }

          if (event.type === 'sources') {
            collectedSources = normalizeChatSources(event.items)
          }

          if (event.type === 'error') {
            throw new Error(event.message)
          }

          if (event.type === 'done') {
            isDone = true
          }
        }

        aiMessage.text = collectedText
        aiMessage.sources = collectedSources
        followUpMessages.value = [...followUpMessages.value]
      }

      const trailingEvent = parseChatSseEvent(streamBuffer)
      if (trailingEvent?.type === 'sources') {
        collectedSources = normalizeChatSources(trailingEvent.items)
      }

      aiMessage.text = collectedText
      aiMessage.sources = collectedSources
      followUpMessages.value = [...followUpMessages.value]

      lastFollowUp.value = {
        question: prompt,
        answer: collectedText || translate('workbench.error.noAnswer'),
        sources: collectedSources,
      }
      followUpStatus.value = 'success'
    } catch (error) {
      const message = error instanceof Error ? error.message : translate('workbench.error.followUpFailed')
      aiMessage.text = message
      aiMessage.sources = []
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
    if (jdKeywords.value.length === 0) {
      evaluationStatus.value = 'error'
      evaluationPhase.value = 'idle'
      errorMessage.value = translate('workbench.error.analyzeJDFirst')
      report.value = buildEvaluationPlaceholder()
      return
    }

    evaluationStatus.value = 'loading'
    evaluationPhase.value = 'preparing'
    errorMessage.value = ''
    report.value = buildEvaluationPlaceholder()

    try {
      resetInterviewState()
      const response = await evaluateResumeStream({
        user_id: userContext.value.userId,
        resume_id: candidate.id,
        candidate_name: candidate.name,
        phone: candidate.phone,
        jd_text: jdText.value,
        jd_keywords: jdKeywords.value,
      })

      if (!response.body) {
        throw new Error(translate('workbench.error.noStream'))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let streamBuffer = ''
      let streamDone = false

      while (!streamDone) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }

        if (!value) {
          continue
        }

        streamBuffer += decoder.decode(value, { stream: true })
        const segments = streamBuffer.split(/\r?\n\r?\n/)
        streamBuffer = segments.pop() ?? ''

        for (const segment of segments) {
          const event = parseEvaluationSseEvent(segment)
          if (!event) {
            continue
          }

          if (event.type === 'error') {
            throw new Error(event.message)
          }

          if (event.type === 'phase') {
            evaluationPhase.value = event.phase
          }

          if (event.type === 'result') {
            report.value = normalizeAssessmentReport(event.evaluation, jdKeywords.value, candidate)
          } else {
            report.value = mergeAssessmentStreamEvent(report.value, event)
          }

          if (event.type === 'done') {
            streamDone = true
          }
        }
      }

      evaluationStatus.value = 'success'
      evaluationPhase.value = 'idle'
    } catch (error) {
      report.value = normalizeAssessmentReport({}, jdKeywords.value, candidate)
      evaluationStatus.value = 'error'
      evaluationPhase.value = 'idle'
      errorMessage.value = error instanceof Error ? error.message : translate('workbench.error.assessmentFailed')
    }
  }

  function openInterviewModal() {
    if (!selectedResume.value || evaluationStatus.value !== 'success') {
      return
    }

    interviewModalOpen.value = true
    ensureInterviewIdentity()
    if (!interviewIdentity.value.trim()) {
      interviewIdentityDraft.value = interviewIdentity.value
      return
    }
    if (interviewQuestions.value.length === 0) {
      void loadInterviewQuestions()
    }
    void loadInterviewHistory()
  }

  function closeInterviewModal() {
    interviewModalOpen.value = false
    activeVoiceQuestionId.value = null
  }

  async function loadInterviewQuestions() {
    if (!selectedResume.value) {
      return
    }
    if (!interviewIdentity.value.trim()) {
      interviewErrorMessage.value = translate('interview.error.identityRequired')
      return
    }

    interviewStatus.value = 'loading'
    interviewPhase.value = 'preparing'
    interviewErrorMessage.value = ''
    interviewQuestions.value = []
    interviewAnswers.value = {}
    interviewResult.value = null

    try {
      const response = await startInterviewStream({
        user_id: userContext.value.userId,
        resume_id: selectedResume.value.id,
        candidate_name: selectedResume.value.name,
        phone: selectedResume.value.phone,
        interview_identity: interviewIdentity.value,
        jd_text: jdText.value,
        jd_keywords: jdKeywords.value,
      })

      if (!response.body) {
        throw new Error(translate('workbench.error.noStream'))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let streamBuffer = ''
      let streamDone = false

      while (!streamDone) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        if (!value) {
          continue
        }

        streamBuffer += decoder.decode(value, { stream: true })
        const segments = streamBuffer.split(/\r?\n\r?\n/)
        streamBuffer = segments.pop() ?? ''

        for (const segment of segments) {
          const event = parseInterviewSseEvent(segment)
          if (!event) {
            continue
          }

          if (event.type === 'error') {
            throw new Error(event.message)
          }

          if (event.type === 'phase') {
            interviewPhase.value = event.phase
          }

          if (event.type === 'session') {
            interviewSessionId.value = event.session_id
          }

          if (event.type === 'question') {
            const question = normalizeInterviewQuestion(event.question)
            if (question) {
              interviewQuestions.value = [...interviewQuestions.value, question]
              interviewAnswers.value = {
                ...interviewAnswers.value,
                [question.questionId]: {
                  questionId: question.questionId,
                  question: question.question,
                  category: question.category,
                  answer: '',
                },
              }
              voiceStatusByQuestion.value = {
                ...voiceStatusByQuestion.value,
                [question.questionId]: 'idle',
              }
            }
          }

          if (event.type === 'done') {
            streamDone = true
          }
        }
      }

      interviewStatus.value = 'success'
      interviewPhase.value = 'idle'
    } catch (error) {
      interviewStatus.value = 'error'
      interviewPhase.value = 'idle'
      interviewErrorMessage.value = error instanceof Error ? error.message : translate('interview.error.loadFailed')
    }
  }

  function setInterviewAnswer(questionId: string, value: string) {
    const current = interviewAnswers.value[questionId]
    if (!current) {
      return
    }

    interviewAnswers.value = {
      ...interviewAnswers.value,
      [questionId]: {
        ...current,
        answer: value,
      },
    }
  }

  function appendInterviewAnswer(questionId: string, value: string) {
    const current = interviewAnswers.value[questionId]
    if (!current) {
      return
    }

    const nextAnswer = [current.answer.trim(), value.trim()].filter(Boolean).join(current.answer.trim() ? '\n' : '')
    setInterviewAnswer(questionId, nextAnswer)
  }

  function setVoiceStatus(questionId: string, status: SpeechRecognitionStatus) {
    voiceStatusByQuestion.value = {
      ...voiceStatusByQuestion.value,
      [questionId]: status,
    }
  }

  async function submitInterview() {
    if (!selectedResume.value) {
      return
    }
    if (!interviewIdentity.value.trim()) {
      interviewSubmitStatus.value = 'error'
      interviewErrorMessage.value = translate('interview.error.identityRequired')
      return
    }

    const answers = interviewQuestions.value
      .map((question) => interviewAnswers.value[question.questionId])
      .filter((item): item is InterviewAnswerDraft => item !== undefined)
    if (answers.length !== 10 || answers.some((item) => !item.answer.trim())) {
      interviewSubmitStatus.value = 'error'
      interviewErrorMessage.value = translate('interview.error.completeAllAnswers')
      return
    }

    interviewSubmitStatus.value = 'loading'
    interviewErrorMessage.value = ''

    try {
      const response = await submitInterviewAnswers({
        user_id: userContext.value.userId,
        resume_id: selectedResume.value.id,
        candidate_name: selectedResume.value.name,
        phone: selectedResume.value.phone,
        interview_identity: interviewIdentity.value,
        session_id: interviewSessionId.value || undefined,
        jd_text: jdText.value,
        jd_keywords: jdKeywords.value,
        answers,
      })
      interviewResult.value = normalizeInterviewSubmitResult(response)
      interviewSubmitStatus.value = 'success'
      void loadInterviewHistory()
    } catch (error) {
      interviewSubmitStatus.value = 'error'
      interviewErrorMessage.value = error instanceof Error ? error.message : translate('interview.error.submitFailed')
    }
  }

  function resetInterviewState() {
    interviewModalOpen.value = false
    interviewStatus.value = 'idle'
    interviewSubmitStatus.value = 'idle'
    interviewPhase.value = 'idle'
    interviewQuestions.value = []
    interviewAnswers.value = {}
    interviewResult.value = null
    interviewSessionId.value = ''
    interviewHistoryDetail.value = null
    interviewErrorMessage.value = ''
    activeVoiceQuestionId.value = null
    voiceStatusByQuestion.value = {}
  }

  function setInterviewIdentityDraft(value: string) {
    interviewIdentityDraft.value = value
  }

  function hydrateUserContext() {
    if (typeof window === 'undefined') {
      return
    }

    const storedUserId = window.localStorage.getItem(USER_CONTEXT_STORAGE_KEYS.userId)?.trim() ?? ''
    const storedPhone = window.localStorage.getItem(USER_CONTEXT_STORAGE_KEYS.phone)?.trim() ?? ''
    userContext.value = {
      userId: storedUserId || DEFAULT_USER_CONTEXT.userId,
      phone: storedPhone || DEFAULT_USER_CONTEXT.phone,
    }
  }

  function ensureInterviewIdentity() {
    if (interviewIdentity.value.trim()) {
      return
    }

    const savedIdentity = typeof window !== 'undefined'
      ? window.localStorage.getItem(INTERVIEW_IDENTITY_STORAGE_KEY)?.trim() ?? ''
      : ''
    const nextIdentity = savedIdentity || buildDefaultInterviewIdentity(userContext.value.userId)
    interviewIdentity.value = nextIdentity
    interviewIdentityDraft.value = nextIdentity
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INTERVIEW_IDENTITY_STORAGE_KEY, nextIdentity)
    }
  }

  async function confirmInterviewIdentity() {
    const normalizedIdentity = interviewIdentityDraft.value.trim()
    if (!normalizedIdentity) {
      interviewErrorMessage.value = translate('interview.error.identityRequired')
      return
    }

    interviewIdentity.value = normalizedIdentity
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INTERVIEW_IDENTITY_STORAGE_KEY, normalizedIdentity)
    }
    interviewErrorMessage.value = ''
    await loadInterviewQuestions()
    await loadInterviewHistory()
  }

  async function loadInterviewHistory() {
    if (!selectedResume.value || !interviewIdentity.value.trim()) {
      interviewHistory.value = []
      return
    }

    try {
      const response = await fetchInterviewHistory({
        user_id: userContext.value.userId,
        interview_identity: interviewIdentity.value,
        resume_id: selectedResume.value.id,
      })
      interviewHistory.value = normalizeInterviewHistory(response).items
    } catch {
      interviewHistory.value = []
    }
  }

  async function loadInterviewHistoryDetail(sessionId: string) {
    try {
      const response = await fetchInterviewHistoryDetail(sessionId, userContext.value.userId)
      interviewHistoryDetail.value = normalizeInterviewSessionDetail(response)
    } catch {
      interviewHistoryDetail.value = null
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
    evaluationPhase,
    followUpStatus,
    interviewStatus,
    interviewSubmitStatus,
    interviewModalOpen,
    interviewPhase,
    interviewQuestions,
    interviewAnswers,
    interviewResult,
    interviewSessionId,
    interviewIdentity,
    interviewIdentityDraft,
    interviewHistory,
    interviewHistoryDetail,
    interviewErrorMessage,
    activeVoiceQuestionId,
    voiceStatusByQuestion,
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
    openInterviewModal,
    closeInterviewModal,
    loadInterviewQuestions,
    setInterviewAnswer,
    appendInterviewAnswer,
    setVoiceStatus,
    submitInterview,
    resetInterviewState,
    setInterviewIdentityDraft,
    confirmInterviewIdentity,
    loadInterviewHistory,
    loadInterviewHistoryDetail,
    ensureInterviewIdentity,
    hydrateUserContext,
  }
})

function buildDefaultInterviewIdentity(userId: string): string {
  const date = new Date()
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const normalizedUserId = userId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || INTERVIEW_IDENTITY_PREFIX
  return `${normalizedUserId}-${stamp}`
}

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

function parseEvaluationEvent(content: string): EvaluationStreamEvent | null {
  try {
    return JSON.parse(content) as EvaluationStreamEvent
  } catch {
    return null
  }
}

function parseChatSseEvent(segment: string): ChatStreamEvent | null {
  const content = segment
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('')

  if (!content) {
    return null
  }

  return parseChatEvent(content)
}

function parseEvaluationSseEvent(segment: string): EvaluationStreamEvent | null {
  const content = segment
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('')

  if (!content) {
    return null
  }

  return parseEvaluationEvent(content)
}

function parseInterviewEvent(content: string): InterviewStreamEvent | null {
  try {
    return JSON.parse(content) as InterviewStreamEvent
  } catch {
    return null
  }
}

function parseInterviewSseEvent(segment: string): InterviewStreamEvent | null {
  const content = segment
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('')

  if (!content) {
    return null
  }

  return parseInterviewEvent(content)
}
