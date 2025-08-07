const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Feedback route
app.post('/feedback', (req, res) => {
  const { input, response, feedback } = req.body;

  const logEntry = {
    input,
    response,
    feedback,
    timestamp: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, 'logs.json');
  fs.appendFile(filePath, JSON.stringify(logEntry) + ',\n', (err) => {
    if (err) {
      console.error('❌ Error writing feedback:', err);
      res.status(500).send('Error writing feedback');
    } else {
      console.log('✅ Feedback saved:', logEntry);
      res.status(200).send('Feedback saved');
    }
  });
});

// Logging route
app.post('/log', (req, res) => {
  const { input, response } = req.body;
  const logEntry = {
    input,
    response,
    timestamp: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, 'feedbackLogs.json');
  fs.appendFile(filePath, JSON.stringify(logEntry) + ',\n', (err) => {
    if (err) {
      console.error('Error writing logs:', err);
      res.status(500).send('Error writing logs');
    } else {
      console.log('Log saved');
      res.status(200).send('Log saved');
    }
  });
});

app.listen(PORT, () => {
  console.log(`📡 Logging server running on http://localhost:${PORT}`);
});
