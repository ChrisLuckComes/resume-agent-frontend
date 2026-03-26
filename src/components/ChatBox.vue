<template>
  <div class="relative flex flex-col min-h-[400px] w-full max-w-3xl mx-auto justify-between">
    <div class="flex-1 overflow-y-auto px-0 pb-4 w-full" ref="chatContainer">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="mb-4 flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          :class="[
            'max-w-[75%] px-4 py-2 rounded-2xl',
            msg.role === 'user'
              ? 'bg-[#e7e7e9] text-black rounded-br-md'
              : 'bg-white text-black rounded-bl-md border border-gray-200',
          ]"
        >
          <span v-if="msg.role === 'user'">{{ msg.text }}</span>
          <span v-else v-html="msg.text.replace(/\n/g, '<br>')"></span>
        </div>
      </div>
    </div>
    <form
      class="flex items-center justify-center px-0 pb-[60px] bg-transparent"
      @submit.prevent="onSend"
      style="z-index: 20"
    >
      <div
        class="relative flex-1 flex items-center bg-[#fff] rounded-xl border border-gray-200 shadow-sm mx-auto w-full max-w-3xl"
      >
        <div
          ref="menuRef"
          class="absolute left-3 top-1/2 -translate-y-1/2 p-0 m-0 cursor-pointer"
          style="background: none; border: none; outline: none"
        >
          <div @click="toggleMenu">
            <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="10" fill="#e7e7e9" />
              <path d="M11 7v8M7 11h8" stroke="#444" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <div v-if="showMenu" class="absolute left-0 bottom-full mb-2 z-30 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex flex-col gap-2">
            <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
              <input ref="fileInputRef" type="file" class="hidden" @change="onFileChange" />
              <span @click.stop="triggerFileInput">上传简历</span>
            </label>
            <button class="text-left hover:bg-gray-100 rounded px-2 py-1" @click="showJDInput = true; showMenu = false">JD描述</button>
            <button class="text-left hover:bg-gray-100 rounded px-2 py-1" @click="analyzeResume">简历分析</button>
          </div>
        </div>
        <input
          v-model="input"
          :disabled="loading"
          class="flex-1 bg-transparent border-none outline-none px-10 py-3 text-base text-black placeholder-gray-400"
          placeholder="有问题，尽管问"
        />
        <transition name="fade">
          <div v-if="loading" class="absolute left-1/2 -translate-x-1/2 bottom-14 flex items-center gap-2 text-gray-500 text-sm bg-white px-4 py-2 rounded shadow border border-gray-200 animate-pulse z-20">
            <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            生成中...
          </div>
        </transition>
      </div>
    </form>
    <!-- 已移除UploadDialog弹窗，直接用input[type=file] -->
    <div v-if="showJDInput" class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div class="bg-white rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4">
        <div class="font-bold text-lg">输入JD描述</div>
        <textarea v-model="jdText" rows="4" class="w-full border rounded p-2" placeholder="请输入岗位JD描述"></textarea>
        <div class="flex gap-2 justify-end">
          <button class="px-4 py-1 rounded bg-gray-200" @click="showJDInput = false">取消</button>
          <button class="px-4 py-1 rounded bg-blue-600 text-white" @click="submitJD">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { chatWithAI, uploadResume } from '../api'
// import UploadDialog from './UploadDialog.vue'

interface Message {
  user_id: string
  text: string
  role: 'user' | 'ai'
}

const messages = ref<Message[]>([])
const input = ref('')
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const showMenu = ref(false)
const showJDInput = ref(false)
const jdText = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  showMenu.value = !showMenu.value
}
function triggerFileInput(e: Event) {
  e.stopPropagation()
  if (fileInputRef.value) fileInputRef.value.click()
}
function handleClickOutside(e: MouseEvent) {
  if (showMenu.value && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
function submitJD() {
  if (!jdText.value.trim()) return
  input.value = jdText.value
  showJDInput.value = false
}
async function analyzeResume() {
  showMenu.value = false
  loading.value = true
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'lyl',
        candidate_name: '罗运来',
        phone: '13510034021',
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    const eva = data.evaluation
    let msg = '[简历分析结果]\n'
    if (eva.decision) msg += `【评估结论】${eva.decision}\n`
    if (eva.match_score !== undefined) msg += `【匹配分数】${eva.match_score}\n`
    if (eva.tech_stack && eva.tech_stack.length) msg += `【技术栈】${eva.tech_stack.join('，')}\n`
    if (eva.key_achievements && eva.key_achievements.length) msg += `【关键成就】\n- ` + eva.key_achievements.join('\n- ') + '\n'
    if (eva.ai_bonus) msg += `【AI加分项】${eva.ai_bonus}\n`
    if (eva.risks && eva.risks.length) msg += `【风险提示】\n- ` + eva.risks.join('\n- ') + '\n'
    messages.value.push({ user_id: 'lyl', role: 'ai', text: msg })
  } catch (e) {
    messages.value.push({ user_id: 'lyl', role: 'ai', text: '[简历分析失败]' })
  } finally {
    loading.value = false
  }
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  const form = {
    file: file as File,
    candidate_name: '罗运来',
    phone: '13510034021',
    user_id: 'lyl',
  }
  uploadResume(form)
    .then((res) => {
      alert('上传成功，简历ID: ' + res.resume_id)
    })
    .catch((err) => {
      alert('上传失败：' + err)
    })
  showMenu.value = false
}

async function onSend() {
  if (!input.value.trim()) return
  const userMsg = input.value
  const userMessage = { user_id: 'lyl', role: 'user', text: userMsg }
  messages.value.push(userMessage)
  input.value = ''
  loading.value = true
  await nextTick()
  scrollToBottom()
  let aiMsg = ''
  // 先推入一个空AI消息对象，初始内容为生成中...
  messages.value.push({ user_id: 'ai', role: 'ai', text: '生成中...' })
  try {
    const resp = await chatWithAI(userMessage)
    if (!resp.body) throw new Error('无流式响应')
    const reader = resp.body.getReader()
    let done = false
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      if (value) {
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split(/\r?\n/)
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const content = line.replace('data:', '').trim()
            if (content === '[END]') continue
            aiMsg += content
          }
        }
        messages.value[messages.value.length - 1] = { user_id: 'ai', role: 'ai', text: aiMsg }
        await nextTick()
        scrollToBottom()
      }
      done = doneReading
    }
  } catch (e) {
    messages.value[messages.value.length - 1] = { user_id: 'ai', role: 'ai', text: '[AI 回复失败]' }
  } finally {
    loading.value = false
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(messages, scrollToBottom)
</script>

<style scoped>
form {
  z-index: 10;
}
</style>
