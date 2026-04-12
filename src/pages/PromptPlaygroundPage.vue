<template>
  <div class="app-shell page-shell">
    <div class="app-shell__backdrop"></div>
    <TopBar />
    <main class="page-stack">
      <GlassPanel :title="t('playground.panel.title')" :eyebrow="t('playground.panel.eyebrow')">
        <div class="stack-16">
          <div class="playground-toolbar-grid">
            <label class="stack-8">
              <span class="field-label">Scenario</span>
              <select class="input-shell input-shell--control" :value="selectedPromptName" @change="handleScenarioChange">
                <option v-for="scenario in scenarios" :key="scenario.prompt_name" :value="scenario.prompt_name">
                  {{ scenario.label }}
                </option>
              </select>
            </label>
            <label class="stack-8">
              <span class="field-label">Version</span>
              <select class="input-shell input-shell--control" :value="selectedVersionId ?? ''" @change="applyVersionValue">
                <option value="">Latest Draft</option>
                <option v-for="version in versions" :key="version.id" :value="version.id">
                  {{ version.version_label }}
                </option>
              </select>
            </label>
          </div>

          <p v-if="errorMessage" class="inline-alert inline-alert--error">{{ errorMessage }}</p>

          <div class="playground-main-grid">
            <section class="report-copy-card stack-16 playground-config-column">
              <div class="stack-10" v-if="selectedScenario">
                <h3 class="report-copy-title">Scenario Inputs</h3>
                <div class="field-grid">
                  <label v-for="field in selectedScenario.fields" :key="field.name" class="stack-8">
                    <span class="field-label">{{ field.label }}</span>
                    <textarea
                      v-if="field.multiline"
                      class="input-shell input-shell--textarea"
                      :value="variables[field.name] ?? ''"
                      @input="setVariable(field.name, ($event.target as HTMLTextAreaElement).value)"
                    ></textarea>
                    <input
                      v-else
                      class="input-shell input-shell--control"
                      :value="variables[field.name] ?? ''"
                      @input="setVariable(field.name, ($event.target as HTMLInputElement).value)"
                    />
                  </label>
                </div>
              </div>

              <div class="stack-10">
                <h3 class="report-copy-title">Prompt Editor</h3>
                <label class="stack-8">
                  <span class="field-label">System Instruction</span>
                  <textarea class="input-shell input-shell--textarea input-shell--editor" v-model="systemInstruction"></textarea>
                </label>
                <label class="stack-8">
                  <span class="field-label">User Template</span>
                  <textarea class="input-shell input-shell--textarea input-shell--editor" v-model="userTemplate"></textarea>
                </label>
              </div>

              <div class="stack-10">
                <h3 class="report-copy-title">Model Config</h3>
                <div class="model-config-grid">
                  <label class="stack-8">
                    <span class="field-label">Model Name</span>
                    <input class="input-shell input-shell--control" v-model="modelName" />
                  </label>
                  <label class="stack-8">
                    <span class="field-label">Temperature</span>
                    <input class="input-shell input-shell--control" type="number" step="0.1" v-model="temperature" />
                  </label>
                  <label class="stack-8">
                    <span class="field-label">Top P</span>
                    <input class="input-shell input-shell--control" type="number" step="0.1" :value="topP ?? ''" @input="topP = normalizeOptionalNumber(($event.target as HTMLInputElement).value)" />
                  </label>
                  <label class="stack-8">
                    <span class="field-label">Max Tokens</span>
                    <input class="input-shell input-shell--control" type="number" :value="maxTokens ?? ''" @input="maxTokens = normalizeOptionalNumber(($event.target as HTMLInputElement).value)" />
                  </label>
                </div>
              </div>

              <div class="stack-10">
                <h3 class="report-copy-title">Version Save</h3>
                <label class="stack-8">
                  <span class="field-label">Version Label</span>
                  <input class="input-shell input-shell--control" v-model="versionLabel" placeholder="例如：v2-summary-tuned" />
                </label>
                <label class="stack-8">
                  <span class="field-label">Version Note</span>
                  <textarea class="input-shell input-shell--textarea" v-model="versionNote" placeholder="记录这次 prompt 调整的目标、样本或结果"></textarea>
                </label>
              </div>

              <label class="playground-checkbox-row">
                <input type="checkbox" v-model="saveLog" />
                <span>Save run log</span>
              </label>

              <div class="playground-action-row">
                <button class="action-button action-button--secondary" type="button" @click="saveCurrentVersion">
                  {{ saveStatus === 'loading' ? t('playground.button.saving') : t('playground.button.saveVersion') }}
                </button>
                <button class="action-button action-button--primary" type="button" @click="runPrompt">
                  {{ runStatus === 'loading' ? t('playground.button.running') : t('playground.button.run') }}
                </button>
              </div>
            </section>

            <section class="report-copy-card stack-10 playground-result-column">
              <h3 class="report-copy-title">Last Run</h3>
              <template v-if="lastRun">
                <div class="metrics-grid">
                  <article class="metric-card">
                    <p class="section-hint">Latency</p>
                    <p class="metric-card__value">{{ lastRun.latency_ms }} ms</p>
                  </article>
                  <article class="metric-card">
                    <p class="section-hint">Tokens</p>
                    <p class="metric-card__value">{{ lastRun.usage.total_tokens ?? '-' }}</p>
                  </article>
                  <article class="metric-card">
                    <p class="section-hint">Cost</p>
                    <p class="metric-card__value">{{ lastRun.estimated_cost ?? '-' }}</p>
                  </article>
                  <article class="metric-card">
                    <p class="section-hint">Request ID</p>
                    <p class="metric-card__value metric-card__value--compact">{{ lastRun.request_id }}</p>
                  </article>
                </div>

                <div class="stack-10">
                  <h3 class="report-copy-title">Resolved Prompt</h3>
                  <pre class="code-preview">{{ stringify(lastRun.resolved_prompt) }}</pre>
                </div>

                <div class="stack-10">
                  <h3 class="report-copy-title">Parsed Output</h3>
                  <pre class="code-preview">{{ stringify(lastRun.parsed_output) }}</pre>
                </div>
              </template>
              <p v-else class="report-copy-body">运行一次 Prompt 后，这里会显示指标、最终 Prompt 和结构化结果。</p>
            </section>
          </div>
        </div>
      </GlassPanel>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import GlassPanel from '../components/GlassPanel.vue'
import TopBar from '../components/TopBar.vue'
import { useI18n } from '../composables/useI18n'
import { usePromptPlaygroundStore } from '../stores/prompt-playground'

const t = useI18n()
const store = usePromptPlaygroundStore()
const {
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
} = storeToRefs(store)
const versionLabel = ref('')
const versionNote = ref('')

function normalizeOptionalNumber(value: string): number | null {
  if (!value.trim()) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function setVariable(name: string, value: string) {
  variables.value = {
    ...variables.value,
    [name]: value,
  }
}

async function handleScenarioChange(event: Event) {
  await store.selectScenario((event.target as HTMLSelectElement).value)
}

function applyVersionValue(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  store.applyVersion(value ? Number(value) : null)
}

async function runPrompt() {
  await store.run()
}

async function saveCurrentVersion() {
  const label = versionLabel.value.trim() || `v${versions.value.length + 1}`
  await store.saveVersion({ version_label: label, note: versionNote.value.trim() || undefined })
  versionLabel.value = ''
  versionNote.value = ''
}

onMounted(async () => {
  await store.loadScenarios()
  if (selectedPromptName.value) {
    await store.loadVersions()
  }
})
</script>
