"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagChunk = tagChunk;
const topicKeywords = {
    love: ['love', 'crush', 'affection'],
    grief: ['miss you', 'loss', 'grief'],
    tech: ['javascript', 'ai', 'code', 'model'],
    dreams: ['dream', 'nightmare', 'sleep'],
    conflict: ['angry', 'fight', 'argue'],
    friendship: ['friend', 'laugh', 'hang out'],
};
function tagChunk(index, chunk) {
    const text = chunk.map(e => e.content.toLowerCase()).join(' ');
    const tags = [];
    for (const [tag, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            tags.push(tag);
        }
    }
    return {
        index,
        tags,
        textSample: chunk[0]?.content.slice(0, 100) || '',
    };
}
