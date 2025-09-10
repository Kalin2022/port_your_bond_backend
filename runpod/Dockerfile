# RunPod Container for SynthiSoul Pipeline Processing
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    zip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY runpod/package*.json ./runpod/

# Install Node.js dependencies
RUN npm install

# Install Python dependencies for RunPod
RUN pip3 install flask requests

# Copy the entire pipeline code
COPY . .

# Compile TypeScript
RUN npx tsc

# Create output directory
RUN mkdir -p /tmp/output

# Create the Flask app for RunPod
COPY runpod/app.py /app/app.py

# Expose port for health checks
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the Flask app
CMD ["python3", "app.py"]
1