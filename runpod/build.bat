@echo off
REM Build script for SynthiSoul RunPod container (Windows)

echo 🚀 Building SynthiSoul RunPod container...

REM Configuration
set DOCKER_USERNAME=%DOCKER_USERNAME%
if "%DOCKER_USERNAME%"=="" set DOCKER_USERNAME=yourdockeruser

set IMAGE_NAME=synthisoul-runner
set TAG=%TAG%
if "%TAG%"=="" set TAG=latest

set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%

echo 📦 Building image: %FULL_IMAGE_NAME%

REM Build the Docker image
docker build -t %FULL_IMAGE_NAME% .

if %ERRORLEVEL% neq 0 (
    echo ❌ Docker build failed
    exit /b 1
)

echo ✅ Docker image built successfully

REM Push to registry (uncomment when ready)
REM echo 📤 Pushing to Docker registry...
REM docker push %FULL_IMAGE_NAME%

echo 🎉 Build complete!
echo 📋 Next steps:
echo 1. Test the container locally:
echo    docker run -p 8000:8000 %FULL_IMAGE_NAME%
echo.
echo 2. Push to registry:
echo    docker push %FULL_IMAGE_NAME%
echo.
echo 3. Update RunPod template with image: %FULL_IMAGE_NAME%
echo.
echo 4. Test with RunPod API:
echo    curl -X POST http://localhost:8000/ ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"inputUrl\": \"https://example.com/test.json\"}"

