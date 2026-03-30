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
  }
}
