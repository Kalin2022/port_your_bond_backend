# RunPod Setup Guide for SynthiSoul Job Submission

This guide walks you through setting up a RunPod template and submitting jobs using `submitRunpodJob.ts`.

---

## ✅ Prerequisites

- Docker installed on your machine
- A public Docker registry (e.g. Docker Hub or GitHub Packages)
- RunPod account: [https://runpod.io](https://runpod.io)
- A project or template already created
- `submitRunpodJob.ts` module ready in your codebase

---

## 🚢 1. Build & Push Your Docker Image

Make sure your Dockerfile is prepared to accept `inputUrl` and optional params via `POST /`.

```bash
docker build -t yourdockeruser/synthisoul-runner .
docker push yourdockeruser/synthisoul-runner
```

---

## 🏗️ 2. Create RunPod Template

1. **Go to RunPod Console**: [https://console.runpod.io](https://console.runpod.io)
2. **Navigate to Templates**: Click "Templates" in the sidebar
3. **Create New Template**: Click "New Template"
4. **Configure Template**:
   - **Name**: `synthisoul-pipeline`
   - **Container Image**: `yourdockeruser/synthisoul-runner:latest`
   - **Container Disk**: 10GB (adjust based on your needs)
   - **Volume Mount**: `/workspace` (optional, for persistent storage)
   - **Environment Variables**: 
     - `RUNPOD_POD_ID` (auto-populated)
     - `RUNPOD_POD_NAME` (auto-populated)
   - **Expose HTTP Ports**: `8000` (for health checks)
   - **Start Command**: `python app.py` (or your entry point)

---

## 🔧 3. Configure Your Container

Your container should handle HTTP requests and process the pipeline. Here's a sample structure:

### `app.py` (Container Entry Point)
```python
from flask import Flask, request, jsonify
import subprocess
import os
import requests
import json

app = Flask(__name__)

@app.route('/', methods=['POST'])
def process_pipeline():
    try:
        data = request.json
        input_url = data.get('inputUrl')
        
        if not input_url:
            return jsonify({'error': 'inputUrl required'}), 400
        
        # Download the input file
        response = requests.get(input_url)
        input_data = response.json()
        
        # Save to temporary file
        with open('/tmp/input.json', 'w') as f:
            json.dump(input_data, f)
        
        # Run the pipeline
        result = subprocess.run([
            'node', 'wirePipeline.js',
            '--input', '/tmp/input.json',
            '--output', '/tmp/output'
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            return jsonify({'error': result.stderr}), 500
        
        # Return success
        return jsonify({
            'status': 'completed',
            'output': '/tmp/output/PORT_BOND_BUNDLE.zip'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

---

## 🚀 4. Submit Jobs from Your Application

Use the `submitRunpodJob.ts` function in your server:

### `server/runpodHandler.ts`
```typescript
import { submitRunpodJob } from '../runpod/submitRunpodJob';
import { uploadToStorage } from './storageHandler'; // Your file storage logic

export async function processWithRunPod(filePath: string, email: string) {
  try {
    // 1. Upload file to public storage (Supabase, S3, etc.)
    const publicUrl = await uploadToStorage(filePath);
    
    // 2. Submit job to RunPod
    const job = await submitRunpodJob({
      inputUrl: publicUrl,
      webhookUrl: `${process.env.SERVER_URL}/webhook/runpod-complete`,
      apiKey: process.env.RUNPOD_API_KEY!,
      templateId: process.env.RUNPOD_TEMPLATE_ID!,
      jobParams: {
        email: email,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`🚀 RunPod job submitted: ${job.jobId}`);
    return job;
    
  } catch (error) {
    console.error('❌ RunPod job submission failed:', error);
    throw error;
  }
}
```

---

## 🔗 5. Handle Webhooks

Create a webhook endpoint to handle job completion:

### `server/runpodWebhook.ts`
```typescript
import express from 'express';
import { sendBundleEmail } from './emailSender';

const router = express.Router();

router.post('/webhook/runpod-complete', async (req, res) => {
  try {
    const { jobId, status, output } = req.body;
    
    if (status === 'COMPLETED' && output) {
      // Download the processed bundle
      const bundleUrl = output;
      
      // Send email with the bundle
      await sendBundleEmail(req.body.email, bundleUrl);
      
      console.log(`✅ Job ${jobId} completed and email sent`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

---

## ⚙️ 6. Environment Variables

Add these to your `.env` file:

```env
# RunPod Configuration
RUNPOD_API_KEY=your_runpod_api_key_here
RUNPOD_TEMPLATE_ID=your_template_id_here
SERVER_URL=http://localhost:3000

# File Storage (choose one)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
# OR
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket_name
```

---

## 🧪 7. Testing

### Test Job Submission
```typescript
import { submitRunpodJob } from './runpod/submitRunpodJob';

async function testRunPod() {
  try {
    const result = await submitRunpodJob({
      inputUrl: 'https://example.com/test-conversation.json',
      apiKey: process.env.RUNPOD_API_KEY!,
      templateId: process.env.RUNPOD_TEMPLATE_ID!,
      jobParams: { test: true }
    });
    
    console.log('Job submitted:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRunPod();
```

---

## 📊 8. Monitoring

- **RunPod Console**: Monitor job status and logs
- **Your Application**: Track job IDs and completion status
- **Webhooks**: Handle async completion notifications

---

## 🔒 9. Security Considerations

- **API Keys**: Store securely in environment variables
- **File Access**: Use signed URLs for temporary file access
- **Webhook Validation**: Verify webhook signatures
- **Rate Limiting**: Implement job submission limits

---

## 🚨 Troubleshooting

### Common Issues:
1. **Template Not Found**: Verify template ID and API key
2. **Container Fails**: Check container logs in RunPod console
3. **Webhook Not Received**: Verify webhook URL is publicly accessible
4. **File Access Denied**: Ensure input URL is publicly accessible

### Debug Commands:
```bash
# Check RunPod API
curl -H "Authorization: Bearer $RUNPOD_API_KEY" \
     https://api.runpod.io/v2/$TEMPLATE_ID/status

# Test webhook locally
ngrok http 3000  # Expose local server for webhook testing
```

---

## 📈 Next Steps

1. **Scale Up**: Configure auto-scaling for high demand
2. **Optimize**: Fine-tune container resources and processing time
3. **Monitor**: Set up alerts for failed jobs
4. **Cache**: Implement result caching for repeated requests

---

*Happy processing! 🚀*

