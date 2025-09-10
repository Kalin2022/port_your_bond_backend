# Port Your Bond

AI-powered conversation processing service for creating port bundles from various messaging platforms.

## Overview

Port Your Bond processes conversation data from multiple sources and creates enriched port bundles containing:
- Topic analysis and tagging
- Emotion analysis
- Whisperback responses
- Memory digests
- Structured conversation data

## Project Structure

```
/port_your_bond/
├── pipeline/                # All processing logic (tagging, digest, whisperbacks)
│   ├── FileParser.ts
│   ├── TopicTagger.ts
│   ├── EmotionTagger.ts
│   ├── WhisperbackSeeder.ts
│   ├── MemoryDigestBuilder.ts
│   └── PortBundleBuilder.ts
├── server/                  # Node/Express or Supabase function wrapper
│   ├── index.ts
│   ├── processRoute.ts
│   ├── stripeWebhook.ts
│   └── emailSender.ts
├── runpod/                  # Dockerfile + launch script for remote GPU processing
│   ├── Dockerfile
│   ├── launch.sh
│   └── requirements.txt
├── ui_preview/              # Optional dropzone + Stripe checkout (for manual testing)
│   ├── index.html
│   └── upload.js
├── examples/
│   ├── input_conversation.json
│   └── output_port_bundle.zip
├── manifest/
│   └── port_service_manifest.json
├── wirePipeline.ts          # Main pipeline orchestrator
├── Dockerfile               # Container configuration
├── docker-compose.yml       # Multi-service setup
└── README.md
```

## Features

- **Multi-format Support**: Parse conversations from WhatsApp, Telegram, Discord, and more
- **AI-Powered Analysis**: Topic tagging and emotion analysis using state-of-the-art models
- **Whisperback Generation**: Create contextual responses for conversation continuation
- **Memory Digests**: Generate meaningful summaries of conversation content
- **Port Bundle Creation**: Package all processed data into a structured bundle

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.10.0 (for RunPod processing)
- Docker (optional, for containerized deployment)
- GPU with >= 8GB memory (for AI processing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   pip install -r runpod/requirements.txt
   ```

### Running the Pipeline

#### Option 1: Direct Execution
```bash
# Compile TypeScript
npx tsc wirePipeline.ts --target es2020 --module commonjs --outDir .

# Run the pipeline
node wirePipeline.js
```

#### Option 2: TypeScript Direct
```bash
# Install ts-node globally
npm install -g ts-node

# Run directly
ts-node wirePipeline.ts
```

#### Option 3: Docker
```bash
# Build the Docker image
docker build -t port-your-bond .

# Run the container
docker run -v $(pwd)/your_data:/app/your_data port-your-bond
```

#### Option 4: Docker Compose
```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d
```

### Running the Service

1. Start the server:
   ```bash
   cd server
   npm start
   ```

2. Deploy GPU processing (RunPod):
   ```bash
   cd runpod
   docker build -t port-your-bond-gpu .
   ```

3. Open UI preview:
   ```bash
   open ui_preview/index.html
   ```

## Pipeline Workflow

1. **Parse** - Load conversation JSON file
2. **Chunk** - Split into manageable pieces (250 entries default)
3. **Tag Topics** - Identify themes (love, grief, tech, dreams, conflict, friendship)
4. **Tag Emotions** - Analyze emotional content (wistful, affectionate, betrayed, etc.)
5. **Generate Whisperbacks** - Create conversation continuation cues
6. **Build Digest** - Create memory summary statistics
7. **Bundle** - Package everything into a ZIP file

## API Endpoints

- `POST /process` - Process conversation files
- `POST /stripe-webhook` - Handle Stripe payment webhooks

## Supported Formats

- JSON
- CSV
- TXT
- WhatsApp exports
- Telegram exports
- Discord exports

## Docker Configuration

The project includes comprehensive Docker support:

- **Dockerfile** - Main container for pipeline processing
- **docker-compose.yml** - Multi-service setup with web interface
- **.dockerignore** - Optimized build context

## Output Files

The pipeline generates:
- `conversation_tagged.json` - Tagged conversation data
- `memory_digest.txt` - Summary statistics
- `port_seed.json` - Whisperback cues
- `PORT_BOND_BUNDLE.zip` - Complete package for SynthiSoulOS import

## License

MIT License