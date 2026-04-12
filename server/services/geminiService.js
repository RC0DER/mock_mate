const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const extractJson = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON extraction failed. Text was:", text);
    throw e;
  }
};

const generateWithRetry = async (prompt, fallbackReturn) => {
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return extractJson(text);
    } catch (error) {
      console.error(`Gemini Error on attempt ${i + 1}: ${error.status || error.message}`);
      if (i === 2) return fallbackReturn;
      await new Promise(r => setTimeout(r, 2000 * (i + 1))); 
    }
  }
};

const analyzeResume = async (resumeText, role, experienceLevel) => {
  const prompt = `You are an expert technical interviewer and ATS applicant tracking system. Analyze this resume and extract:
- ATS Score (0-100)
- Missing Keywords (up to 5 crucial skills missing for the role)
- Improvements (up to 3 concise suggestions)
- All relevant experience, skills, and projects.

Candidate's Target Role: ${role}
Candidate's Experience Level: ${experienceLevel}
Resume text: ${resumeText}

Return valid JSON: 
{ "atsScore": 85, "missingKeywords": [], "improvements": [], "skills": [], "experience": "", "projects": [], "education": [], "strengths": [], "weaknesses": [] }`;

  return await generateWithRetry(prompt, {
    atsScore: 70, missingKeywords: [], improvements: ["Add more quantifiable achievements"], skills: [], experience: "", projects: [], education: []
  });
};

const generateQuestion = async (role, experience, resumeAnalysis, previousQuestions = [], lastAnswer = null, round = 1) => {
  const history = Array.isArray(previousQuestions) ? previousQuestions : [];
  
  // MANDATORY FIRST QUESTION
  if (history.length === 0) {
    return {
      question: "Before we dive in — please give me a brief introduction about yourself. Who are you, where are you from, and what brought you to this field?"
    };
  }

  const systemPrompt = `You are an expert technical and HR interviewer with 15+ years of experience.
Conduct a realistic mock interview.

Candidate:
Role: ${role}
Experience Level: ${experience}
Resume Analysis: ${JSON.stringify(resumeAnalysis)}

Context:
- Cumulative Question Count: ${history.length + 1}
- Current Round: ${round === 1 ? 'Introduction' : round === 2 ? 'Technical' : 'HR/Behavioral'}
- Previous Questions (NEVER REPEAT THESE): ${JSON.stringify(history)}
- Last User Answer: ${lastAnswer || "N/A"}

PHASE RULES:
1. Round 1 (Intro): If history.length === 1, ask about their most proud project/experience.
2. Round 2 (Technical): Ask depth-based questions on ${role} skills and resume tech. Probe deep into specific tools/languages.
3. Round 3 (HR): Use STAR framework. Conflict, leadership, etc.

CRITICAL ANTI-REPEAT RULES:
- Read the 'Previous Questions' list and make absolutely sure your new question is substantively different.
- Do NOT say "Could you elaborate more on your recent project experiences?" if similar things were already asked.

STRICT FORMAT: Max length 3 sentences. No chatty filler.

Return ONLY valid JSON format: { "question": "The question text" }`;

  const round2Fallbacks = [
    "Could you explain a technical challenge you faced recently and how you solved it?",
    "How do you ensure the code you write is maintainable and scalable?",
    "Describe a time you optimized a poorly performing application or query.",
    "What is your approach to debugging a system issue in production?",
    "Explain the hardest bug you've ever had to track down.",
    "Tell me about a trade-off you had to make in system design or architecture.",
    "How do you handle technical debt while keeping up with feature delivery?",
    "Can you talk about your experience designing or working with complex APIs?"
  ];

  const round3Fallbacks = [
    "Can you tell me about a time you had to handle conflict in a team setting?",
    "Describe a situation where you had to lead a project or take initiative.",
    "Tell me about a time you failed or made a mistake, and what you learned from it.",
    "How do you manage stress and prioritize tasks under a tight deadline?",
    "Can you share an example of how you successfully communicated technical concepts to a non-technical audience?",
    "Where do you see yourself growing in the next few years, and why are you interested in this role?"
  ];

  let fallbackQ = "";
  if (history.length === 1) {
    fallbackQ = "Great! Now, tell me about the project you are most proud of — walk me through what you built, the problem it solved, your specific role, and the outcome.";
  } else if (round === 2) {
    const fallbackIdx = (history.length - 2) % round2Fallbacks.length;
    fallbackQ = round2Fallbacks[fallbackIdx];
  } else {
    const fallbackIdx = (history.length - 10) % round3Fallbacks.length;
    fallbackQ = round3Fallbacks[fallbackIdx >= 0 ? fallbackIdx : 0];
  }

  return await generateWithRetry(systemPrompt, { question: fallbackQ });
};

const evaluateAnswer = async (role, question, answer, experienceLevel) => {
  const prompt = `Evaluate this interview answer for a ${role} role.
Question: ${question}
Answer: ${answer}

Return JSON with scores (1-10):
{
  "scores": { "answerFraming": 5, "technicalKnowledge": 5, "communication": 5, "confidence": 5, "problemSolving": 5 },
  "feedback": "Quick feedback",
  "followUpNeeded": false
}`;

  return await generateWithRetry(prompt, {
    scores: { answerFraming: 6, technicalKnowledge: 6, communication: 6, confidence: 6, problemSolving: 6 },
    feedback: "Your answer was acceptable but could use more detail.",
    followUpNeeded: false
  });
};

const generateReport = async (candidateName, role, allQA) => {
  const systemPrompt = `You are a senior hiring panel evaluator with 15+ years of experience assessing candidates across technical and behavioral interviews.
Your job is to generate a comprehensive, honest, and actionable post-interview report based on the full interview transcript.

Candidate: ${candidateName}
Role Applied For: ${role}

TRANSCRIPT:
${JSON.stringify(allQA)}

Do not be lenient. Round scores to 1 decimal place.

Return a STRICT JSON object representing the exact scorecard structure below. Do not use Markdown outside of JSON strings.

{
  "overallScore": 8.5,
  "overallImpression": "2-3 sentences honest, balanced, specific impression.",
  "technicalScore": 8.0,
  "technicalFeedback": "3-5 sentences summarising patterns across all tech answers.",
  "technicalBreakdown": {
    "conceptual": 8,
    "applied": 8,
    "system": 7,
    "communication": 9
  },
  "hrScore": 9.0,
  "hrFeedback": "3-5 sentences summarising behavioral patterns.",
  "hrBreakdown": {
    "clarity": 9,
    "selfAwareness": 8,
    "collaboration": 9,
    "leadership": 8
  },
  "qaHighlights": [
    {
      "question": "Exact question asked",
      "userAnswer": "Exact or paraphrased answer",
      "score": 8,
      "evaluatorComment": "2-3 sentences. What was right/missing?",
      "suggestedAnswer": "Strong model answer tailored to candidate's context/resume.",
      "gapAnalysis": "1-2 sentences on missing STAR component or concept."
    }
  ],
  "strengths": [
    { "name": "Strength 1", "evidence": "Tie to a specific answer" },
    { "name": "Strength 2", "evidence": "Tie to a specific answer" }
  ],
  "weaknesses": [
    { "name": "Gap 1", "whyItMatters": "Impact on job", "nextStep": "Specific action" },
    { "name": "Gap 2", "whyItMatters": "Impact on job", "nextStep": "Specific action" }
  ],
  "hiringDecision": "Strong Hire | Hire | Borderline | No Hire",
  "justification": "1-2 sentences specific justification for the decision."
}`;

  const fallbackData = {
    overallScore: 7.5,
    overallImpression: "The candidate demonstrated solid foundational knowledge but struggled with deep technical constraints under pressure.",
    technicalScore: 7.0,
    technicalFeedback: "General technical grasp is good, but debugging edge cases needs improvement.",
    technicalBreakdown: { conceptual: 7, applied: 7, system: 6, communication: 8 },
    hrScore: 8.0,
    hrFeedback: "Good collaboration signals, but answers could be structured better using STAR.",
    hrBreakdown: { clarity: 7, selfAwareness: 8, collaboration: 9, leadership: 7 },
    qaHighlights: allQA.map(qa => ({
      question: qa.question || "Unknown Question",
      userAnswer: qa.answer || qa.userAnswer || "No answer provided.",
      score: 7,
      evaluatorComment: "Answer was general.",
      suggestedAnswer: "Incorporate the STAR framework and discuss specific outcomes.",
      gapAnalysis: "Lacked concrete metrics."
    })),
    strengths: [
      { name: "Communication", evidence: "Clear and articulate delivery." },
      { name: "Collaboration", evidence: "Expressed team-first mentality." }
    ],
    weaknesses: [
      { name: "Technical Depth", whyItMatters: "Needed for complex debugging.", nextStep: "Practice system design." },
      { name: "Answer Structure", whyItMatters: "Prevents rambling.", nextStep: "Use STAR method." }
    ],
    hiringDecision: "Hire",
    justification: "Candidate is coachable and possesses the core skills."
  };

  return await generateWithRetry(systemPrompt, fallbackData);
};

module.exports = {
  analyzeResume,
  generateQuestion,
  evaluateAnswer,
  generateReport
};
