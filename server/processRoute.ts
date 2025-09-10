// port_your_bond/server/processRoute.ts
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
import { parseConversationFile, chunkConversation } from '../pipeline/FileParser';
import { tagChunk } from '../pipeline/TopicTagger';
import { tagEmotion } from '../pipeline/EmotionTagger';
import { generateWhisperbackCues } from '../pipeline/WhisperbackSeeder';
import { buildMemoryDigest } from '../pipeline/MemoryDigestBuilder';
import { reconstructThreads } from '../pipeline/ThreadReconstructor';
import { buildPortBundle } from '../pipeline/PortBundleBuilder';
import { sendBundleEmail } from './emailSender';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const portLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per 15 minutes
  message: '⏳ Too many requests. Please try again later.',
});

router.post('/start-port', portLimiter, upload.single('file'), async (req, res) => {
  try {
    const email = req.body.email;
    const filePath = req.file?.path;
    if (!filePath || !email) {
      return res.status(400).json({ error: 'Missing file or email.' });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const entries = parseConversationFile(filePath);
    const chunks = chunkConversation(entries);
    const topics = chunks.map((chunk, i) => tagChunk(i, chunk));
    const emotions = chunks.map(tagEmotion);
    const digest = buildMemoryDigest(topics, emotions);
    const whisperbacks = generateWhisperbackCues(chunks);
    const threads = reconstructThreads(entries);

    const outputDir = path.resolve('outputs');
    fs.mkdirSync(outputDir, { recursive: true });

    const taggedPath = path.join(outputDir, 'conversation_tagged.json');
    const seedPath = path.join(outputDir, 'port_seed.json');
    const digestPath = path.join(outputDir, 'memory_digest.txt');
    const threadPath = path.join(outputDir, 'thread_library.json');

    fs.writeFileSync(taggedPath, JSON.stringify({ chunks: topics, emotions }, null, 2));
    fs.writeFileSync(seedPath, JSON.stringify({ entries: entries.slice(0, 10) }, null, 2));
    fs.writeFileSync(digestPath, digest);
    fs.writeFileSync(threadPath, JSON.stringify(threads, null, 2));

    const zipPath = buildPortBundle(outputDir, taggedPath, seedPath, digestPath);
    await sendBundleEmail(email, zipPath);

    res.status(200).json({ message: 'Bundle created and email sent!' });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;