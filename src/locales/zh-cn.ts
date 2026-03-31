export default {
  topbar: {
    brand: {
      name: 'AI Resume Agent',
      caption: '面向职位与简历匹配分析的 AI 筛选工作台。',
    },
    locale: {
      label: '语言',
      zhCN: '简体中文',
      enUS: 'English',
    },
  },
  jd: {
    panel: {
      title: 'SECTION 1: JD ANALYSIS',
      eyebrow: '输入与解析',
    },
    field: {
      description: 'Job Description',
    },
    placeholder: {
      description: '粘贴目标岗位的职责描述、能力要求与核心筛选信号...',
    },
    button: {
      analyzyJD: 'ANALYZE JD',
      analyzing: '分析中...',
      ocrImage: '图片识别文字',
      ocrLoading: '识别中...',
    },
    tags: {
      title: 'JD keyword tags',
    },
  },
  resume: {
    panel: {
      title: 'Talent Pool',
      eyebrow: '简历导入',
    },
    button: {
      import: '+ Import Resume (.docx/.pdf)',
      uploading: '上传中...',
    },
    empty: {
      hint: '导入几份简历建立候选人池，点击候选人标签后会触发评估。',
    },
    loading: {
      list: '正在异步加载已上传简历...',
    },
    confirm: {
      remove: '确认从候选人池中移除这份简历吗？',
    },
    status: {
      uploading: '上传中',
      error: '异常',
      ready: '就绪',
    },
  },
  followup: {
    panel: {
      title: 'AI Follow-up Q&A',
      eyebrow: '上下文追问',
    },
    placeholder: {
      input: 'Ask AI about the selected candidate and the JD...',
    },
    button: {
      ask: '提问',
      sending: '发送中...',
    },
    role: {
      user: '你',
      ai: 'AI',
    },
    suggestion: {
      alignment: '这位候选人与 React 和 TypeScript 要求的契合度如何？',
      seniorityGap: '这位候选人与目标级别之间最大的差距是什么？',
    },
  },
  assessment: {
    panel: {
      title: 'Resume Assessment Report',
      eyebrow: 'AI 评估',
    },
    loading: {
      withName: '正在评估 {name}...',
    },
    score: {
      label: 'Resume match score',
      highMatch: '高匹配',
      moderateMatch: '中匹配',
      lowMatch: '低匹配',
    },
    section: {
      summary: 'Summary',
      highlights: 'Highlights',
      risks: 'Risks',
    },
    empty: {
      title: '请先分析 JD 并选择一份简历。',
      body: '评估卡会在流程完成后渲染分数、雷达图、总结、亮点与风险。',
    },
    state: {
      ready: '准备就绪',
      analyzingJD: '分析 JD 中',
      waitingResume: '待上传简历',
      evaluatingResume: '评估简历中',
      completed: '评估完成',
    },
    preview: {
      kicker: '示例预览',
      title: '右侧报告示意',
      demoBadge: 'DEMO DATA',
      noticeReady: '以下内容为示例假数据，仅用于展示最终报告结构；真实流程开始后会切换为实时状态与结果。',
      noticeWaitingResume: 'JD 已完成分析，以下仍为示例假数据；上传并选择简历后，将切换为真实评估流程。',
      roleTitle: 'Senior Frontend Engineer / Demo Preview',
      summary: '该候选人示例在 React、TypeScript 与协作能力上表现较强，整体贴合高级前端岗位，但仍需通过真实简历验证复杂架构与业务 owner 经验。',
      radar: {
        reactTs: 'React/TS',
        architecture: '架构设计',
        collaboration: '团队协作',
        delivery: '交付能力',
        problemSolving: '问题解决',
      },
      highlights: {
        0: '具备大型前端项目交付经验，能快速覆盖核心功能模块。',
        1: 'TypeScript 与组件架构能力强，利于支撑复杂业务演进。',
        2: '跨团队协作信号较好，适合进入下一轮面试。',
      },
      risks: {
        0: '示例数据不代表真实候选人，需要以正式解析结果为准。',
        1: '复杂架构 owner 经验仍需在真实评估中重点确认。',
      },
    },
    process: {
      liveBadge: '实时流程',
      analyzingJD: {
        title: 'AI 正在分析 JD',
        body: '系统正在解析岗位描述、提取关键词，并生成后续简历评估所需的比对维度。',
        steps: {
          0: '扫描职责与交付目标',
          1: '抽取技能关键词',
          2: '建立评估维度',
          3: '生成岗位分析结果',
        },
      },
      evaluatingResume: {
        title: '正在评估 {name}',
        body: '系统正在比对简历经历与 JD 信号，生成匹配分、亮点总结、风险判断与能力雷达图。',
        steps: {
          0: '解析简历内容与证据点',
          1: '对齐 JD 关键词与能力要求',
          2: '判断亮点与风险项',
          3: '输出结构化评估报告',
        },
      },
    },
    fallback: {
      title: {
        strong: '高匹配候选人',
        potential: '可继续评估',
        review: '需要进一步确认',
      },
      summary: {
        strong: '{candidateName} 与 {keywordText} 的匹配度较高，建议进入更深入的面试评估。',
        potential: '{candidateName} 在 {keywordText} 上具备部分匹配度，但仍需重点核查深度与覆盖面。',
        review: '{candidateName} 在 {keywordText} 上缺少足够证明，当前风险高于匹配收益。',
      },
      highlights: {
        primary: '{candidateName} 在 {keyword} 上展现出最明确的能力信号。',
        secondary: '从简历信息看，候选人具备与 {keyword} 相关的经验。',
      },
      risks: {
        validation: '需要在面试中进一步验证 {keyword} 的能力深度。',
        limitedEvidence: '{keyword} 在当前简历中的证据不足，尚未达到目标要求。',
        ownership: '简历中还缺少对级别与业务 owner 能力的有力证明。',
      },
    },
  },
  workbench: {
    error: {
      provideJDFirst: '请先输入职位描述。',
      analyzeJDFirst: '请先完成 JD 分析，再请求评估。',
      resumeLimit: '候选人池最多保留 {count} 份简历。',
      uploadFailed: '上传失败。',
      ocrFailed: '图片识别失败。',
      resumeListFailed: '简历列表加载失败。',
      resumeReady: '简历已可用于评估。',
      noStream: '未收到流式响应。',
      noAnswer: '未返回有效回答。',
      followUpFailed: '追问请求失败。',
      assessmentFailed: '评估失败。',
    },
    prompt: {
      candidateContext: '候选人：{candidateName}。',
      jdFocus: 'JD 重点：{keywords}。',
      question: '问题：{prompt}',
    },
    candidate: {
      unnamed: '新候选人',
    },
    assessment: {
      defaultCandidateName: '该候选人',
      defaultCandidateShortName: '候选人',
      defaultKeywordText: '当前 JD 重点',
      fallbackDimension: '综合能力',
      fallbackDimensions: {
        techDepth: '技术深度',
        projectExperience: '项目经验',
        softSkills: '软技能',
        backgroundExamples: '背景示例',
        aiSkills: 'AI技能',
      },
      fallbackHighlight: {
        coreFrontend: '核心前端能力',
      },
    },
    phase: {
      label: '工作流阶段',
    },
  },
} as const
