#!/bin/bash

# Build script for SynthiSoul RunPod container
set -e

echo "🚀 Building SynthiSoul RunPod container..."

# Configuration
DOCKER_USERNAME=${DOCKER_USERNAME:-"yourdockeruser"}
IMAGE_NAME="synthisoul-runner"
TAG=${TAG:-"latest"}
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

echo "📦 Building image: ${FULL_IMAGE_NAME}"

# Build the Docker image
docker build -t "${FULL_IMAGE_NAME}" .

echo "✅ Docker image built successfully"

# Push to registry (uncomment when ready)
# echo "📤 Pushing to Docker registry..."
# docker push "${FULL_IMAGE_NAME}"

echo "🎉 Build complete!"
echo "📋 Next steps:"
echo "1. Test the container locally:"
echo "   docker run -p 8000:8000 ${FULL_IMAGE_NAME}"
echo ""
echo "2. Push to registry:"
echo "   docker push ${FULL_IMAGE_NAME}"
echo ""
echo "3. Update RunPod template with image: ${FULL_IMAGE_NAME}"
echo ""
echo "4. Test with RunPod API:"
echo "   curl -X POST http://localhost:8000/ \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"inputUrl\": \"https://example.com/test.json\"}'"

