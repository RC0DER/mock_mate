const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

router.post('/generate-report', async (req, res) => {
  try {
    const { candidateName, role, allQA } = req.body;
    
    let totalScore = 0;
    let counts = 0;
    
    const aggregates = {
      answerFraming: 0,
      technicalKnowledge: 0,
      communication: 0,
      confidence: 0,
      problemSolving: 0
    };
    
    allQA.forEach(qa => {
      const s = qa.scores || {};
      Object.keys(aggregates).forEach(key => {
        aggregates[key] += (s[key] || 0);
      });
      totalScore += Object.values(s).reduce((a, b) => a + (b || 0), 0);
      counts += Object.keys(aggregates).length;
    });
    
    Object.keys(aggregates).forEach(key => {
      aggregates[key] = allQA.length ? (aggregates[key] / allQA.length).toFixed(1) : 0;
    });
    
    const overallScore = counts > 0 ? (totalScore / counts).toFixed(1) : 0;
    
    const reportText = await geminiService.generateReport(candidateName, role, allQA);
    
    res.json({
      overallScore: parseFloat(overallScore),
      breakdown: aggregates,
      overallAssessment: reportText.overallAssessment,
      strengths: reportText.strengths,
      weaknesses: reportText.weaknesses,
      suggestions: reportText.suggestions,
      resources: reportText.resources
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
