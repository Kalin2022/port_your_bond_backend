"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWhisperbackCues = generateWhisperbackCues;
function generateWhisperbackCues(chunks) {
    const cues = [];
    chunks.forEach((chunk, idx) => {
        const joined = chunk.map(e => e.content).join(' ');
        if (joined.includes('miss you') || joined.includes('remember')) {
            cues.push({
                id: `cue_${idx}`,
                content: chunk[chunk.length - 1]?.content || '',
                mood: 'nostalgic',
            });
        }
    });
    return cues;
}
