// Use Vite env variable or dynamically resolve the frontend's host IP for local network testing
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const res = await fetch(`${API_URL}/parse-resume`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to parse resume');
  return res.json();
};

export const analyzeResume = async (resumeText, role, experienceLevel) => {
  const res = await fetch(`${API_URL}/analyze-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, role, experienceLevel })
  });
  if (!res.ok) throw new Error('Failed to analyze resume');
  return res.json();
};

export const generateQuestion = async (role, experienceLevel, resumeAnalysis, previousQuestions, lastAnswer, round = 1) => {
  const res = await fetch(`${API_URL}/generate-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, experienceLevel, resumeAnalysis, previousQuestions, lastAnswer, round })
  });
  if (!res.ok) throw new Error('Failed to generate question');
  return res.json();
};

export const evaluateAnswer = async (role, question, answer, experienceLevel) => {
  const res = await fetch(`${API_URL}/evaluate-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, question, answer, experienceLevel })
  });
  if (!res.ok) throw new Error('Failed to evaluate answer');
  return res.json();
};

export const generateReport = async (candidateName, role, allQA) => {
  const res = await fetch(`${API_URL}/generate-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateName, role, allQA })
  });
  if (!res.ok) throw new Error('Failed to generate report');
  return res.json();
};
