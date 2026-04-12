const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

router.post('/generate-report', async (req, res) => {
  try {
    const { candidateName, role, allQA } = req.body;
    
    const aiReportObj = await geminiService.generateReport(candidateName, role, allQA);
    res.json(aiReportObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
