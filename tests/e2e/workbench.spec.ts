import { expect, test, type Page } from '@playwright/test'

const JD_IMAGE_PATH = 'D:\\图片\\JD-前端架构专家.png'
const DOCX_RESUME_PATH = 'D:\\工作\\罗运来_Web前端开发.docx'
const PDF_RESUME_PATH = 'D:\\工作\\罗运来_前端开发_AI应用.pdf'
const USER_ID_STORAGE_KEY = 'resume-agent-user-id'
const USER_PHONE_STORAGE_KEY = 'resume-agent-user-phone'
const TEST_USER_ID = `playwright-${Date.now()}`
const TEST_PHONE = '13900001234'
const DOCX_CANDIDATE_NAME = '罗运来 Web前端开发'
const PDF_CANDIDATE_NAME = '罗运来 前端开发 AI应用'
const INTERVIEW_ANSWER_COUNT = 10
const INTERVIEW_IDENTITY = `playwright-${Date.now()}`

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function candidatePattern(name: string): RegExp {
  return new RegExp(escapeRegex(name).replace(/\s+/g, '\\s*'), 'i')
}

async function uploadResume(page: Page, filePath: string, candidateName: string) {
  const candidateChips = page.locator('.candidate-chip').filter({ hasText: candidatePattern(candidateName) })
  await page.locator('input[accept=".docx,.pdf,application/pdf"]').setInputFiles(filePath)
  await expect(candidateChips.first()).toContainText(/上传中|Uploading/)
  await expect(candidateChips.last()).toContainText(/就绪|Ready/)
  await expect(candidateChips).toHaveCount(1)
}

test('runs real localhost workbench flow with OCR, uploads, evaluation, follow-up, interview, and deletion', async ({ page }) => {
  test.setTimeout(300_000)

  await page.addInitScript(
    ({ userId, phone, userIdKey, phoneKey }) => {
      window.localStorage.setItem(userIdKey, userId)
      window.localStorage.setItem(phoneKey, phone)
    },
    {
      userId: TEST_USER_ID,
      phone: TEST_PHONE,
      userIdKey: USER_ID_STORAGE_KEY,
      phoneKey: USER_PHONE_STORAGE_KEY,
    },
  )

  await page.goto('http://localhost:5173/')

  await expect(page.locator('#jd-textarea')).toBeVisible()
  await expect(page.getByRole('button', { name: /提问|Ask/ })).toBeDisabled()

  await page.locator('input[accept="image/*"]').setInputFiles(JD_IMAGE_PATH)
  await expect(page.locator('#jd-textarea')).not.toHaveValue('', { timeout: 60_000 })

  const jdContent = await page.locator('#jd-textarea').inputValue()
  expect(jdContent.trim().length).toBeGreaterThan(20)

  await page.getByRole('button', { name: /ANALYZE JD/i }).click()
  await expect(page.locator('.keyword-chip').first()).toBeVisible({ timeout: 60_000 })

  await uploadResume(page, DOCX_RESUME_PATH, DOCX_CANDIDATE_NAME)
  await uploadResume(page, PDF_RESUME_PATH, PDF_CANDIDATE_NAME)

  const docxCandidate = page.locator('.candidate-chip').filter({ hasText: candidatePattern(DOCX_CANDIDATE_NAME) })
  await docxCandidate.click()

  await expect(page.locator('.score-value')).toContainText(/%/, { timeout: 180_000 })
  await expect(page.locator('.report-copy-body')).not.toHaveText('', { timeout: 180_000 })
  await expect(page.locator('.assessment-phase-label')).toHaveCount(0, { timeout: 180_000 })

  const summaryText = await page.locator('.report-copy-body').first().textContent()
  expect((summaryText ?? '').trim().length).toBeGreaterThan(10)

  await page.locator('.follow-up-input').fill('请总结这位候选人与该岗位的核心匹配点，并指出一个主要风险。')
  await page.getByRole('button', { name: /提问|Ask/ }).click()
  await expect(page.locator('.follow-up-bubble--user')).toContainText('请总结这位候选人与该岗位的核心匹配点', { timeout: 30_000 })
  await expect(page.locator('.follow-up-bubble--ai .follow-up-bubble__text').last()).not.toHaveText('', { timeout: 180_000 })
  await expect(page.getByRole('button', { name: /发送中|Sending/ })).toHaveCount(0, { timeout: 180_000 })

  await page.getByRole('button', { name: /开始模拟面试|Start Mock Interview/ }).click()
  await expect(page.locator('#interview-identity')).toBeVisible()
  await page.locator('#interview-identity').fill(INTERVIEW_IDENTITY)
  await page.getByRole('button', { name: /确认身份|Confirm Identity/ }).click()

  await expect(page.locator('.interview-question-card')).toHaveCount(INTERVIEW_ANSWER_COUNT, { timeout: 180_000 })

  const answerInputs = page.locator('.interview-answer-textarea')
  for (let index = 0; index < INTERVIEW_ANSWER_COUNT; index += 1) {
    await answerInputs.nth(index).fill(`这是 Playwright 第 ${index + 1} 题的真实联调用回答，包含项目背景、技术方案、取舍原因和结果复盘。`)
  }

  await page.getByRole('button', { name: /提交完整答案|Submit All Answers/ }).click()
  await expect(page.locator('.interview-result-banner')).toBeVisible({ timeout: 180_000 })
  await expect(page.locator('.interview-result-banner span')).toContainText('/ 100')

  page.once('dialog', (dialog) => dialog.accept())
  await page.locator('.interview-modal__close').click()

  const deleteTrigger = docxCandidate.locator('.candidate-chip__close')
  await deleteTrigger.click()
  await expect(docxCandidate).toHaveCount(0, { timeout: 60_000 })

  await page.reload()
  await expect(page.locator('.candidate-chip').filter({ hasText: candidatePattern(DOCX_CANDIDATE_NAME) })).toHaveCount(0)
  await expect(page.locator('.candidate-chip').filter({ hasText: candidatePattern(PDF_CANDIDATE_NAME) })).toHaveCount(1)
})
