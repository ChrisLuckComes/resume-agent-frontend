import { ref } from 'vue'

import type { SpeechRecognitionStatus } from '../types/resume-agent'

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0?: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: SpeechRecognitionResultLike[]
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

export function useSpeechRecognition() {
  const status = ref<SpeechRecognitionStatus>('idle')
  const transcript = ref('')
  const supported = typeof window !== 'undefined'
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  let recognition: SpeechRecognitionInstance | null = null

  function start(onTranscript: (value: string) => void) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      status.value = 'unsupported'
      return
    }

    transcript.value = ''
    recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let nextTranscript = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const alternative = result?.[0]
        if (alternative?.transcript) {
          nextTranscript += alternative.transcript
        }
      }
      transcript.value = nextTranscript.trim()
      status.value = 'recognizing'
      onTranscript(transcript.value)
    }

    recognition.onerror = (event) => {
      status.value = event.error === 'not-allowed' ? 'denied' : 'error'
    }

    recognition.onend = () => {
      if (status.value === 'listening' || status.value === 'recognizing') {
        status.value = 'idle'
      }
    }

    status.value = 'listening'
    recognition.start()
  }

  function stop() {
    recognition?.stop()
    recognition = null
  }

  return {
    supported,
    status,
    transcript,
    start,
    stop,
  }
}
