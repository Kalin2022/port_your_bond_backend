// examples/runpodExample.ts - Example RunPod integration
import { RunPodClient, processConversationWithRunPod } from '../runpod/runpodClient';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  
  if (!apiKey || !endpointId) {
    console.error('❌ Missing RunPod configuration. Please set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID');
    process.exit(1);
  }

  // Example 1: Simple job submission
  console.log('=== Example 1: Simple Job Submission ===');
  const client = new RunPodClient(apiKey, endpointId);
  
  try {
    const job = await client.submitJob({
      fileURL: 'https://your-bucket/input/conversation.json',
      processingType: 'conversation_analysis',
      options: {
        chunkSize: 250,
        enableEmotionAnalysis: true,
        enableTopicTagging: true,
        generateWhisperbacks: true
      }
    });
    
    console.log('✅ Job submitted:', job);
  } catch (error) {
    console.error('❌ Job submission failed:', error);
  }

  // Example 2: Complete processing workflow
  console.log('\n=== Example 2: Complete Processing Workflow ===');
  
  try {
    const result = await processConversationWithRunPod(
      'https://your-bucket/input/conversation.json',
      apiKey,
      endpointId
    );
    
    console.log('✅ Processing completed:', result);
  } catch (error) {
    console.error('❌ Processing failed:', error);
  }

  // Example 3: Job monitoring
  console.log('\n=== Example 3: Job Monitoring ===');
  
  try {
    const job = await client.submitJob({
      fileURL: 'https://your-bucket/input/conversation.json',
      processingType: 'conversation_analysis'
    });
    
    console.log(`📋 Monitoring job: ${job.id}`);
    
    // Check status every 5 seconds
    const checkStatus = async () => {
      const status = await client.getJobStatus(job.id);
      console.log(`📊 Job status: ${status.status}`);
      
      if (status.status === 'IN_PROGRESS') {
        setTimeout(checkStatus, 5000);
      } else if (status.status === 'COMPLETED') {
        console.log('✅ Job completed successfully!');
        console.log('📦 Output:', status.output);
      } else if (status.status === 'FAILED') {
        console.error('❌ Job failed:', status.error);
      }
    };
    
    checkStatus();
    
  } catch (error) {
    console.error('❌ Job monitoring failed:', error);
  }
}

// Run the example
main().catch(console.error);
