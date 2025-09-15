const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Test webhook endpoint
app.post('/webhook/runpod-complete', (req, res) => {
  console.log('📨 Webhook received:', req.body);
  res.status(200).send('Webhook processed');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', port: PORT });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
  console.log(`📨 Webhook: http://localhost:${PORT}/webhook/runpod-complete`);
});
