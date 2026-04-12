const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (match) return JSON.parse(match[0]);
  return JSON.parse(text);
};

const generateWithRetry = async (prompt, fallbackReturn) => {
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      return extractJson(result.response.text());
    } catch (error) {
      console.error(`Gemini Error on attempt ${i + 1}: ${error.status || error.message}`);
      if (i === 2) {
        if (typeof fallbackReturn === 'string') return fallbackReturn;
        return fallbackReturn;
      }
      await new Promise(r => setTimeout(r, 2000 * (i + 1))); // Sleep 2s, 4s
    }
  }
};

const generateTextWithRetry = async (prompt, fallbackReturn) => {
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error(`Gemini Error on attempt ${i + 1}: ${error.status || error.message}`);
      if (i === 2) return fallbackReturn;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
};

const analyzeResume = async (resumeText, role, experienceLevel) => {
  const prompt = `You are an expert technical interviewer and ATS applicant tracking system. Analyze this resume and extract:
- ATS Score (0-100 score evaluating how well the resume matches the target role)
- Missing Keywords (up to 5 crucial skills or buzzwords missing for the role)
- Improvements (up to 3 concise suggestions to improve the resume impact)
- Candidate's key skills (technical + soft)
- Work experience summary
- Projects mentioned
- Education background
- Strengths to probe further
- Potential weak areas to assess

Candidate's Target Role: ${role}
Candidate's Experience Level: ${experienceLevel}

Resume text: ${resumeText}

Return a valid JSON object matching exactly this structure, no markdown formatting out of bounds, no extra text: 
{ "atsScore": 85, "missingKeywords": [], "improvements": [], "skills": [], "experience": "", "projects": [], "education": [], "strengths": [], "weaknesses": [], "suggestedTopics": [] }`;

  return await generateWithRetry(prompt, {
    atsScore: 70, missingKeywords: ["Agile", "Cloud Architecture"], improvements: ["Add more quantifiable achievements"], skills: ["General Programming"], experience: "Various projects", projects: [], education: [], strengths: [], weaknesses: [], suggestedTopics: []
  });
};

const generateQuestion = async (role, experienceLevel, resumeAnalysis, previousQuestions, lastAnswer) => {
  const prompt = `You are conducting a ${role} interview for a ${experienceLevel} candidate.
Candidate profile: ${JSON.stringify(resumeAnalysis)}
Questions asked so far: ${JSON.stringify(previousQuestions)}
Last answer: "${lastAnswer || 'N/A'}"

Generate the next interview question. Make it relevant to their background. 
If previous answer was weak, probe deeper. If strong, move to next topic.
Return only the question text, nothing else.`;

  return await generateTextWithRetry(prompt, "Could you elaborate more on your recent project experiences?");
};

const evaluateAnswer = async (role, question, answer, experienceLevel) => {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}
Experience Level: ${experienceLevel}

Score the answer on these 5 parameters (each out of 10):
1. answerFraming — structure, clarity, completeness
2. technicalKnowledge — accuracy, depth, correctness
3. communication — language clarity, vocabulary
4. confidence — directness, hesitation indicators
5. problemSolving — logical thinking, examples used

Return a valid JSON object matching exactly this structure:
{
  "scores": {
    "answerFraming": 7,
    "technicalKnowledge": 8,
    "communication": 6,
    "confidence": 5,
    "problemSolving": 7
  },
  "feedback": "Brief 1-sentence feedback on this answer",
  "followUpNeeded": false
}`;

  return await generateWithRetry(prompt, {
    scores: { answerFraming: 6, technicalKnowledge: 6, communication: 7, confidence: 6, problemSolving: 6 },
    feedback: "Your answer had some good points, but could be structured better.",
    followUpNeeded: false
  });
};

const generateReport = async (candidateName, role, allQA) => {
  const prompt = `Based on these interview questions and answers:
${JSON.stringify(allQA)}

Candidate: ${candidateName}
Role: ${role}

Generate a comprehensive performance report. For each question asked, provide a "suggestedAnswer" indicating what the candidate *should* have said to get a perfect score.

Return as a valid JSON object:
{ 
  "overallAssessment": "overall assessment paragraph (2-3 sentences)", 
  "strengths": ["strength 1", "strength 2"], 
  "weaknesses": ["weakness 1", "weakness 2"], 
  "qaHighlights": [
    {
      "question": "The question asked",
      "userAnswer": "What the user said",
      "suggestedAnswer": "A perfect model answer for this specific question",
      "feedback": "Specific feedback on this pair"
    }
  ],
  "suggestions": ["improvement tip 1"], 
  "resources": ["learning resource 1"] 
}`;

  return await generateWithRetry(prompt, {
    overallAssessment: "You completed the mock interview successfully.",
    strengths: ["Communication"],
    weaknesses: ["Technical depth"],
    qaHighlights: allQA.map(qa => ({
      question: qa.question,
      userAnswer: qa.answer,
      suggestedAnswer: "A more technical and structured response using the STAR method.",
      feedback: "Good attempt, try to provide more examples."
    })),
    suggestions: ["Practice more coding problems"],
    resources: ["Clean Code by Robert C. Martin"]
  });
};

module.exports = {
  analyzeResume,
  generateQuestion,
  evaluateAnswer,
  generateReport
};
