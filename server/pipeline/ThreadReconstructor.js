"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconstructThreads = reconstructThreads;
exports.getThreadSummary = getThreadSummary;
const TopicTagger_1 = require("./TopicTagger");
const EmotionTagger_1 = require("./EmotionTagger");
function reconstructThreads(entries, gapThresholdMinutes = 480) {
    const threads = [];
    let current = [];
    let threadId = 1;
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const prev = entries[i - 1];
        if (i === 0 ||
            (prev.timestamp && entry.timestamp &&
                entry.timestamp - prev.timestamp > gapThresholdMinutes * 60 * 1000)) {
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
function createThreadFromMessages(messages, threadId) {
    // Generate title from first message
    const title = messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '...' : '');
    // Get timestamps
    const timestamps = messages.map(m => m.timestamp || 0).filter(t => t > 0);
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);
    const duration = (endTime - startTime) / (1000 * 60); // Convert to minutes
    // Tag the thread with topics and emotions
    const taggedChunk = (0, TopicTagger_1.tagChunk)(0, messages);
    const emotionTag = (0, EmotionTagger_1.tagEmotion)(messages);
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
function getThreadSummary(threads) {
    const totalThreads = threads.length;
    const totalMessages = threads.reduce((sum, thread) => sum + thread.messages.length, 0);
    const avgDuration = threads.reduce((sum, thread) => sum + thread.duration, 0) / totalThreads;
    const emotionCounts = {};
    const tagCounts = {};
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
