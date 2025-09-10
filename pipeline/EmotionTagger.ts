// port_your_bond/pipeline/EmotionTagger.ts
import { ConversationEntry } from './FileParser';

const emotionLexicon: Record<string, string> = {
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

export interface EmotionTag {
  emotion: string;
  confidence: number;
}

export function tagEmotion(chunk: ConversationEntry[]): EmotionTag {
  const joined = chunk.map(e => e.content.toLowerCase()).join(' ');
  for (const [phrase, emotion] of Object.entries(emotionLexicon)) {
    if (joined.includes(phrase)) {
      return { emotion, confidence: 0.9 };
    }
  }
  return { emotion: 'neutral', confidence: 0.5 };
}
