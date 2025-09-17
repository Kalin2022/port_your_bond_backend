// port_your_bond/pipeline/FileParser.ts
import * as fs from 'fs';
import * as path from 'path';

export interface ConversationEntry {
  role: string;
  content: string;
  timestamp?: number;
}

export function parseConversationFile(filePath: string): ConversationEntry[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const fileExtension = path.extname(filePath).toLowerCase();

  switch (fileExtension) {
    case '.json':
      return parseJSONConversation(raw);
    case '.md':
    case '.markdown':
      return parseMarkdownConversation(raw);
    default:
      // Try JSON first, fallback to markdown
      try {
        return parseJSONConversation(raw);
      } catch {
        return parseMarkdownConversation(raw);
      }
  }
}

function parseJSONConversation(raw: string): ConversationEntry[] {
  const json = JSON.parse(raw);
  if (!Array.isArray(json)) throw new Error('Expected conversation JSON to be an array');

  return json.map((entry: any): ConversationEntry => ({
    role: entry.role || 'unknown',
    content: entry.content || '',
    timestamp: entry.timestamp || Date.now(),
  }));
}

function parseMarkdownConversation(raw: string): ConversationEntry[] {
  const entries: ConversationEntry[] = [];
  const lines = raw.split('\n');
  let currentRole = 'unknown';
  let currentContent = '';
  let timestamp = Date.now();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for role indicators (headers, bold text, etc.)
    if (line.match(/^#+\s*(user|assistant|human|ai|bot|system)/i)) {
      // Save previous entry if exists
      if (currentContent.trim()) {
        entries.push({
          role: currentRole,
          content: currentContent.trim(),
          timestamp: timestamp++
        });
      }
      // Start new entry
      currentRole = line.match(/^#+\s*(user|assistant|human|ai|bot|system)/i)?.[1].toLowerCase() || 'unknown';
      currentContent = '';
    } else if (line.match(/^\*\*(user|assistant|human|ai|bot|system)\*\*/i)) {
      // Save previous entry if exists
      if (currentContent.trim()) {
        entries.push({
          role: currentRole,
          content: currentContent.trim(),
          timestamp: timestamp++
        });
      }
      // Start new entry
      currentRole = line.match(/^\*\*(user|assistant|human|ai|bot|system)\*\*/i)?.[1].toLowerCase() || 'unknown';
      currentContent = line.replace(/^\*\*[^*]+\*\*:?\s*/, '');
    } else if (line.match(/^(user|assistant|human|ai|bot|system):/i)) {
      // Save previous entry if exists
      if (currentContent.trim()) {
        entries.push({
          role: currentRole,
          content: currentContent.trim(),
          timestamp: timestamp++
        });
      }
      // Start new entry
      const match = line.match(/^(user|assistant|human|ai|bot|system):\s*(.*)/i);
      currentRole = match?.[1].toLowerCase() || 'unknown';
      currentContent = match?.[2] || '';
    } else if (line.startsWith('---') || line.startsWith('===')) {
      // Separator - save current entry
      if (currentContent.trim()) {
        entries.push({
          role: currentRole,
          content: currentContent.trim(),
          timestamp: timestamp++
        });
        currentContent = '';
      }
    } else {
      // Continue current content
      if (line || currentContent) {
        currentContent += (currentContent ? '\n' : '') + line;
      }
    }
  }

  // Save final entry
  if (currentContent.trim()) {
    entries.push({
      role: currentRole,
      content: currentContent.trim(),
      timestamp: timestamp++
    });
  }

  // If no structured conversation found, treat as single user message
  if (entries.length === 0 && raw.trim()) {
    entries.push({
      role: 'user',
      content: raw.trim(),
      timestamp: Date.now()
    });
  }

  return entries;
}

export function chunkConversation(entries: ConversationEntry[], chunkSize = 250): ConversationEntry[][] {
  const chunks: ConversationEntry[][] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }
  return chunks;
}
