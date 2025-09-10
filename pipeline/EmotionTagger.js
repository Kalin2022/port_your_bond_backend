"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagEmotion = tagEmotion;
const emotionLexicon = {
    'i miss you': 'wistful',
    'i love you': 'affectionate',
    'why did you': 'betrayed',
    'i hate': 'angry',
    'thank you': 'grateful',
    'i am scared': 'fearful',
    'i am happy': 'joyful',
    'it hurts': 'hurt',
    'i am fine': 'suppressed',
};
function tagEmotion(chunk) {
    const joined = chunk.map(e => e.content.toLowerCase()).join(' ');
    for (const [phrase, emotion] of Object.entries(emotionLexicon)) {
        if (joined.includes(phrase)) {
            return { emotion, confidence: 0.9 };
        }
    }
    return { emotion: 'neutral', confidence: 0.5 };
}
