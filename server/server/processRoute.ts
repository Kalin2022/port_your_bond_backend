import { Request, Response } from 'express';

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
    export const processRoute = async (req: Request, res: Response) => { ... }

})();
Object.defineProperty(exports, "__esModule", { value: true });
// port_your_bond/server/processRoute.ts
const express = __importStar(require("express"));
const multer = __importStar(require("multer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rateLimit = __importStar(require("express-rate-limit"));
const FileParser_1 = require("../pipeline/FileParser");
const TopicTagger_1 = require("../pipeline/TopicTagger");
const EmotionTagger_1 = require("../pipeline/EmotionTagger");
const WhisperbackSeeder_1 = require("../pipeline/WhisperbackSeeder");
const MemoryDigestBuilder_1 = require("../pipeline/MemoryDigestBuilder");
const ThreadReconstructor_1 = require("../pipeline/ThreadReconstructor");
const PortBundleBuilder_1 = require("../pipeline/PortBundleBuilder");
const emailSender_1 = require("./emailSender");
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
        const entries = (0, FileParser_1.parseConversationFile)(filePath);
        const chunks = (0, FileParser_1.chunkConversation)(entries);
        const topics = chunks.map((chunk, i) => (0, TopicTagger_1.tagChunk)(i, chunk));
        const emotions = chunks.map(EmotionTagger_1.tagEmotion);
        const digest = (0, MemoryDigestBuilder_1.buildMemoryDigest)(topics, emotions);
        const whisperbacks = (0, WhisperbackSeeder_1.generateWhisperbackCues)(chunks);
        const threads = (0, ThreadReconstructor_1.reconstructThreads)(entries);
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
        const zipPath = (0, PortBundleBuilder_1.buildPortBundle)(outputDir, taggedPath, seedPath, digestPath);
        await (0, emailSender_1.sendBundleEmail)(email, zipPath);
        res.status(200).json({ message: 'Bundle created and email sent!' });
    }
    catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
exports.default = router;
