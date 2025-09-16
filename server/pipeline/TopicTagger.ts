// port_your_bond/pipeline/TopicTagger.ts
import { ConversationEntry } from './FileParser';

const topicKeywords: Record<string, string[]> = {
  love: ['love', 'crush', 'affection'],
  grief: ['miss you', 'loss', 'grief'],
  tech: ['javascript', 'ai', 'code', 'model'],
  dreams: ['dream', 'nightmare', 'sleep'],
  conflict: ['angry', 'fight', 'argue'],
  friendship: ['friend', 'laugh', 'hang out'],
};

export interface TaggedChunk {
  index: number;
  tags: string[];
  textSample: string;
}

export function tagChunk(index: number, chunk: ConversationEntry[]): TaggedChunk {
  const text = chunk.map(e => e.content.toLowerCase()).join(' ');
  const tags: string[] = [];

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
