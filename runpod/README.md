# RunPod Integration for SynthiSoul Pipeline

This directory contains everything needed to run the SynthiSoul conversation processing pipeline on RunPod's GPU infrastructure.

## 🏗️ Architecture

```
User Upload → Server → RunPod Container → Pipeline Processing → Email Delivery
     ↓              ↓           ↓                ↓                    ↓
  Magic Link    File Storage  GPU Processing  Bundle Creation    User Notification
```

## 📁 Files Overview

- **`submitRunpodJob.ts`** - Client library for submitting jobs to RunPod
- **`Dockerfile`** - Container definition for RunPod
- **`app.py`** - Flask application that runs inside the container
- **`package.json`** - Node.js dependencies for the container
- **`build.sh`** / **`build.bat`** - Build scripts for the container
- **`RUNPOD_SETUP_GUIDE.md`** - Complete setup instructions

## 🚀 Quick Start

### 1. Build the Container

```bash
# Linux/Mac
./build.sh

# Windows
build.bat
```

### 2. Test Locally

```bash
docker run -p 8000:8000 yourdockeruser/synthisoul-runner:latest
```

### 3. Test the API

```bash
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{"inputUrl": "https://example.com/test-conversation.json"}'
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# RunPod Configuration
RUNPOD_API_KEY=your_runpod_api_key_here
RUNPOD_TEMPLATE_ID=your_template_id_here
SERVER_URL=http://localhost:3000
```

### RunPod Template Settings

- **Container Image**: `yourdockeruser/synthisoul-runner:latest`
- **Container Disk**: 10GB
- **HTTP Port**: 8000
- **Start Command**: `python3 app.py`

## 📊 API Endpoints

### Container Endpoints

- **`POST /`** - Process conversation file
- **`GET /health`** - Health check
- **`GET /status`** - System status

### Server Endpoints

- **`POST /webhook/runpod-complete`** - Handle job completion
- **`GET /webhook/health`** - Webhook health check

## 🔄 Job Flow

1. **User uploads file** → Server receives file
2. **Server uploads to storage** → Gets public URL
3. **Server submits RunPod job** → Job queued on GPU
4. **Container processes file** → Pipeline runs on GPU
5. **Container returns result** → Bundle created
6. **Webhook notifies server** → Job completed
7. **Server sends email** → User receives bundle

## 🧪 Testing

### Test Job Submission

```typescript
import { submitRunpodJob } from './runpod/submitRunpodJob';

const result = await submitRunpodJob({
  inputUrl: 'https://example.com/test.json',
  apiKey: process.env.RUNPOD_API_KEY!,
  templateId: process.env.RUNPOD_TEMPLATE_ID!,
  jobParams: { test: true }
});

console.log('Job submitted:', result);
```

### Test Container Locally

```bash
# Start container
docker run -p 8000:8000 synthisoul-runner

# Test health
curl http://localhost:8000/health

# Test processing
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{"inputUrl": "https://example.com/test.json"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Container fails to start**
   - Check Docker logs: `docker logs <container_id>`
   - Verify all dependencies are installed

2. **Job submission fails**
   - Verify API key and template ID
   - Check RunPod console for errors

3. **Webhook not received**
   - Ensure webhook URL is publicly accessible
   - Check server logs for webhook processing

4. **File processing fails**
   - Verify input URL is accessible
   - Check container logs for pipeline errors

### Debug Commands

```bash
# Check container status
docker ps

# View container logs
docker logs <container_id>

# Test RunPod API
curl -H "Authorization: Bearer $RUNPOD_API_KEY" \
     https://api.runpod.io/v2/$TEMPLATE_ID/status
```

## 📈 Performance

### Resource Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 10GB for container + processing
- **GPU**: Optional, for future ML enhancements

### Processing Times

- **Small files** (< 1MB): ~30 seconds
- **Medium files** (1-10MB): ~2-5 minutes
- **Large files** (> 10MB): ~5-15 minutes

## 🔒 Security

### Best Practices

- Store API keys in environment variables
- Use signed URLs for file access
- Validate webhook signatures
- Implement rate limiting
- Clean up temporary files

### File Handling

- Files are processed in temporary directories
- Automatic cleanup after processing
- No persistent storage of user data
- Secure file upload validation

## 🚀 Deployment

### Production Checklist

- [ ] Container built and pushed to registry
- [ ] RunPod template configured
- [ ] Environment variables set
- [ ] Webhook URL configured
- [ ] File storage configured
- [ ] Email service configured
- [ ] Monitoring set up
- [ ] Error handling tested

### Scaling

- RunPod handles auto-scaling
- Multiple containers can run simultaneously
- Queue management handled by RunPod
- Load balancing automatic

## 📞 Support

For issues with:
- **RunPod**: Check [RunPod documentation](https://docs.runpod.io)
- **Container**: Check Docker logs and container status
- **Pipeline**: Check processing logs and input validation
- **Integration**: Check server logs and webhook handling

---

*Happy processing! 🚀*