<template>
  <div class="mb-4 flex items-center space-x-2">
    <input type="file" accept=".docx" @change="onFileChange" class="file-input file-input-bordered" />
    <button @click="upload" :disabled="!selectedFile || uploading" class="btn btn-primary">上传简历</button>
    <span v-if="uploading" class="text-blue-500">上传中...</span>
    <span v-if="result" :class="result.success ? 'text-green-600' : 'text-red-600'">{{ result.message }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { uploadResume } from '../api';
import type { UploadResumeResponse } from '../api';

const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const result = ref<UploadResumeResponse | null>(null);

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    selectedFile.value = files[0] ?? null;
    result.value = null;
  }
}

async function upload() {
  if (!selectedFile.value) return;
  uploading.value = true;
  result.value = null;
  try {
    const res = await uploadResume(selectedFile.value);
    result.value = res;
  } catch {
    result.value = { success: false, message: '上传失败' };
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.file-input {
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
}
.btn {
  padding: 0.25rem 1rem;
  border-radius: 0.25rem;
  background-color: #2563eb;
  color: #fff;
  transition: background 0.2s;
}
.btn:hover {
  background-color: #1d4ed8;
}
</style>
