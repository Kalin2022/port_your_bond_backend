"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// port_your_bond/wirePipeline.ts
const path = require("path");
const fs = require("fs");
const FileParser_1 = require("./pipeline/FileParser");
const TopicTagger_1 = require("./pipeline/TopicTagger");
const EmotionTagger_1 = require("./pipeline/EmotionTagger");
const WhisperbackSeeder_1 = require("./pipeline/WhisperbackSeeder");
const ThreadReconstructor_1 = require("./pipeline/ThreadReconstructor");
const MemoryDigestBuilder_1 = require("./pipeline/MemoryDigestBuilder");
const PortBundleBuilder_1 = require("./pipeline/PortBundleBuilder");
// === CONFIG === //
const INPUT_FILE = './your_data/conversation.json';
const OUTPUT_DIR = './your_data';
console.log('🧠 Port Your Bond Pipeline Initiated');
// === Step 1: Parse + Chunk === //
const parsed = (0, FileParser_1.parseConversationFile)(INPUT_FILE);
const chunks = (0, FileParser_1.chunkConversation)(parsed);
console.log(`✅ Parsed ${parsed.length} entries into ${chunks.length} chunks.`);
// === Step 2: Tagging === //
const topicTags = chunks.map((chunk, i) => (0, TopicTagger_1.tagChunk)(i, chunk));
const emotionTags = chunks.map(EmotionTagger_1.tagEmotion);
console.log('🏷️ Topic and Emotion tagging complete.');
// === Step 3: Whisperback cues === //
const whisperbacks = (0, WhisperbackSeeder_1.generateWhisperbackCues)(chunks);
console.log(`🔊 Generated ${whisperbacks.length} whisperback cues.`);
// === Step 4: Build Digest === //
const digestText = (0, MemoryDigestBuilder_1.buildMemoryDigest)(topicTags, emotionTags);
const digestPath = path.join(OUTPUT_DIR, 'memory_digest.txt');
fs.writeFileSync(digestPath, digestText);
// === Step 5: Build Tagged JSON === //
const taggedPath = path.join(OUTPUT_DIR, 'conversation_tagged.json');
fs.writeFileSync(taggedPath, JSON.stringify({ chunks: topicTags, emotions: emotionTags }, null, 2));
// === Step 6: Build Port Seed (stub for now) === //
const seedPath = path.join(OUTPUT_DIR, 'port_seed.json');
fs.writeFileSync(seedPath, JSON.stringify({ entries: parsed.slice(0, 10) }, null, 2));
// === Step 7: Reconstruct Threads === //
const threads = (0, ThreadReconstructor_1.reconstructThreads)(parsed);
const threadPath = path.join(OUTPUT_DIR, 'thread_library.json');
fs.writeFileSync(threadPath, JSON.stringify(threads, null, 2));
console.log(`📚 Reconstructed ${threads.length} memory threads.`);
// === Step 8: Bundle Output === //
const zipPath = (0, PortBundleBuilder_1.buildPortBundle)(OUTPUT_DIR, taggedPath, seedPath, digestPath);
console.log(`🎁 Bundle created: ${zipPath}`);
console.log('✨ Porting Complete. You are ready to import this memory.');
