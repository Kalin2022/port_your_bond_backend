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
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConversationFile = parseConversationFile;
exports.chunkConversation = chunkConversation;
// port_your_bond/pipeline/FileParser.ts
const fs = __importStar(require("fs"));
function parseConversationFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);
    // Handle both direct array format and wrapped format
    let messages = [];
    if (Array.isArray(json)) {
        // Direct array of messages
        messages = json;
    }
    else if (json.conversations && Array.isArray(json.conversations)) {
        // OpenAI export format: { conversations: [{ messages: [...] }] }
        for (const conv of json.conversations) {
            if (conv.messages && Array.isArray(conv.messages)) {
                messages.push(...conv.messages);
            }
        }
    }
    else {
        throw new Error('Expected conversation JSON to be an array or have conversations array');
    }
    return messages.map((entry) => ({
        role: entry.role || 'unknown',
        content: entry.content || '',
        timestamp: entry.timestamp || Date.now(),
    }));
}
function chunkConversation(entries, chunkSize = 250) {
    const chunks = [];
    for (let i = 0; i < entries.length; i += chunkSize) {
        chunks.push(entries.slice(i, i + chunkSize));
    }
    return chunks;
}
