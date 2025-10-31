# How to Rebuild and Redeploy the RunPod Container

## The Problem

Your RunPod container was built with the wrong Dockerfile context. The container is missing the `pipeline/` directory that contains all the essential processing code.

**Evidence from your terminal session:**
```
root@c80906a79f64:/app# ls -la /app
-rw-r--r--  1 root root   221 Sep 10 07:05 package.json
drwxr-xr-x  2 root root  4096 Sep 10 00:10 utils

root@c80906a79f64:/app# ls -la /app/pipline/  <-- TYPO in the command, but directory doesn't exist
ls: cannot access '/app/pipline/': No such file or directory
```

The container is missing the entire `pipeline/` directory with all the processing modules!

## The Solution

You need to rebuild the Docker container from the **root of the project** (`C:\Users\Matth\port_your_bond\`) so it includes the `pipeline/` directory.

### Step 1: Navigate to Project Root

```powershell
cd C:\Users\Matth\port_your_bond
```

### Step 2: Build the Docker Image

```powershell
# Build from the root directory (this ensures pipeline/ is included)
docker build -t kalin2022/synthisoul-runner:latest -f runpod/Dockerfile .

# If you have Docker Hub credentials configured:
docker login

# Push to Docker Hub
docker push kalin2022/synthisoul-runner:latest
```

### Step 3: Update RunPod Template

1. Go to [RunPod Console](https://console.runpod.io)
2. Navigate to **Serverless** → **Endpoints**
3. Find your endpoint **`synthisoul-runner-cpu`** (or whatever it's named)
4. Click on it and select **"Deployments"** or **"Settings"**
5. Update the **Container Image** to use the newly pushed image
6. Click **"Redeploy"** or **"Update"**

### Step 4: Verify the Fix

After redeploying, the container should have:
- `/app/pipeline/` directory with all the processing modules
- `/app/wirePipeline.js` compiled from TypeScript
- `/app/app.py` Flask server

You can verify by:
1. Canceling the stuck jobs
2. Submitting a new test job
3. Checking the logs to see if processing completes

## Alternative: Quick Test

If you want to test locally before pushing:

```powershell
# Build locally
docker build -t synthisoul-runner:test -f runpod/Dockerfile .

# Run locally to verify it has the files
docker run -it synthisoul-runner:test bash

# Inside the container, check:
ls -la /app/pipeline/
# Should show: TopicTagger.js, EmotionTagger.js, etc.

# Check if wirePipeline.js exists
ls -la /app/wirePipeline.js

# Exit container
exit
```

## Expected Timeline

After the fix is deployed:
- **Small files** (< 1MB): ~30 seconds
- **Medium files** (1-10MB): ~2-5 minutes  
- **Large files** (> 10MB): ~5-15 minutes

The current stuck jobs will likely fail or timeout because the container doesn't have the pipeline code. Once you redeploy with the fixed image, new jobs should process successfully.

## What to Do with Stuck Jobs

1. **Cancel them** in the RunPod dashboard
2. Or **wait for timeout** (they'll eventually fail)
3. **Resubmit** after the fixed container is deployed

## Verification Checklist

- [ ] Docker image built successfully
- [ ] Image pushed to Docker Hub (or your registry)
- [ ] RunPod endpoint updated with new image
- [ ] Endpoint redeployed
- [ ] Test job submitted
- [ ] Job completes within expected time
- [ ] Webhook received in your backend
- [ ] Email sent successfully

