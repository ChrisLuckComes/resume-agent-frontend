export interface PromptConfig {
  model_name: string
  temperature: number
  top_p?: number | null
  max_tokens?: number | null
}

export interface PromptScenarioField {
  name: string
  label: string
  description: string
  multiline: boolean
}

export interface PromptScenario {
  prompt_name: string
  label: string
  description: string
  output_mode: string
  output_schema_name?: string | null
  default_system_instruction: string
  default_user_template: string
  default_config: PromptConfig
  fields: PromptScenarioField[]
}

export interface PromptScenarioListResponse {
  items: PromptScenario[]
}

export interface PromptVersion {
  id: number
  prompt_name: string
  version_label: string
  system_instruction: string
  user_template: string
  config: PromptConfig
  note?: string | null
  created_at: string
}

export interface PromptVersionListResponse {
  items: PromptVersion[]
}

export interface PromptVersionCreateRequest {
  prompt_name: string
  version_label: string
  system_instruction: string
  user_template: string
  config: PromptConfig
  note?: string
}

export interface PromptPlaygroundRunRequest {
  prompt_name: string
  prompt_version_id?: number | null
  system_instruction_override?: string | null
  user_template_override?: string | null
  variables: Record<string, unknown>
  model_name?: string | null
  temperature?: number | null
  top_p?: number | null
  max_tokens?: number | null
  save_log: boolean
}

export interface PromptUsageMetrics {
  input_tokens?: number | null
  output_tokens?: number | null
  total_tokens?: number | null
}

export interface PromptPlaygroundRunResponse {
  request_id: string
  log_id?: number | null
  resolved_prompt: {
    system_instruction: string
    user_template: string
  }
  parsed_output: unknown
  raw_output_preview: string
  usage: PromptUsageMetrics
  latency_ms: number
  estimated_cost?: number | null
  success: boolean
  error_message?: string | null
}
