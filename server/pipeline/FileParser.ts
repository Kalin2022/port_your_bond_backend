// port_your_bond/pipeline/FileParser.ts
import * as fs from 'fs';

export interface ConversationEntry {
  role: string;
  content: string;
  timestamp?: number;
}

export function parseConversationFile(filePath: string): ConversationEntry[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  
  // Handle both direct array format and wrapped format
  let messages: any[] = [];
  
  if (Array.isArray(json)) {
    // Direct array of messages
    messages = json;
  } else if (json.conversations && Array.isArray(json.conversations)) {
    // OpenAI export format: { conversations: [{ messages: [...] }] }
    for (const conv of json.conversations) {
      if (conv.messages && Array.isArray(conv.messages)) {
        messages.push(...conv.messages);
      }
    }
  } else {
    throw new Error('Expected conversation JSON to be an array or have conversations array');
  }

  return messages.map((entry: any): ConversationEntry => ({
    role: entry.role || 'unknown',
    content: entry.content || '',
    timestamp: entry.timestamp || Date.now(),
  }));
}

export function chunkConversation(entries: ConversationEntry[], chunkSize = 250): ConversationEntry[][] {
  const chunks: ConversationEntry[][] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }
  return chunks;
}
