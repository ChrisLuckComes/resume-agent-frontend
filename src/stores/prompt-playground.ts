import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  createPromptVersion,
  fetchPromptScenarios,
  fetchPromptVersions,
  runPromptPlayground,
} from '../api/prompt-playground'
import type {
  PromptPlaygroundRunResponse,
  PromptScenario,
  PromptVersion,
  PromptVersionCreateRequest,
} from '../types/prompt-playground'

export const usePromptPlaygroundStore = defineStore('prompt-playground', () => {
  const scenarios = ref<PromptScenario[]>([])
  const selectedPromptName = ref('')
  const versions = ref<PromptVersion[]>([])
  const selectedVersionId = ref<number | null>(null)
  const systemInstruction = ref('')
  const userTemplate = ref('')
  const variables = ref<Record<string, string>>({})
  const modelName = ref('gemini-2.5-flash')
  const temperature = ref(0)
  const topP = ref<number | null>(null)
  const maxTokens = ref<number | null>(null)
  const saveLog = ref(true)
  const runStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const saveStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const errorMessage = ref('')
  const lastRun = ref<PromptPlaygroundRunResponse | null>(null)

  const selectedScenario = computed(
    () => scenarios.value.find((scenario) => scenario.prompt_name === selectedPromptName.value) ?? null,
  )

  async function loadScenarios() {
    const response = await fetchPromptScenarios()
    scenarios.value = response.items
    const firstScenario = response.items[0]
    if (!selectedPromptName.value && firstScenario) {
      applyScenario(firstScenario)
    }
  }

  async function selectScenario(promptName: string) {
    const scenario = scenarios.value.find((item) => item.prompt_name === promptName)
    if (!scenario) {
      return
    }
    applyScenario(scenario)
    await loadVersions(promptName)
  }

  async function loadVersions(promptName = selectedPromptName.value) {
    if (!promptName) {
      versions.value = []
      return
    }
    const response = await fetchPromptVersions(promptName)
    versions.value = response.items
  }

  function applyScenario(scenario: PromptScenario) {
    selectedPromptName.value = scenario.prompt_name
    selectedVersionId.value = null
    systemInstruction.value = scenario.default_system_instruction
    userTemplate.value = scenario.default_user_template
    modelName.value = scenario.default_config.model_name
    temperature.value = scenario.default_config.temperature
    topP.value = scenario.default_config.top_p ?? null
    maxTokens.value = scenario.default_config.max_tokens ?? null
    variables.value = Object.fromEntries(scenario.fields.map((field) => [field.name, '']))
  }

  function applyVersion(versionId: number | null) {
    selectedVersionId.value = versionId
    if (versionId == null) {
      const scenario = selectedScenario.value
      if (scenario) {
        applyScenario(scenario)
      }
      return
    }

    const version = versions.value.find((item) => item.id === versionId)
    if (!version) {
      return
    }
    systemInstruction.value = version.system_instruction
    userTemplate.value = version.user_template
    modelName.value = version.config.model_name
    temperature.value = version.config.temperature
    topP.value = version.config.top_p ?? null
    maxTokens.value = version.config.max_tokens ?? null
  }

  async function run() {
    if (!selectedPromptName.value) {
      return
    }
    runStatus.value = 'loading'
    errorMessage.value = ''
    try {
      lastRun.value = await runPromptPlayground({
        prompt_name: selectedPromptName.value,
        prompt_version_id: selectedVersionId.value,
        system_instruction_override: systemInstruction.value,
        user_template_override: userTemplate.value,
        variables: variables.value,
        model_name: modelName.value,
        temperature: temperature.value,
        top_p: topP.value,
        max_tokens: maxTokens.value,
        save_log: saveLog.value,
      })
      runStatus.value = 'success'
    } catch (error) {
      runStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Failed to run prompt playground.'
    }
  }

  async function saveVersion(payload: Pick<PromptVersionCreateRequest, 'version_label' | 'note'>) {
    if (!selectedPromptName.value) {
      return
    }
    saveStatus.value = 'loading'
    errorMessage.value = ''
    try {
      const version = await createPromptVersion({
        prompt_name: selectedPromptName.value,
        version_label: payload.version_label,
        system_instruction: systemInstruction.value,
        user_template: userTemplate.value,
        config: {
          model_name: modelName.value,
          temperature: temperature.value,
          top_p: topP.value,
          max_tokens: maxTokens.value,
        },
        note: payload.note,
      })
      versions.value = [version, ...versions.value]
      selectedVersionId.value = version.id
      saveStatus.value = 'success'
    } catch (error) {
      saveStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Failed to save prompt version.'
    }
  }

  return {
    scenarios,
    selectedPromptName,
    versions,
    selectedVersionId,
    selectedScenario,
    systemInstruction,
    userTemplate,
    variables,
    modelName,
    temperature,
    topP,
    maxTokens,
    saveLog,
    runStatus,
    saveStatus,
    errorMessage,
    lastRun,
    loadScenarios,
    selectScenario,
    loadVersions,
    applyVersion,
    run,
    saveVersion,
  }
})
