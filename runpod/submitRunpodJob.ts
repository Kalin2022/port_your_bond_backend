// submitRunpodJob.ts

import axios from "axios";

interface RunPodJobParams {
  inputUrl: string; // Publicly accessible URL to input file (e.g. Supabase storage)
  webhookUrl?: string; // Optional webhook to call when done
  apiKey: string;
  templateId: string;
  jobParams?: Record<string, any>; // Any additional params to your container
}

export async function submitRunpodJob({
  inputUrl,
  webhookUrl,
  apiKey,
  templateId,
  jobParams = {},
}: RunPodJobParams): Promise<{ jobId: string; status: string }> {
  const endpoint = `https://api.runpod.io/v2/${templateId}/run`;

  const payload = {
    input: {
      inputUrl,
      ...jobParams,
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
