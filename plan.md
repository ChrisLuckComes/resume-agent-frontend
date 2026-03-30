AI Resume Agent - 核心开发设计蓝图 (Plan.md)

1. 全局视觉规范 (Visual Guidelines)
   主题风格：深色模式 (Dark Mode)，主打极简科技感与 AI 智能感。

核心色彩：

背景色：深灰黑 #101015 或带极微弱蓝调的深色。

强调色 (Accent)：极光绿 #00FFCC (用于高匹配度、成功状态、雷达图)、科技蓝 #0055FF (用于解析中、系统提示)。

警示色：危险红 #FF4040 (用于 Risks、删除按钮、低匹配度)。

UI 材质：毛玻璃效果 (Glassmorphism)，卡片背景采用带轻微透明度的黑色 (rgba(10, 10, 14, 0.7))，配合微弱的高光描边。

顶部导航 (Top Bar)：极简处理。仅保留左上角纯文本 Logo "AI Resume Agent"（可带微弱绿色辉光），完全移除其他无用的导航项。

2. 页面布局架构 (Layout Architecture)
   采用 左右非对称双栏布局，外加左侧内部的上下分层。

左侧控制台 (Left Panel)：宽度占比 40%。主要负责输入、指令与资源管理。

右侧评估面板 (Right Panel)：宽度占比 60%。核心业务价值区，展示 AI 分析结果。

3. 组件详细拆解 (Component Breakdown)
   3.1 左侧面板 (40% Width) - 控制与输入区
   区块 A：JD 分析与定义 (JD Analysis)

Job Description 输入框：多行文本域 (Textarea)，用于粘贴大段岗位描述。

目标级别 (Target Seniority)：下拉菜单 (Dropdown)，如 Junior, Mid, Senior, Lead。

操作按钮：[ ANALYZE JD ] (主按钮，极光绿渐变)。

【动态交互】JD 关键词标签流 (JD Keywords Tags)：

初始状态：隐藏。

点击分析后：在按钮下方渲染单行横向滚动的 Tag 列表。展示 AI 提取的核心技能点（如 React, TypeScript, Architecture）。

区块 B：简历资源池 (Talent Pool - Tag 流)

操作按钮：[ + Import Resume (docx) ] (次级按钮样式，带边框)。

简历列表 (Resume Tags)：

与上传按钮并排显示，横向流式布局 (Flex/Wrap)。

每个上传成功的简历表现为一个胶囊 Tag（如 Wang Xiaoming ✕）。

交互：点击 Tag 本体 -> 切换右侧评估报告；点击 ✕ -> 触发删除二次确认并移除。

状态体现：当前选中的候选人 Tag 需高亮（如绿色边框或背景），未选中的置灰。

区块 C：AI 追问区 (AI Follow-up Q&A)

放置于左侧最下方。

输入框：单行文本输入，Placeholder: "Ask AI about the selected candidate and the JD..."

快捷提示：输入框下方提供 1-2 个 AI 生成的建议问题（例如："他的经历符合 TS 的要求吗？"）。

3.2 右侧面板 (60% Width) - 简历评估报告区 (Assessment Report)
这是一个具有绿色发光边框的大型数据卡片，只有在左侧选中了具体候选人并完成评估后才完整渲染。

区块 A：核心量化指标 (Top Section)

左侧 - 匹配度分数 (Match Score)：极大的数字排版（如 92%），颜色根据分数动态变化（>80% 绿色，60-80% 黄色，<60% 红色）。下方带有小字 "RESUME MATCH SCORE"。

右侧 - 人才画像雷达图 (Radar Chart)：

极坐标图表，维度根据【区块 A 提取的 JD 关键词】动态生成。

展示候选人在各项核心能力上的 AI 评分（多边形面积覆盖）。

区块 B：结构化评估文本 (Bottom Section)
使用垂直排列的三个文本区块，每个区块带明确的标题和对应的情绪 Icon：

总结 (Summary)：一段 3-4 行的精炼文字，由 AI 给出的综合评价。

亮点 (Highlights)：带蓝色/绿色正面 Icon 的无序列表，列出高度契合 JD 的经验或技能。

危险点/风险 (Risks)：带红色警告 Icon 的无序列表，明确指出不匹配、经验不足或履历瑕疵（如“缺乏 0-1 架构经验”）。

4. 核心状态与流转逻辑 (State & Data Flow)
   初始化：右侧面板为空或显示占位符 ("Please analyze JD and select a resume")。左侧 JD 关键词隐藏。

输入 JD 并分析：前端提交文本 -> 后端 AI 提取关键词 -> 前端渲染 Keyword Tags。

上传简历：点击 Import -> 上传文件 -> 左侧增加一个 Resume Tag。

触发评估：点击具体的 Resume Tag -> 前端将该简历 ID 和当前 JD 传递给后端 -> 显示 Loading 动效（毛玻璃遮罩 + 粒子转圈） -> 后端执行比对并生成 JSON 报告。

渲染报告：解析后端返回的 JSON 数据，分别填充右侧的分数、雷达图数据点、总结、亮点和危险点。
