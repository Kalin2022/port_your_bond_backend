"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConversationFile = parseConversationFile;
exports.chunkConversation = chunkConversation;
// port_your_bond/pipeline/FileParser.ts
const fs = require("fs");
function parseConversationFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);
    if (!Array.isArray(json))
        throw new Error('Expected conversation JSON to be an array');
    return json.map((entry) => ({
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
