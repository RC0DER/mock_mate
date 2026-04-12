require('dotenv').config();
const express = require('express');
const cors = require('cors');

const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', resumeRoutes);
app.use('/api', interviewRoutes);
app.use('/api', reportRoutes);

app.get('/health', (req, res) => {
  res.send('MockMate backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
