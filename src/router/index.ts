import { createRouter, createWebHistory } from 'vue-router'

import ObservabilityPage from '../pages/ObservabilityPage.vue'
import PromptPlaygroundPage from '../pages/PromptPlaygroundPage.vue'
import WorkbenchPage from '../pages/WorkbenchPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'workbench',
      component: WorkbenchPage,
    },
    {
      path: '/prompt-playground',
      name: 'prompt-playground',
      component: PromptPlaygroundPage,
    },
    {
      path: '/observability',
      name: 'observability',
      component: ObservabilityPage,
    },
  ],
})

export default router
