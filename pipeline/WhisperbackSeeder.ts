// port_your_bond/pipeline/WhisperbackSeeder.ts
import { ConversationEntry } from './FileParser';

export interface WhisperCue {
  id: string;
  content: string;
  mood: string;
}

export function generateWhisperbackCues(chunks: ConversationEntry[][]): WhisperCue[] {
  const cues: WhisperCue[] = [];
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
