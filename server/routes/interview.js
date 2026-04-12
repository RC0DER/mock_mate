const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

router.post('/generate-question', async (req, res) => {
  try {
    const { role, experienceLevel, resumeAnalysis, previousQuestions, lastAnswer, round } = req.body;
    const result = await geminiService.generateQuestion(
      role, 
      experienceLevel, 
      resumeAnalysis, 
      previousQuestions, 
      lastAnswer,
      round
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/evaluate-answer', async (req, res) => {
  try {
    const { role, question, answer, experienceLevel } = req.body;
    const evaluation = await geminiService.evaluateAnswer(role, question, answer, experienceLevel);
    res.json(evaluation);
  } catch (error) {
    console.error("Evaluate answer error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
