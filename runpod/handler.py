#!/usr/bin/env python3
"""
RunPod Serverless Handler for SynthiSoul Pipeline Processing
Uses the RunPod SDK to properly handle serverless jobs
"""

import base64
import json
import os
import subprocess
import tempfile

import requests
import runpod


TMPFILES_UPLOAD_URL = "https://tmpfiles.org/api/v1/upload"


def upload_bundle(bundle_path: str) -> tuple[str | None, str | None]:
    """Upload generated bundle to tmpfiles.org and return download, delete URLs."""
    try:
        with open(bundle_path, 'rb') as bundle_file:
            files = {'file': (os.path.basename(bundle_path), bundle_file)}
            response = requests.post(TMPFILES_UPLOAD_URL, files=files, timeout=60)
            response.raise_for_status()

        data = response.json().get('data', {})
        url = data.get('dl_url') or data.get('url')
        delete_url = data.get('delete_url')

        if url and '/dl/' not in url:
            url = url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')

        if not url:
            print("❌ tmpfiles response missing download URL", flush=True)
            return None, None

        print(f"📤 Bundle uploaded to tmpfiles: {url}")
        return url, delete_url
    except Exception as exc:
        print(f"❌ Failed to upload bundle: {exc}", flush=True)
        return None, None

def download_file(url: str, local_path: str) -> bool:
    """Download file from URL to local path"""
    try:
        print(f"📥 Downloading from: {url}")
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        print(f"✅ Download successful, size: {len(response.content)} bytes")
        
        with open(local_path, 'wb') as f:
            f.write(response.content)
        print(f"✅ File saved to: {local_path}")
        return True
    except Exception as e:
        print(f"❌ Failed to download file: {e}", flush=True)
        return False

def run_pipeline(input_file: str, output_dir: str) -> dict:
    """Run the SynthiSoul pipeline on the input file"""
    try:
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Run the pipeline using the compiled JavaScript
        cmd = [
            'node', 'wirePipeline.js',
            '--input', input_file,
            '--output', output_dir
        ]
        
        print(f"🚀 Running pipeline: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            return {
                'success': False,
                'error': result.stderr,
                'stdout': result.stdout
            }
        
        # Look for the generated bundle
        bundle_path = os.path.join(output_dir, 'PORT_BOND_BUNDLE.zip')
        if os.path.exists(bundle_path):
            return {
                'success': True,
                'bundle_path': bundle_path,
                'bundle_size': os.path.getsize(bundle_path),
                'stdout': result.stdout
            }
        else:
            return {
                'success': False,
                'error': 'Bundle file not found after processing',
                'stdout': result.stdout
            }
            
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Pipeline processing timed out'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def process_pipeline_job(job):
    """Process a single pipeline job - the handler function RunPod expects"""
    try:
        # Extract input data
        input_data = job.get('input', {})
        
        file_url = input_data.get('fileUrl')
        email = input_data.get('email', 'unknown@example.com')
        timestamp = input_data.get('timestamp', 'unknown')
        
        if not file_url:
            return {
                'status': 'error',
                'error': 'fileUrl is required in input'
            }
        
        print(f"📧 Processing request for {email} at {timestamp}")
        print(f"🔗 Input URL: {file_url}")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            input_file = os.path.join(temp_dir, 'conversation.json')
            output_dir = os.path.join(temp_dir, 'output')
            
            # Download the input file
            print("⬇️ Downloading input file...", flush=True)
            if not download_file(file_url, input_file):
                print("❌ Download failed, returning error", flush=True)
                return {
                    'status': 'error',
                    'error': 'Failed to download input file'
                }
            print("✅ File download completed, proceeding to validation", flush=True)
            
            # Verify the file is valid JSON
            try:
                print("🔍 Validating JSON...", flush=True)
                with open(input_file, 'r') as f:
                    json.load(f)
                print("✅ Input file is valid JSON", flush=True)
            except json.JSONDecodeError as e:
                print(f"❌ JSON validation failed: {e}", flush=True)
                return {
                    'status': 'error',
                    'error': f'Invalid JSON file: {e}'
                }
            
            # Run the pipeline
            print("🧠 Running SynthiSoul pipeline...")
            result = run_pipeline(input_file, output_dir)
            
            if not result['success']:
                print(f"❌ Pipeline failed: {result['error']}")
                return {
                    'status': 'error',
                    'error': result['error'],
                    'stdout': result.get('stdout', '')
                }
            
            # Return the bundle data
            bundle_size = result['bundle_size']
            bundle_path = result['bundle_path']
            print(f"✅ Pipeline completed successfully. Bundle size: {bundle_size} bytes")

            bundle_url, delete_url = upload_bundle(bundle_path)
            if not bundle_url:
                return {
                    'status': 'error',
                    'error': 'Failed to upload bundle',
                    'stdout': result.get('stdout', '')
                }

            with open(bundle_path, 'rb') as bundle_file:
                bundle_base64 = base64.b64encode(bundle_file.read()).decode('utf-8')

            return {
                'status': 'completed',
                'bundle_base64': bundle_base64,
                'bundle_size': bundle_size,
                'zipUrl': bundle_url,
                'zipDeleteUrl': delete_url,
                'email': email,
                'timestamp': timestamp,
                'stdout': result.get('stdout', '')
            }
            
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {
            'status': 'error',
            'error': str(e)
        }

# Start the RunPod serverless handler
print("🚀 Starting SynthiSoul Pipeline Serverless Handler...")
print(f"📁 Working directory: {os.getcwd()}")
print(f"📋 Available files: {os.listdir('.')}")

# This starts the RunPod worker loop
runpod.serverless.start({"handler": process_pipeline_job})

