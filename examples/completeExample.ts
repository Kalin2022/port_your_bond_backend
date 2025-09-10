// examples/completeExample.ts - Complete RunPod integration example
import { RunPodClient } from '../runpod/runpodClient';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

async function demonstrateCompleteWorkflow() {
  console.log('🧠 Port Your Bond - Complete RunPod Integration Demo\n');

  // Check configuration
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  
  if (!apiKey || !endpointId) {
    console.error('❌ Missing RunPod configuration!');
    console.log('Please set the following environment variables:');
    console.log('- RUNPOD_API_KEY=your_api_key');
    console.log('- RUNPOD_ENDPOINT_ID=your_endpoint_id');
    console.log('\nYou can copy config.example.env to .env and fill in your credentials.');
    process.exit(1);
  }

  const client = new RunPodClient(apiKey, endpointId);

  try {
    // Step 1: Submit a job
    console.log('📤 Step 1: Submitting job to RunPod...');
    const job = await client.submitJob({
      fileURL: 'https://your-bucket/input/conversation.json',
      processingType: 'conversation_analysis',
      options: {
        chunkSize: 250,
        enableEmotionAnalysis: true,
        enableTopicTagging: true,
        generateWhisperbacks: true,
        outputFormat: 'port_bundle'
      }
    });

    console.log(`✅ Job submitted successfully!`);
    console.log(`📋 Job ID: ${job.id}`);
    console.log(`📊 Status: ${job.status}\n`);

    // Step 2: Monitor job progress
    console.log('👀 Step 2: Monitoring job progress...');
    let currentStatus = job.status;
    
    while (currentStatus === 'IN_QUEUE' || currentStatus === 'IN_PROGRESS') {
      const status = await client.getJobStatus(job.id);
      currentStatus = status.status;
      
      console.log(`📊 Current status: ${currentStatus}`);
      
      if (currentStatus === 'IN_PROGRESS') {
        console.log('⚡ Processing in progress...');
      } else if (currentStatus === 'IN_QUEUE') {
        console.log('⏳ Waiting in queue...');
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Step 3: Handle completion
    if (currentStatus === 'COMPLETED') {
      console.log('🎉 Step 3: Job completed successfully!');
      
      const finalJob = await client.getJobStatus(job.id);
      console.log('📦 Output received:', {
        bundleUrl: finalJob.output?.bundleUrl,
        processingTime: finalJob.output?.processingTime,
        statistics: finalJob.output?.statistics
      });

      // Step 4: Download and verify bundle
      console.log('\n📥 Step 4: Downloading bundle...');
      if (finalJob.output?.bundleUrl) {
        console.log(`🔗 Bundle URL: ${finalJob.output.bundleUrl}`);
        console.log('✅ Bundle ready for download!');
      }

    } else if (currentStatus === 'FAILED') {
      console.error('❌ Step 3: Job failed!');
      const failedJob = await client.getJobStatus(job.id);
      console.error('Error details:', failedJob.error);
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Additional utility functions
async function demonstrateJobCancellation() {
  console.log('\n🛑 Job Cancellation Demo');
  
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  const client = new RunPodClient(apiKey!, endpointId!);

  try {
    // Submit a job
    const job = await client.submitJob({
      fileURL: 'https://your-bucket/input/large-conversation.json',
      processingType: 'conversation_analysis'
    });

    console.log(`📋 Submitted job: ${job.id}`);

    // Wait a bit, then cancel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🛑 Cancelling job...');
    await client.cancelJob(job.id);
    
    console.log('✅ Job cancelled successfully');

  } catch (error) {
    console.error('❌ Cancellation failed:', error);
  }
}

async function demonstrateBatchProcessing() {
  console.log('\n📚 Batch Processing Demo');
  
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  const client = new RunPodClient(apiKey!, endpointId!);

  const files = [
    'https://your-bucket/input/conversation1.json',
    'https://your-bucket/input/conversation2.json',
    'https://your-bucket/input/conversation3.json'
  ];

  try {
    console.log(`📤 Submitting ${files.length} jobs...`);
    
    const jobs = await Promise.all(
      files.map(file => client.submitJob({
        fileURL: file,
        processingType: 'conversation_analysis'
      }))
    );

    console.log(`✅ Submitted ${jobs.length} jobs:`);
    jobs.forEach((job, index) => {
      console.log(`  ${index + 1}. Job ID: ${job.id}`);
    });

    // Monitor all jobs
    console.log('\n👀 Monitoring all jobs...');
    const completedJobs = await Promise.all(
      jobs.map(job => client.waitForCompletion(job.id))
    );

    console.log(`🎉 All ${completedJobs.length} jobs completed!`);

  } catch (error) {
    console.error('❌ Batch processing failed:', error);
  }
}

// Run the demos
async function main() {
  await demonstrateCompleteWorkflow();
  await demonstrateJobCancellation();
  await demonstrateBatchProcessing();
  
  console.log('\n✨ Demo completed!');
  console.log('\nNext steps:');
  console.log('1. Set up your RunPod endpoint');
  console.log('2. Configure your cloud storage');
  console.log('3. Deploy the server');
  console.log('4. Start processing conversations!');
}

main().catch(console.error);
