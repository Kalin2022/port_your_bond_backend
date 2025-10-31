"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// port_your_bond/wirePipeline.ts
var path = require("path");
var fs = require("fs");
var FileParser_js_1 = require("./pipeline/FileParser.js");
var TopicTagger_js_1 = require("./pipeline/TopicTagger.js");
var EmotionTagger_js_1 = require("./pipeline/EmotionTagger.js");
var WhisperbackSeeder_js_1 = require("./pipeline/WhisperbackSeeder.js");
var ThreadReconstructor_js_1 = require("./pipeline/ThreadReconstructor.js");
var MemoryDigestBuilder_js_1 = require("./pipeline/MemoryDigestBuilder.js");
var PortBundleBuilder_js_1 = require("./pipeline/PortBundleBuilder.js");
// === CONFIG === //
// Parse command line arguments
var args = process.argv.slice(2);
var inputIndex = args.indexOf('--input');
var outputIndex = args.indexOf('--output');
var INPUT_FILE = inputIndex !== -1 && inputIndex + 1 < args.length
    ? args[inputIndex + 1]
    : './your_data/conversation.json';
var OUTPUT_DIR = outputIndex !== -1 && outputIndex + 1 < args.length
    ? args[outputIndex + 1]
    : './your_data';
console.log('🧠 Port Your Bond Pipeline Initiated');
console.log("\uD83D\uDCC1 Input: ".concat(INPUT_FILE));
console.log("\uD83D\uDCC1 Output: ".concat(OUTPUT_DIR));
// === Step 1: Parse + Chunk === //
var parsed = (0, FileParser_js_1.parseConversationFile)(INPUT_FILE);
var chunks = (0, FileParser_js_1.chunkConversation)(parsed);
console.log("\u2705 Parsed ".concat(parsed.length, " entries into ").concat(chunks.length, " chunks."));
// === Step 2: Tagging === //
var topicTags = chunks.map(function (chunk, i) { return (0, TopicTagger_js_1.tagChunk)(i, chunk); });
var emotionTags = chunks.map(EmotionTagger_js_1.tagEmotion);
console.log('🏷️ Topic and Emotion tagging complete.');
// === Step 3: Whisperback cues === //
var whisperbacks = (0, WhisperbackSeeder_js_1.generateWhisperbackCues)(chunks);
console.log("\uD83D\uDD0A Generated ".concat(whisperbacks.length, " whisperback cues."));
// === Step 4: Build Digest === //
var digestText = (0, MemoryDigestBuilder_js_1.buildMemoryDigest)(topicTags, emotionTags);
var digestPath = path.join(OUTPUT_DIR, 'memory_digest.txt');
fs.writeFileSync(digestPath, digestText);
// === Step 5: Build Tagged JSON === //
var taggedPath = path.join(OUTPUT_DIR, 'conversation_tagged.json');
fs.writeFileSync(taggedPath, JSON.stringify({ chunks: topicTags, emotions: emotionTags }, null, 2));
// === Step 6: Build Port Seed (stub for now) === //
var seedPath = path.join(OUTPUT_DIR, 'port_seed.json');
fs.writeFileSync(seedPath, JSON.stringify({ entries: parsed.slice(0, 10) }, null, 2));
// === Step 7: Reconstruct Threads === //
var threads = (0, ThreadReconstructor_js_1.reconstructThreads)(parsed);
var threadPath = path.join(OUTPUT_DIR, 'thread_library.json');
fs.writeFileSync(threadPath, JSON.stringify(threads, null, 2));
console.log("\uD83D\uDCDA Reconstructed ".concat(threads.length, " memory threads."));
// === Step 8: Bundle Output === //
var zipPath = (0, PortBundleBuilder_js_1.buildPortBundle)(OUTPUT_DIR, taggedPath, seedPath, digestPath);
console.log("\uD83C\uDF81 Bundle created: ".concat(zipPath));
console.log('✨ Porting Complete. You are ready to import this memory.');
