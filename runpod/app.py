#!/usr/bin/env python3
"""
RunPod Container App for SynthiSoul Pipeline Processing
Handles HTTP requests from RunPod and processes conversation files
"""

from flask import Flask, request, jsonify
import subprocess
import os
import requests
import json
import tempfile
import shutil
from pathlib import Path

app = Flask(__name__)

def download_file(url: str, local_path: str) -> bool:
    """Download file from URL to local path"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(local_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"❌ Failed to download file: {e}")
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

@app.route('/', methods=['POST'])
def process_pipeline():
    """Main endpoint for processing conversation files"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        input_url = data.get('inputUrl')
        if not input_url:
            return jsonify({'error': 'inputUrl is required'}), 400
        
        # Extract additional parameters
        email = data.get('email', 'unknown@example.com')
        timestamp = data.get('timestamp', 'unknown')
        
        print(f"📧 Processing request for {email} at {timestamp}")
        print(f"🔗 Input URL: {input_url}")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            input_file = os.path.join(temp_dir, 'conversation.json')
            output_dir = os.path.join(temp_dir, 'output')
            
            # Download the input file
            print("⬇️ Downloading input file...")
            if not download_file(input_url, input_file):
                return jsonify({'error': 'Failed to download input file'}), 400
            
            # Verify the file is valid JSON
            try:
                with open(input_file, 'r') as f:
                    json.load(f)
                print("✅ Input file is valid JSON")
            except json.JSONDecodeError as e:
                return jsonify({'error': f'Invalid JSON file: {e}'}), 400
            
            # Run the pipeline
            print("🧠 Running SynthiSoul pipeline...")
            result = run_pipeline(input_file, output_dir)
            
            if not result['success']:
                print(f"❌ Pipeline failed: {result['error']}")
                return jsonify({
                    'status': 'failed',
                    'error': result['error'],
                    'stdout': result.get('stdout', '')
                }), 500
            
            # Upload the bundle to a public location
            bundle_path = result['bundle_path']
            bundle_size = os.path.getsize(bundle_path)
            print(f"✅ Pipeline completed successfully. Bundle size: {bundle_size} bytes")
            
            # For now, return the bundle path (in production, upload to cloud storage)
            return jsonify({
                'status': 'completed',
                'bundle_path': bundle_path,
                'bundle_size': bundle_size,
                'email': email,
                'timestamp': timestamp,
                'stdout': result.get('stdout', '')
            })
            
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for RunPod"""
    return jsonify({
        'status': 'healthy',
        'service': 'synthisoul-pipeline',
        'version': '1.0.0'
    })

@app.route('/status', methods=['GET'])
def status():
    """Status endpoint with system information"""
    return jsonify({
        'status': 'running',
        'node_version': subprocess.check_output(['node', '--version']).decode().strip(),
        'python_version': subprocess.check_output(['python3', '--version']).decode().strip(),
        'working_directory': os.getcwd(),
        'available_files': os.listdir('.')
    })

if __name__ == '__main__':
    print("🚀 Starting SynthiSoul Pipeline Container...")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"📋 Available files: {os.listdir('.')}")
    
    app.run(host='0.0.0.0', port=8000, debug=False)

