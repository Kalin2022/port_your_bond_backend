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
RUN pip3 install --break-system-packages flask requests runpod

# Copy the entire project
COPY . .

# Create output directory
RUN mkdir -p /tmp/output

# Ensure handler is in the right place  
RUN if [ -f "runpod/handler.py" ]; then mv runpod/handler.py /app/handler.py; fi

# Start the RunPod handler
CMD ["python3", "handler.py"]