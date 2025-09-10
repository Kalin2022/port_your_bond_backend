# runpod_client.py - Python RunPod client for server-side processing
import requests
import time
import os
from typing import Dict, Any, Optional

class RunPodClient:
    def __init__(self, api_key: str, endpoint_id: str):
        self.api_key = api_key
        self.endpoint_id = endpoint_id
        self.base_url = 'https://api.runpod.io/v2'
    
    def submit_job(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit a job to RunPod endpoint"""
        url = f"{self.base_url}/{self.endpoint_id}/run"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json={'input': input_data}, headers=headers)
        response.raise_for_status()
        return response.json()
    
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a job"""
        url = f"{self.base_url}/{self.endpoint_id}/status/{job_id}"
        headers = {'Authorization': f'Bearer {self.api_key}'}
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    def wait_for_completion(self, job_id: str, poll_interval: int = 5) -> Dict[str, Any]:
        """Wait for job completion with polling"""
        while True:
            job = self.get_job_status(job_id)
            status = job.get('status')
            
            if status == 'COMPLETED':
                return job
            elif status == 'FAILED':
                raise Exception(f"Job failed: {job.get('error', 'Unknown error')}")
            
            time.sleep(poll_interval)
    
    def cancel_job(self, job_id: str) -> None:
        """Cancel a running job"""
        url = f"{self.base_url}/{self.endpoint_id}/cancel/{job_id}"
        headers = {'Authorization': f'Bearer {self.api_key}'}
        
        response = requests.post(url, headers=headers)
        response.raise_for_status()

# Example usage
def process_conversation_with_runpod(file_url: str) -> Dict[str, Any]:
    """Process conversation using RunPod GPU processing"""
    api_key = os.getenv('RUNPOD_API_KEY')
    endpoint_id = os.getenv('RUNPOD_ENDPOINT_ID')
    
    if not api_key or not endpoint_id:
        raise ValueError("RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID must be set")
    
    client = RunPodClient(api_key, endpoint_id)
    
    print("🚀 Submitting job to RunPod...")
    job = client.submit_job({
        'fileURL': file_url,
        'processingType': 'conversation_analysis'
    })
    
    print(f"📋 Job ID: {job['id']}")
    print("⏳ Waiting for completion...")
    
    completed_job = client.wait_for_completion(job['id'])
    print("✅ Job completed successfully!")
    
    return completed_job['output']
