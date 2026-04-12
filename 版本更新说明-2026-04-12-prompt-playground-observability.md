# 版本更新说明 - 2026-04-12

## 版本主题

新增 Prompt Playground 页面、Observability 页面与路由结构升级。

## 本次前端更新内容

### 1. 启用路由页面结构

- `App.vue` 从直接渲染工作台，改为 `RouterView`
- 新增页面：
  - `WorkbenchPage.vue`
  - `PromptPlaygroundPage.vue`
  - `ObservabilityPage.vue`
- 新增路由：
  - `/`
  - `/prompt-playground`
  - `/observability`

### 2. 顶部导航升级

- `TopBar.vue` 新增页面导航入口
- 支持在工作台、Prompt Playground、Observability 三个页面之间切换

### 3. 新增 Prompt Playground 前端能力

- 新增类型：`src/types/prompt-playground.ts`
- 新增 API：`src/api/prompt-playground.ts`
- 新增 store：`src/stores/prompt-playground.ts`
- 页面支持：
  - 场景选择
  - 历史版本选择
  - prompt 编辑
  - 模型参数编辑
  - 变量输入
  - 单次运行
  - 保存版本
  - 查看最近一次运行结果

### 4. 新增 Observability 前端能力

- 新增类型：`src/types/observability.ts`
- 新增 API：`src/api/observability.ts`
- 新增 store：`src/stores/observability.ts`
- 页面支持：
  - 调用概览卡片
  - 过滤条件
  - 图表化趋势展示（耗时 / token / 成本）
  - 请求日志表格

### 5. 新增图表能力

- 新增 `useLineChart.ts` 复用式图表组合逻辑
- 新增 `TrendLineChart.vue`，用于 Observability 页面趋势图展示
- 保持与现有 `echarts` 技术栈一致，避免重复引入新图表库

### 6. 国际化与样式补充

- `zh-cn.ts`、`en-us.ts` 新增 Playground 与 Observability 文案
- `root.css` 新增页面导航、概览卡片、日志表格、编辑器区域等样式

### 7. API 请求重复代码收敛

- 新增 `src/api/request.ts`
- 提取统一响应处理方法：
  - `parseJsonResponse`
  - `ensureOk`
- `src/api.ts`、`src/api/observability.ts`、`src/api/prompt-playground.ts` 中重复的 `response.ok` 判错逻辑已统一收敛
- 降低重复代码，方便后续统一扩展错误处理与响应解析策略

## 设计说明

- Prompt Playground 当前定位为内部调试工具，不是业务配置中心
- 页面先采用普通 JSON 请求，不引入新的流式复杂度
- 新功能未继续堆到 `workbench` store 中，而是独立拆出 store，便于后续维护

## 验证结果

- 已通过 `pnpm build`
- 已通过 `pnpm lint`

## 后续建议

1. 为 Prompt Playground 增加双版本对比运行能力
2. 增加从线上日志一键复制到 Playground 复跑的能力
3. 为 Observability 增加 feature / model 占比图
4. 为 Playground / Observability 增加更细的权限或环境开关控制
