import type {
  PromptPlaygroundRunRequest,
  PromptPlaygroundRunResponse,
  PromptScenarioListResponse,
  PromptVersion,
  PromptVersionCreateRequest,
  PromptVersionListResponse,
} from '../types/prompt-playground'
import { parseJsonResponse } from './request'

export async function fetchPromptScenarios(): Promise<PromptScenarioListResponse> {
  const response = await fetch('/api/prompt-playground/scenarios')
  return parseJsonResponse<PromptScenarioListResponse>(response)
}

export async function fetchPromptVersions(promptName: string): Promise<PromptVersionListResponse> {
  const response = await fetch(`/api/prompt-playground/versions?prompt_name=${encodeURIComponent(promptName)}`)
  return parseJsonResponse<PromptVersionListResponse>(response)
}

export async function createPromptVersion(payload: PromptVersionCreateRequest): Promise<PromptVersion> {
  const response = await fetch('/api/prompt-playground/versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJsonResponse<PromptVersion>(response)
}

export async function runPromptPlayground(payload: PromptPlaygroundRunRequest): Promise<PromptPlaygroundRunResponse> {
  const response = await fetch('/api/prompt-playground/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJsonResponse<PromptPlaygroundRunResponse>(response)
}
