// port_your_bond/wirePipeline.ts
import * as path from 'path';
import * as fs from 'fs';
import {
  parseConversationFile,
  chunkConversation,
  ConversationEntry,
} from './pipeline/FileParser.js';
import { tagChunk, TaggedChunk } from './pipeline/TopicTagger.js';
import { tagEmotion, EmotionTag } from './pipeline/EmotionTagger.js';
import { generateWhisperbackCues } from './pipeline/WhisperbackSeeder.js';
import { reconstructThreads, ReconstructedThread } from './pipeline/ThreadReconstructor.js';
import { buildMemoryDigest } from './pipeline/MemoryDigestBuilder.js';
import { buildPortBundle } from './pipeline/PortBundleBuilder.js';

// === CONFIG === //
const INPUT_FILE = './your_data/conversation.json';
const OUTPUT_DIR = './your_data';

console.log('🧠 Port Your Bond Pipeline Initiated');

// === Step 1: Parse + Chunk === //
const parsed: ConversationEntry[] = parseConversationFile(INPUT_FILE);
const chunks = chunkConversation(parsed);
console.log(`✅ Parsed ${parsed.length} entries into ${chunks.length} chunks.`);

// === Step 2: Tagging === //
const topicTags: TaggedChunk[] = chunks.map((chunk, i) => tagChunk(i, chunk));
const emotionTags: EmotionTag[] = chunks.map(tagEmotion);
console.log('🏷️ Topic and Emotion tagging complete.');

// === Step 3: Whisperback cues === //
const whisperbacks = generateWhisperbackCues(chunks);
console.log(`🔊 Generated ${whisperbacks.length} whisperback cues.`);

// === Step 4: Build Digest === //
const digestText = buildMemoryDigest(topicTags, emotionTags);
const digestPath = path.join(OUTPUT_DIR, 'memory_digest.txt');
fs.writeFileSync(digestPath, digestText);

// === Step 5: Build Tagged JSON === //
const taggedPath = path.join(OUTPUT_DIR, 'conversation_tagged.json');
fs.writeFileSync(taggedPath, JSON.stringify({ chunks: topicTags, emotions: emotionTags }, null, 2));

// === Step 6: Build Port Seed (stub for now) === //
const seedPath = path.join(OUTPUT_DIR, 'port_seed.json');
fs.writeFileSync(seedPath, JSON.stringify({ entries: parsed.slice(0, 10) }, null, 2));

// === Step 7: Reconstruct Threads === //
const threads: ReconstructedThread[] = reconstructThreads(parsed);
const threadPath = path.join(OUTPUT_DIR, 'thread_library.json');
fs.writeFileSync(threadPath, JSON.stringify(threads, null, 2));
console.log(`📚 Reconstructed ${threads.length} memory threads.`);

// === Step 8: Bundle Output === //
const zipPath = buildPortBundle(OUTPUT_DIR, taggedPath, seedPath, digestPath);
console.log(`🎁 Bundle created: ${zipPath}`);
console.log('✨ Porting Complete. You are ready to import this memory.');
