const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfService = require('../services/pdfService');
const geminiService = require('../services/geminiService');

router.post('/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const text = await pdfService.extractTextFromPDF(req.file.buffer);
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    res.json({ resumeText: text, wordCount });
  } catch (error) {
    console.error("Parse resume error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText, role, experienceLevel } = req.body;
    if (!resumeText || !role || !experienceLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const analysis = await geminiService.analyzeResume(resumeText, role, experienceLevel);
    res.json(analysis);
  } catch (error) {
    console.error("Analyze resume error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
