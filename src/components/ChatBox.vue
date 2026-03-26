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
          {{ msg.text }}
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
        <label
          class="absolute left-3 top-1/2 -translate-y-1/2 p-0 m-0 cursor-pointer"
          title="上传简历"
          style="background: none; border: none; outline: none"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="10" fill="#e7e7e9" />
            <path d="M11 7v8M7 11h8" stroke="#444" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input type="file" class="hidden" @change="onFileChange" />
        </label>
        <input
          v-model="input"
          :disabled="loading"
          class="flex-1 bg-transparent border-none outline-none px-10 py-3 text-base text-black placeholder-gray-400"
          placeholder="有问题，尽管问"
        />
        <button
          type="submit"
          :disabled="!input || loading"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 text-base font-semibold text-gray-500"
          style="background: none; border: none; outline: none"
        >
          Send
        </button>
      </div>
    </form>
    <!-- 已移除UploadDialog弹窗，直接用input[type=file] -->
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
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
// const showUpload = ref(false)
function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  // 简单演示：自动上传，用户信息写死（可后续弹窗完善）
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
  const aiMsgObj = { user_id: 'lyl', role: 'ai', text: '' }
  try {
    const resp = await chatWithAI(userMessage)
    if (!resp.body) throw new Error('无流式响应')
    const reader = resp.body.getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }

      const chunk = new TextDecoder().decode(value, { stream: true })
      aiMsgObj.text += chunk
      await nextTick()
      scrollToBottom()
    }
  } catch (e) {
    aiMsgObj.text = '[AI 回复失败]'
  } finally {
    loading.value = false
    messages.value.push(aiMsgObj)
    console.log(messages.value)
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
