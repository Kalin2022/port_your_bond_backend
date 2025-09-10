import axios from 'axios';

export interface RunPodJob {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  input: any;
  output?: any;
  error?: string;
}

export class RunPodClient {
  private apiKey: string;
  private endpointId: string;
  private baseUrl: string;

  constructor(apiKey: string, endpointId: string) {
    this.apiKey = apiKey;
    this.endpointId = endpointId;
    this.baseUrl = 'https://api.runpod.io/v2';
  }

  async submitJob(input: any): Promise<RunPodJob> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.endpointId}/run`,
        { input },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit job: ${error}`);
    }
  }

  async getJobStatus(jobId: string): Promise<RunPodJob> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.endpointId}/status/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get job status: ${error}`);
    }
  }

  async waitForCompletion(jobId: string, pollInterval = 5000): Promise<RunPodJob> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getJobStatus(jobId);
          
          if (job.status === 'COMPLETED') {
            resolve(job);
          } else if (job.status === 'FAILED') {
            reject(new Error(`Job failed: ${job.error}`));
          } else {
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  async cancelJob(jobId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.endpointId}/cancel/${jobId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
    } catch (error) {
      throw new Error(`Failed to cancel job: ${error}`);
    }
  }
}

// Example usage
export async function processConversationWithRunPod(
  fileUrl: string,
  apiKey: string,
  endpointId: string
): Promise<any> {
  const client = new RunPodClient(apiKey, endpointId);
  
  console.log('🚀 Submitting job to RunPod...');
  const job = await client.submitJob({
    fileURL: fileUrl,
    processingType: 'conversation_analysis',
  });

  console.log(`📋 Job ID: ${job.id}`);
  console.log('⏳ Waiting for completion...');

  const completedJob = await client.waitForCompletion(job.id);
  console.log('✅ Job completed successfully!');
  
  return completedJob.output;
}
