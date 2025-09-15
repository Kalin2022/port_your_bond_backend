// submitRunpodJob.ts

import axios from "axios";

interface RunPodJobParams {
  inputUrl: string; // Publicly accessible URL to input file (e.g. Supabase storage)
  webhookUrl?: string; // Optional webhook to call when done
  apiKey: string;
  templateId?: string; // Use for Template-based endpoint
  endpointId?: string; // Use for Serverless endpoint
  jobParams?: Record<string, any>; // Any additional params to your container
}

export async function submitRunpodJob({
  inputUrl,
  webhookUrl,
  apiKey,
  templateId,
  endpointId,
  jobParams = {},
}: RunPodJobParams): Promise<{ jobId: string; status: string }> {
  const id = endpointId || templateId;
  if (!id) {
    throw new Error("Either endpointId or templateId must be provided.");
  }
  const endpoint = `https://api.runpod.ai/v2/${id}/run`;

  const payload = {
    input: {
      inputUrl,
      jobParams,
    },
    ...(webhookUrl && { webhook: webhookUrl }),
  };

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    return {
      jobId: response.data.id,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error("❌ Error submitting RunPod job:", error?.response?.data || error);
    throw new Error("RunPod job submission failed.");
  }
}

export async function submitRunpodServerlessJob(params: Omit<RunPodJobParams, 'templateId'> & { endpointId: string }) {
  return submitRunpodJob(params);
}

// Convenience helper: reads env vars and includes jobParams.email
export async function submitRunpodJobFromEnv(params: { inputUrl: string; userEmail: string }) {
  const apiKey = process.env.RUNPOD_API_KEY as string;
  const endpointId = process.env.RUNPOD_ENDPOINT_ID as string | undefined;
  const templateId = process.env.RUNPOD_TEMPLATE_ID as string | undefined;
  const webhookUrl = process.env.RUNPOD_WEBHOOK_URL as string | undefined;

  if (!apiKey) {
    throw new Error('Missing RUNPOD_API_KEY in environment.');
  }
  if (!endpointId && !templateId) {
    throw new Error('Provide RUNPOD_ENDPOINT_ID or RUNPOD_TEMPLATE_ID in environment.');
  }

  return submitRunpodJob({
    inputUrl: params.inputUrl,
    apiKey,
    endpointId,
    templateId,
    webhookUrl,
    jobParams: { email: params.userEmail },
  });
}
