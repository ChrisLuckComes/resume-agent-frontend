<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
      <button class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl" @click="$emit('close')">×</button>
      <h2 class="text-lg font-bold mb-4">上传简历</h2>
      <input type="file" accept=".docx" @change="onFileChange" class="mb-4 block w-full" />
      <div class="flex gap-2 mb-4">
        <input v-model="candidate_name" class="flex-1 border rounded px-2 py-1" placeholder="候选人姓名" />
        <input v-model="phone" class="flex-1 border rounded px-2 py-1" placeholder="手机号" />
      </div>
      <input v-model="user_id" class="w-full border rounded px-2 py-1 mb-4" placeholder="用户ID" />
      <button @click="upload" :disabled="!file || uploading" class="btn-upload w-full">{{ uploading ? '上传中...' : '上传' }}</button>
      <div v-if="result" :class="result.resume_id ? 'text-green-600' : 'text-red-600'" class="mt-2">{{ result.message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { uploadResume, type UploadResumeResponse } from '../api';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close']);

const file = ref<File | null>(null);
const candidate_name = ref('');
const phone = ref('');
const user_id = ref('');
const uploading = ref(false);
const result = ref<UploadResumeResponse | null>(null);

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) file.value = files[0];
}

async function upload() {
  if (!file.value || !candidate_name.value || !phone.value || !user_id.value) return;
  uploading.value = true;
  result.value = null;
  try {
    const res = await uploadResume({ file: file.value, candidate_name: candidate_name.value, phone: phone.value, user_id: user_id.value });
    result.value = res;
  } catch (e) {
    result.value = { message: '上传失败', resume_id: 0, status: '' };
  } finally {
    uploading.value = false;
  }
}

watch(() => props.show, v => { if (!v) { file.value = null; candidate_name.value = ''; phone.value = ''; user_id.value = ''; result.value = null; } });
</script>

<style scoped>
.btn-upload {
  padding: 0.5rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px 0 rgba(37,99,235,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-upload:hover:not(:disabled) {
  background: linear-gradient(90deg, #1d4ed8 60%, #60a5fa 100%);
  box-shadow: 0 4px 16px 0 rgba(37,99,235,0.12);
}
</style>
