export default {
  topbar: {
    brand: {
      name: 'AI Resume Agent',
      caption: 'AI-assisted screening console for structured JD-to-resume evaluation.',
    },
    locale: {
      label: 'Language',
      zhCN: '简体中文',
      enUS: 'English',
    },
  },
  jd: {
    panel: {
      title: 'SECTION 1: JD ANALYSIS',
      eyebrow: 'Input + parsing',
    },
    field: {
      description: 'Job Description',
    },
    placeholder: {
      description: 'Paste the target role description, responsibilities, and must-have signals here...',
    },
    button: {
      analyzyJD: 'ANALYZE JD',
      analyzing: 'Analyzing...',
      ocrImage: 'OCR Image',
      ocrLoading: 'Reading image...',
    },
    tags: {
      title: 'JD keyword tags',
    },
  },
  resume: {
    panel: {
      title: 'Talent Pool',
      eyebrow: 'Resume imports',
    },
    button: {
      import: '+ Import Resume (.docx/.pdf)',
      uploading: 'Uploading...',
    },
    empty: {
      hint: 'Import a few resumes to build the candidate pool. Selecting a tag triggers the evaluation request.',
    },
    loading: {
      list: 'Loading uploaded resumes asynchronously...',
    },
    confirm: {
      remove: 'Remove this resume from the talent pool?',
    },
    status: {
      uploading: 'Uploading',
      error: 'Error',
      ready: 'Ready',
    },
  },
  followup: {
    panel: {
      title: 'AI Follow-up Q&A',
      eyebrow: 'Contextual questions',
    },
    placeholder: {
      input: 'Ask AI about the selected candidate and the JD...',
    },
    button: {
      ask: 'Ask',
      sending: 'Sending...',
    },
    role: {
      user: 'You',
      ai: 'AI',
    },
    sources: {
      title: 'Answer Evidence',
    },
    suggestion: {
      alignment: 'How does this candidate align with the React and TypeScript requirements?',
      seniorityGap: 'Where is the biggest seniority gap for this candidate?',
    },
  },
  assessment: {
    panel: {
      title: 'Resume Assessment Report',
      eyebrow: 'AI evaluation',
    },
    loading: {
      withName: 'Evaluating {name}...',
    },
    score: {
      label: 'Resume match score',
      highMatch: 'High Match',
      moderateMatch: 'Moderate Match',
      lowMatch: 'Low Match',
    },
    section: {
      summary: 'Summary',
      highlights: 'Highlights',
      risks: 'Risks',
    },
    sources: {
      title: 'Evidence Sources',
    },
    phase: {
      idle: 'Waiting to start',
      preparing: 'Preparing evaluation context',
      sources: 'Collecting evidence sources',
      scoring: 'Calculating match score',
      radar: 'Building capability radar',
      summary: 'Writing evaluation summary',
      highlights: 'Extracting candidate highlights',
      risks: 'Identifying risk signals',
      finalizing: 'Assembling final report',
    },
    empty: {
      title: 'Please analyze the JD and select a resume.',
      body: 'The assessment card will render the score, radar chart, summary, highlights, and risks once the pipeline completes.',
    },
    state: {
      ready: 'Ready',
      analyzingJD: 'Analyzing JD',
      waitingResume: 'Waiting for Resume',
      evaluatingResume: 'Evaluating Resume',
      completed: 'Completed',
    },
    preview: {
      kicker: 'Example Preview',
      title: 'Report Showcase',
      demoBadge: 'DEMO DATA',
      noticeReady: 'The content below is mock sample data to demonstrate the final report layout. Once the real workflow starts, the panel switches to live progress and results.',
      noticeWaitingResume: 'JD analysis is done, but the panel still shows demo data. Upload and select a resume to enter the real assessment flow.',
      roleTitle: 'Senior Frontend Engineer / Demo Preview',
      summary: 'This sample candidate shows strong signals in React, TypeScript, and collaboration, making the profile look promising for a senior frontend role, while architecture ownership still needs validation in the real resume review.',
      radar: {
        reactTs: 'React/TS',
        architecture: 'Architecture',
        collaboration: 'Collaboration',
        delivery: 'Delivery',
        problemSolving: 'Problem Solving',
      },
      highlights: {
        0: 'Shows delivery experience across large frontend product surfaces.',
        1: 'Demonstrates strong TypeScript and component architecture fundamentals.',
        2: 'Presents healthy cross-team collaboration signals for deeper interviews.',
      },
      risks: {
        0: 'Demo data is illustrative only and should not be read as a real candidate result.',
        1: 'Architecture ownership still needs validation during the actual assessment flow.',
      },
    },
    process: {
      liveBadge: 'Live Process',
      analyzingJD: {
        title: 'AI is analyzing the JD',
        body: 'The system is parsing the role brief, extracting keywords, and building the scoring dimensions for later resume comparison.',
        steps: {
          0: 'Scanning responsibilities and delivery goals',
          1: 'Extracting skill keywords',
          2: 'Building evaluation dimensions',
          3: 'Generating JD analysis output',
        },
      },
      evaluatingResume: {
        title: 'Evaluating {name}',
        body: 'The system is comparing resume evidence against JD signals to generate the score, highlights, risks, and radar visualization.',
        steps: {
          0: 'Parsing resume content and evidence',
          1: 'Aligning JD keywords and capability signals',
          2: 'Judging highlights and risk factors',
          3: 'Outputting a structured assessment report',
        },
      },
    },
    fallback: {
      title: {
        strong: 'Strong Match',
        potential: 'Potential Match',
        review: 'Needs Review',
      },
      summary: {
        strong: '{candidateName} shows a strong alignment with {keywordText} and appears ready for deeper interview evaluation.',
        potential: '{candidateName} covers part of {keywordText}, but the profile needs closer review around depth and scope.',
        review: '{candidateName} does not yet demonstrate enough evidence across {keywordText}; the risks outweigh the current fit.',
      },
      highlights: {
        primary: '{candidateName} shows the clearest signal in {keyword}.',
        secondary: 'Profile evidence suggests relevant exposure to {keyword}.',
      },
      risks: {
        validation: 'Need interview validation on depth in {keyword}.',
        limitedEvidence: 'Limited evidence for {keyword} at the requested scope.',
        ownership: 'Seniority and ownership level need stronger proof in the resume.',
      },
    },
  },
  interview: {
    button: {
      open: 'Start Mock Interview',
      submit: 'Submit All Answers',
      submitting: 'Scoring...',
      startVoice: 'Voice Input',
      stopVoice: 'Stop Recording',
    },
    modal: {
      eyebrow: 'AI Mock Interview',
      title: 'Mock Interview',
      subtitle: 'Candidate: {name}',
      intro: 'The system generates 10 interview questions from the current JD, resume, and assessment. Complete all answers before submitting for scoring.',
    },
    identity: {
      label: 'Temporary Interview Identity',
      placeholder: 'Example: xiaolin-demo / practice-0421',
      confirm: 'Confirm Identity',
      hint: 'Use your own temporary identifier. Interview history will be queried primarily by this identity.',
      current: 'Current identity: {identity}',
    },
    history: {
      title: 'Interview History',
      viewDetail: 'View Detail',
      detailTitle: 'History Detail',
    },
    phase: {
      idle: 'Waiting to start',
      preparing: 'Preparing interview context',
      generating: 'Generating mock interview questions',
    },
    category: {
      technical_depth: 'Technical Depth',
      ownership: 'Ownership',
      problem_solving: 'Problem Solving',
      communication: 'Communication',
      risk_check: 'Risk Check',
    },
    placeholder: {
      answer: 'Type your answer, or use voice input to speak your response...',
    },
    voiceStatus: {
      listening: 'Listening...',
      recognizing: 'Recognizing Chinese speech...',
      denied: 'Microphone access denied',
      unsupported: 'Speech recognition is not supported in this browser',
      error: 'Speech recognition failed, please try again',
    },
    verdict: {
      passed: 'Passed',
      pending: 'Pending',
      rejected: 'Rejected',
    },
    error: {
      loadFailed: 'Failed to load mock interview questions.',
      submitFailed: 'Failed to score the mock interview.',
      completeAllAnswers: 'Please complete all 10 answers before submitting.',
      identityRequired: 'Please enter and confirm a temporary interview identity first.',
    },
  },
  workbench: {
    error: {
      provideJDFirst: 'Please provide a job description first.',
      analyzeJDFirst: 'Analyze the JD before requesting an assessment.',
      resumeLimit: 'You can keep up to {count} resumes in the talent pool.',
      uploadFailed: 'Upload failed.',
      ocrFailed: 'Image OCR failed.',
      resumeListFailed: 'Failed to load the resume list.',
      resumeReady: 'Resume ready for assessment.',
      noStream: 'No streamed response received.',
      noAnswer: 'No answer returned.',
      followUpFailed: 'Follow-up request failed.',
      assessmentFailed: 'Assessment failed.',
    },
    prompt: {
      candidateContext: 'Candidate: {candidateName}.',
      jdFocus: 'JD focus: {keywords}.',
      question: 'Question: {prompt}',
    },
    candidate: {
      unnamed: 'New Candidate',
    },
    assessment: {
      defaultCandidateName: 'This candidate',
      defaultCandidateShortName: 'Candidate',
      defaultKeywordText: 'the current JD focus',
      fallbackDimension: 'Capability',
      fallbackDimensions: {
        techDepth: 'Tech Depth',
        projectExperience: 'Project Experience',
        softSkills: 'Soft Skills',
        backgroundExamples: 'Background Examples',
        aiSkills: 'AI Skills',
      },
      fallbackHighlight: {
        coreFrontend: 'core frontend skills',
      },
    },
    phase: {
      label: 'Workflow phase',
    },
  },
} as const
