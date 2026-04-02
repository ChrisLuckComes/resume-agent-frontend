# 模拟面试功能 Plan

## 1. 目标

在简历评估完成后，为候选人提供一个贴近真实招聘场景的 AI 模拟面试能力：

- 在评估区增加显眼的“开始模拟面试”入口
- 点击后打开弹窗
- 基于当前 `JD + 简历 + 评估结果` 流式生成 10 道面试问题
- 问题不能只包含技术问答，还要包含开放性、项目追问、风险确认、协作沟通等真实面试问题
- 每题下方提供回答文本域
- 文本域支持语音输入
- 用户完成全部回答后，点击 footer 的提交按钮统一评分
- 最终输出 `通过 / 待定 / 不通过`
- 评分规则：
  - `score >= 75`：通过
  - `60 <= score < 75`：待定
  - `score < 60`：不通过

## 2. 产品原则

### 2.1 贴近真实面试

问题不能是简单题库或八股罗列，必须体现：

- 与岗位 JD 强相关
- 与候选人简历经历强相关
- 能根据评估亮点和风险点继续深挖
- 包含技术、项目、业务场景、沟通协作、开放性表达

### 2.2 不做机械判题

最终评分不要求答案与标准答案逐字一致，而是判断：

- 是否回答了问题
- 是否逻辑清晰
- 是否贴合 JD 关注点
- 是否与简历经历一致
- 是否有例子、细节、方法论
- 是否言之有理

### 2.3 提交方式

第一版只支持：

- 用户手动完成全部回答
- 点击 footer 的提交按钮后统一评分

第一版不做：

- 单题自动提交
- 单题自动实时打分
- 输入中高频调用大模型

## 3. 当前代码接入点

### 前端仓库
`resume-agent-frontend`

### 已确认的主要文件
- 评估面板：`resume-agent-frontend/src/components/AssessmentPanel.vue`
- 追问面板：`resume-agent-frontend/src/components/FollowUpPanel.vue`
- 全局状态：`resume-agent-frontend/src/stores/workbench.ts`
- 类型定义：`resume-agent-frontend/src/types/resume-agent.ts`
- 接口调用：`resume-agent-frontend/src/api.ts`
- 样式基底：`resume-agent-frontend/src/root.css`
- 语言包：`resume-agent-frontend/src/locales/zh-cn.ts`
- 语言包：`resume-agent-frontend/src/locales/en-us.ts`

### 后端仓库
`resume-agent`

### 已确认的主要文件
- 接口入口：`resume-agent/server.py`
- Agent 主逻辑：`resume-agent/agent.py`
- Prompt：`resume-agent/agent_prompts.py`
- 数据模型：`resume-agent/models.py`

## 4. 功能方案

## 4.1 评估区入口

在 `AssessmentPanel.vue` 的评分卡区域增加一个显眼按钮：

- 文案：`开始模拟面试`
- 展示条件：已有评估结果，且当前存在已选候选人
- 风格：延续当前页面玻璃拟态与荧光边框风格
- 视觉参考：tooltip 的边框、背景渐变、阴影风格
- 按钮优先级高于普通辅助操作

## 4.2 弹窗结构

新增组件：
- `resume-agent-frontend/src/components/InterviewModal.vue`
- `resume-agent-frontend/src/components/InterviewQuestionCard.vue`

弹窗结构：

### header
- 标题：模拟面试
- 副标题：显示候选人姓名 + 当前岗位上下文
- 关闭按钮：右上角 icon button

### body
- 顶部说明区
  - 提示共 10 题
  - 提示问题由 JD 与简历动态生成
  - 提示支持语音输入
- 题目列表区
  - 逐条流式插入问题卡片
- 每题卡片内容
  - 题号
  - 题目分类标签
  - 问题文本
  - 回答文本域
  - 语音输入按钮
  - 录音状态提示

### footer
- 左侧：提交状态 / 错误提示
- 右侧：`提交完整答案` 按钮
- 提交完成后展示：
  - 总分
  - verdict
  - 总评摘要

## 4.3 问题类型约束

10 道问题固定采用真实面试分布，不让模型自由散开：

- 3 题：技术深挖
- 2 题：项目经历 / ownership
- 2 题：业务场景 / 问题解决
- 2 题：开放性 / 沟通协作 / 职业选择
- 1 题：风险确认 / 压力问题

每题需要返回：
- `question_id`
- `category`
- `question`
- `intent`
- `source_ids`

其中：
- `intent` 用于说明这题想考察什么
- `source_ids` 用于标记该题与简历中哪些证据点相关

## 5. 前端状态设计

在 `resume-agent-frontend/src/types/resume-agent.ts` 中新增 interview 类型：

- `InterviewQuestionCategory`
- `InterviewQuestion`
- `InterviewStartRequest`
- `InterviewStartStreamEvent`
- `InterviewAnswerDraft`
- `InterviewSubmitRequest`
- `InterviewQuestionResult`
- `InterviewSubmitResult`
- `InterviewVerdict`

建议字段：

### InterviewQuestion
- `questionId`
- `category`
- `question`
- `intent`
- `sourceIds`

### InterviewAnswerDraft
- `questionId`
- `answer`
- `voiceStatus`

### InterviewQuestionResult
- `questionId`
- `score`
- `feedback`
- `strengths`
- `improvements`

### InterviewSubmitResult
- `totalScore`
- `verdict`
- `overallFeedback`
- `strengths`
- `risks`
- `questionResults`

在 `resume-agent-frontend/src/stores/workbench.ts` 中新增状态：

- `interviewModalOpen`
- `interviewStatus`
- `interviewQuestions`
- `interviewAnswers`
- `interviewSubmitStatus`
- `interviewResult`
- `interviewErrorMessage`
- `activeVoiceQuestionId`
- `voiceStatusByQuestion`

新增 action：

- `openInterviewModal()`
- `closeInterviewModal()`
- `startInterviewStream()`
- `setInterviewAnswer(questionId, value)`
- `submitInterviewAnswers()`
- `startVoiceInput(questionId)`
- `stopVoiceInput(questionId)`
- `resetInterviewState()`

`resume-agent-frontend/src/composables/useWorkbench.ts` 同步暴露以上方法和 refs。

## 6. 前端接口设计

在 `resume-agent-frontend/src/api.ts` 新增：

- `startInterviewStream(payload)`
- `submitInterviewAnswers(payload)`

### 6.1 开始模拟面试
接口：
- `POST /api/interview/start_stream`

入参：
- `user_id`
- `resume_id`
- `candidate_name`
- `jd_text`
- `jd_keywords`

返回：
- SSE 流

事件类型：
- `phase`
- `question`
- `done`
- `error`

### 6.2 提交完整答案
接口：
- `POST /api/interview/submit`

入参：
- `user_id`
- `resume_id`
- `candidate_name`
- `jd_text`
- `jd_keywords`
- `answers`

其中 `answers` 为 10 题完整回答。

返回：
- 总分
- verdict
- 总评
- 每题评分结果

## 7. 语音输入方案

第一版使用前端浏览器能力，不新增音频上传后端接口。

推荐方案：
- `Web Speech API`

新增 composable：
- `resume-agent-frontend/src/composables/useSpeechRecognition.ts`

能力要求：
- 点击 mic 按钮开始识别
- 识别结果追加写入当前题目的文本域
- 支持状态：
  - `idle`
  - `listening`
  - `recognizing`
  - `denied`
  - `unsupported`
  - `error`

设计原则：
- 语音输入只负责“录入答案”
- 不触发自动评分
- 不覆盖用户已有文字，采用追加写入
- 浏览器不支持时优雅降级为纯文本输入

## 8. 后端接口设计

在 `resume-agent/server.py` 新增两个接口：

- `POST /interview/start_stream`
- `POST /interview/submit`

第一版不增加单题评分接口。

### 8.1 /interview/start_stream
职责：
- 基于 `JD + 简历 + 当前评估结果` 生成 10 道结构化问题
- 通过 SSE 逐题返回，提升体验感

SSE 事件建议：

#### phase
```json
{ "type": "phase", "phase": "preparing" }
```

#### question
```json
{
  "type": "question",
  "question": {
    "question_id": "q1",
    "category": "technical_depth",
    "question": "请你详细讲一下...",
    "intent": "验证候选人在该技术栈下的真实深度与问题处理能力",
    "source_ids": ["src_1"]
  }
}
```

#### done
```json
{ "type": "done" }
```

#### error
```json
{ "type": "error", "message": "..." }
```

### 8.2 /interview/submit
职责：
- 接收全部题目回答
- 统一评分
- 输出总分、结论、逐题反馈

## 9. 后端模型设计

在 `resume-agent/models.py` 新增：

- `InterviewQuestion`
- `InterviewStartRequest`
- `InterviewQuestionsResponse`
- `InterviewAnswerInput`
- `InterviewSubmitRequest`
- `InterviewQuestionResult`
- `InterviewSubmitResult`

建议结构：

### InterviewQuestion
- `question_id: str`
- `category: str`
- `question: str`
- `intent: str`
- `source_ids: list[str]`

### InterviewAnswerInput
- `question_id: str`
- `question: str`
- `category: str`
- `answer: str`

### InterviewQuestionResult
- `question_id: str`
- `score: int`
- `feedback: str`
- `strengths: list[str]`
- `improvements: list[str]`

### InterviewSubmitResult
- `total_score: int`
- `verdict: str`
- `overall_feedback: str`
- `strengths: list[str]`
- `risks: list[str]`
- `question_results: list[InterviewQuestionResult]`

## 10. Agent 扩展设计

在 `resume-agent/agent_prompts.py` 新增：

- `build_interview_questions_prompt`
- `build_interview_submit_prompt`

在 `resume-agent/agent.py` 新增：

- `generate_interview_questions(...)`
- `stream_interview_questions(...)`
- `submit_interview_answers(...)`

## 10.1 题目生成逻辑
输入：
- `jd_text`
- `jd_keywords`
- `resume_text`
- `evaluation_result`
- `sources`

生成要求：
- 必须贴合目标岗位
- 必须贴合候选人已有经历
- 不只问技术点
- 要优先围绕评估亮点和风险点提问
- 问法要像真实面试官
- 问题要具体，不空泛

## 10.2 最终评分逻辑
统一提交后进行整体评估，核心维度：

- 回答是否切题
- 表达是否清晰
- 是否能结合真实经历
- 是否体现岗位关键能力
- 是否展现问题分析能力
- 是否存在明显跑题、空泛、避重就轻

最终分数来源：
- LLM 对 10 题逐题语义评分
- 再生成整体总结
- 最终 verdict 由后端规则强制计算

规则：
- `score >= 75` -> `通过`
- `60 <= score < 75` -> `待定`
- `score < 60` -> `不通过`

注意：
- verdict 不完全信任模型自由输出
- 由 Python 逻辑根据 `total_score` 二次判定

## 11. 前端样式方案

样式文件：
- `resume-agent-frontend/src/root.css`

建议新增模块：
- `.interview-modal-overlay`
- `.interview-modal`
- `.interview-modal__header`
- `.interview-modal__body`
- `.interview-modal__footer`
- `.interview-question-card`
- `.interview-question-card__category`
- `.interview-answer-textarea`
- `.interview-voice-button`
- `.interview-result-banner`

设计要求：
- 保持现有深色科技感
- 延续 tooltip 的玻璃感、边框、阴影和渐变语言
- 弹窗层级高于现有面板
- 移动端与桌面端都可用
- body 区域可滚动，footer 固定
- footer 提交按钮风格强于普通 ghost button

## 12. 文案与国际化

在以下文件新增 interview 文案：

- `resume-agent-frontend/src/locales/zh-cn.ts`
- `resume-agent-frontend/src/locales/en-us.ts`

至少包含：

- 模拟面试标题
- 开始模拟面试
- 正在生成题目
- 共 10 题
- 请完成所有回答后提交
- 提交完整答案
- 评分中
- 通过 / 待定 / 不通过
- 语音输入开始 / 停止 / 不支持 / 权限拒绝

## 13. 推荐实施顺序

### 阶段 1：后端题目生成
- 新增 interview models
- 新增 prompt
- 新增 `/interview/start_stream`
- 验证能稳定生成 10 道题

### 阶段 2：前端弹窗接入
- 在 `AssessmentPanel.vue` 增加入口按钮
- 新建 `InterviewModal.vue`
- 接入 SSE 流式渲染题目

### 阶段 3：答案录入
- 为每题增加文本域
- 在 store 中保存回答草稿
- 支持关闭弹窗后保留未提交内容

### 阶段 4：语音输入
- 新增 `useSpeechRecognition.ts`
- 每题支持 mic 输入
- 实现状态提示与降级方案

### 阶段 5：统一提交评分
- 新增 `/interview/submit`
- 前端 footer 提交完整答案
- 展示总分、verdict、逐题反馈

### 阶段 6：收尾
- 增加中英文文案
- 增加手动测试用例
- 跑 lint
- 联调验证

## 14. 测试重点

在 `resume-agent/测试用例.md` 和前端联调中增加：

- 已完成评估后，评分区出现“开始模拟面试”入口
- 点击后弹窗正常打开
- 能流式显示 10 道题
- 问题类型不只技术题
- 每题都能填写回答
- 语音输入能写入文本域
- 浏览器不支持语音时可正常降级
- 未完成回答时点击提交给出提示
- 提交完整答案后返回总分与 verdict
- verdict 阈值符合规则
- 异常情况下可显示错误提示并允许重试

## 15. 风险与注意事项

- 第一版不做单题实时评分，避免接口成本和交互复杂度上升
- 语音输入使用浏览器能力，兼容性要明确提示
- 题目生成必须严格约束类型分布，否则容易退化成泛泛聊天
- 评分要偏语义合理性，不做标准答案匹配
- verdict 最终由后端规则计算，不能完全交给模型

## 16. 第一版完成标准

满足以下条件即可视为第一版完成：

- 评估区有明显模拟面试入口
- 弹窗可打开/关闭
- 能基于 JD + 简历流式生成 10 道题
- 每题支持文本回答
- 每题支持语音输入
- 用户可在 footer 手动提交全部答案
- 系统返回总分、逐题反馈、最终 verdict
- 整体风格与现有页面一致
