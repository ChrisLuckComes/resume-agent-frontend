import { storeToRefs } from 'pinia'

import { useWorkbenchStore } from '../stores/workbench'

export function useWorkbench() {
  const store = useWorkbenchStore()
  const state = storeToRefs(store)

  return {
    ...state,
    hydrateResumes: store.hydrateResumes,
    analyzeJobDescription: store.analyzeJobDescription,
    ocrJDImage: store.ocrJDImage,
    uploadResumeFile: store.uploadResumeFile,
    removeResume: store.removeResume,
    selectResume: store.selectResume,
    setFollowUpDraft: store.setFollowUpDraft,
    sendFollowUpQuestion: store.sendFollowUpQuestion,
    openInterviewModal: store.openInterviewModal,
    closeInterviewModal: store.closeInterviewModal,
    hydrateUserContext: store.hydrateUserContext,
    loadInterviewQuestions: store.loadInterviewQuestions,
    setInterviewAnswer: store.setInterviewAnswer,
    appendInterviewAnswer: store.appendInterviewAnswer,
    setVoiceStatus: store.setVoiceStatus,
    submitInterview: store.submitInterview,
    resetInterviewState: store.resetInterviewState,
    setInterviewIdentityDraft: store.setInterviewIdentityDraft,
    confirmInterviewIdentity: store.confirmInterviewIdentity,
    loadInterviewHistory: store.loadInterviewHistory,
    loadInterviewHistoryDetail: store.loadInterviewHistoryDetail,
    ensureInterviewIdentity: store.ensureInterviewIdentity,
  }
}
