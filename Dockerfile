# Dockerfile
FROM node:18

# Install system dependencies
RUN apt update && apt install -y zip

# Set working directory
WORKDIR /app

# Copy all code
COPY . .

# Install dependencies
RUN npm install -g ts-node typescript
RUN npm install

# Entry point
CMD ["ts-node", "wirePipeline.ts"]
