"use strict";
// submitRunpodJob.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRunpodJob = submitRunpodJob;
exports.submitRunpodServerlessJob = submitRunpodServerlessJob;
exports.submitRunpodJobFromEnv = submitRunpodJobFromEnv;
const axios_1 = __importDefault(require("axios"));
async function submitRunpodJob({ inputUrl, webhookUrl, apiKey, templateId, endpointId, jobParams = {}, }) {
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
        const response = await axios_1.default.post(endpoint, payload, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
        return {
            jobId: response.data.id,
            status: response.data.status,
        };
    }
    catch (error) {
        console.error("❌ Error submitting RunPod job:", error?.response?.data || error);
        throw new Error("RunPod job submission failed.");
    }
}
async function submitRunpodServerlessJob(params) {
    return submitRunpodJob(params);
}
// Convenience helper: reads env vars and includes jobParams.email
async function submitRunpodJobFromEnv(params) {
    const apiKey = process.env.RUNPOD_API_KEY;
    const endpointId = process.env.RUNPOD_ENDPOINT_ID;
    const templateId = process.env.RUNPOD_TEMPLATE_ID;
    const webhookUrl = process.env.RUNPOD_WEBHOOK_URL;
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
