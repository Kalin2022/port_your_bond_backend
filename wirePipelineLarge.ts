// wirePipelineLarge.ts - Optimized for large files (40MB+)
import * as path from 'path';
import * as fs from 'fs';
import {
  parseConversationFile,
  chunkConversation,
  ConversationEntry,
} from './pipeline/FileParser';
import { tagChunk, TaggedChunk } from './pipeline/TopicTagger';
import { tagEmotion, EmotionTag } from './pipeline/EmotionTagger';
import { generateWhisperbackCues } from './pipeline/WhisperbackSeeder';
import { reconstructThreads, ReconstructedThread } from './pipeline/ThreadReconstructor';
import { buildMemoryDigest } from './pipeline/MemoryDigestBuilder';
import { buildPortBundle } from './pipeline/PortBundleBuilder';

// === CONFIG FOR LARGE FILES === //
const INPUT_FILE = './your_data/conversation.json';
const OUTPUT_DIR = './your_data';
const CHUNK_SIZE = 1000; // Larger chunks for better performance
const BATCH_SIZE = 50; // Process in batches to avoid memory issues

console.log('🧠 Port Your Bond Pipeline (Large File Mode) Initiated');

// === Step 1: Parse + Chunk === //
console.log('📖 Reading large file...');
const parsed: ConversationEntry[] = parseConversationFile(INPUT_FILE);
const chunks = chunkConversation(parsed, CHUNK_SIZE);
console.log(`✅ Parsed ${parsed.length} entries into ${chunks.length} chunks.`);

// === Step 2: Batch Processing === //
console.log('🔄 Processing in batches...');
const topicTags: TaggedChunk[] = [];
const emotionTags: EmotionTag[] = [];

for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  console.log(`📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)}`);
  
  // Process batch
  const batchTopicTags = batch.map((chunk, idx) => tagChunk(i + idx, chunk));
  const batchEmotionTags = batch.map(tagEmotion);
  
  topicTags.push(...batchTopicTags);
  emotionTags.push(...batchEmotionTags);
}

console.log('🏷️ Topic and Emotion tagging complete.');

// === Step 3: Whisperback cues === //
console.log('🔊 Generating whisperback cues...');
const whisperbacks = generateWhisperbackCues(chunks);
console.log(`🔊 Generated ${whisperbacks.length} whisperback cues.`);

// === Step 4: Build Digest === //
console.log('📊 Building memory digest...');
const digestText = buildMemoryDigest(topicTags, emotionTags);
const digestPath = path.join(OUTPUT_DIR, 'memory_digest.txt');
fs.writeFileSync(digestPath, digestText);

// === Step 5: Build Tagged JSON === //
console.log('💾 Saving tagged conversation...');
const taggedPath = path.join(OUTPUT_DIR, 'conversation_tagged.json');
fs.writeFileSync(taggedPath, JSON.stringify({ chunks: topicTags, emotions: emotionTags }, null, 2));

// === Step 6: Build Port Seed === //
console.log('🌱 Building port seed...');
const seedPath = path.join(OUTPUT_DIR, 'port_seed.json');
fs.writeFileSync(seedPath, JSON.stringify({ entries: parsed.slice(0, 100) }, null, 2));

// === Step 7: Reconstruct Threads === //
console.log('🧵 Reconstructing threads...');
const threads: ReconstructedThread[] = reconstructThreads(parsed);
const threadPath = path.join(OUTPUT_DIR, 'thread_library.json');
fs.writeFileSync(threadPath, JSON.stringify(threads, null, 2));
console.log(`📚 Reconstructed ${threads.length} memory threads.`);

// === Step 8: Bundle Output === //
console.log('📦 Creating bundle...');
const zipPath = buildPortBundle(OUTPUT_DIR, taggedPath, seedPath, digestPath, threadPath);
console.log(`🎁 Bundle created: ${zipPath}`);
console.log('✨ Porting Complete. You are ready to import this memory.');
