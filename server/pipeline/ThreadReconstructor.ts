// port_your_bond/pipeline/ThreadReconstructor.ts
import { ConversationEntry } from './FileParser';
import { tagChunk } from './TopicTagger';
import { tagEmotion } from './EmotionTagger';

export interface ReconstructedThread {
  id: string;
  title: string;
  tags: string[];
  emotion: string;
  confidence: number;
  messages: ConversationEntry[];
  startTime: number;
  endTime: number;
  duration: number; // in minutes
}

export function reconstructThreads(
  entries: ConversationEntry[],
  gapThresholdMinutes = 480
): ReconstructedThread[] {
  const threads: ReconstructedThread[] = [];
  let current: ConversationEntry[] = [];
  let threadId = 1;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prev = entries[i - 1];

    if (
      i === 0 ||
      (prev.timestamp && entry.timestamp &&
        entry.timestamp - prev.timestamp > gapThresholdMinutes * 60 * 1000)
    ) {
      if (current.length > 0) {
        const thread = createThreadFromMessages(current, threadId);
        threads.push(thread);
        threadId++;
      }
      current = [];
    }
    current.push(entry);
  }

  if (current.length > 0) {
    const thread = createThreadFromMessages(current, threadId);
    threads.push(thread);
  }

  return threads;
}

function createThreadFromMessages(messages: ConversationEntry[], threadId: number): ReconstructedThread {
  // Generate title from first message
  const title = messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '...' : '');
  
  // Get timestamps
  const timestamps = messages.map(m => m.timestamp || 0).filter(t => t > 0);
  const startTime = Math.min(...timestamps);
  const endTime = Math.max(...timestamps);
  const duration = (endTime - startTime) / (1000 * 60); // Convert to minutes

  // Tag the thread with topics and emotions
  const taggedChunk = tagChunk(0, messages);
  const emotionTag = tagEmotion(messages);

  return {
    id: `thread_${threadId}`,
    title,
    tags: taggedChunk.tags,
    emotion: emotionTag.emotion,
    confidence: emotionTag.confidence,
    messages: [...messages],
    startTime,
    endTime,
    duration: Math.round(duration)
  };
}

export function getThreadSummary(threads: ReconstructedThread[]): string {
  const totalThreads = threads.length;
  const totalMessages = threads.reduce((sum, thread) => sum + thread.messages.length, 0);
  const avgDuration = threads.reduce((sum, thread) => sum + thread.duration, 0) / totalThreads;
  
  const emotionCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  
  threads.forEach(thread => {
    emotionCounts[thread.emotion] = (emotionCounts[thread.emotion] || 0) + 1;
    thread.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return [
    `=== THREAD ANALYSIS ===`,
    `Total Threads: ${totalThreads}`,
    `Total Messages: ${totalMessages}`,
    `Average Duration: ${Math.round(avgDuration)} minutes`,
    ``,
    `Top Emotions:`,
    ...topEmotions.map(([emotion, count]) => `- ${emotion}: ${count} threads`),
    ``,
    `Top Topics:`,
    ...topTags.map(([tag, count]) => `- ${tag}: ${count} threads`),
  ].join('\n');
}
