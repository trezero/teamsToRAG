import fs from 'fs';
import path from 'path';

/**
 * Generates a high-quality RAG document from Teams chat messages
 * @param {Array} messages - Array of Teams chat messages
 * @param {Object} metadata - Chat metadata
 * @param {Array} members - Chat members
 * @param {Object} options - Generation options
 * @returns {string} Generated RAG document
 */
export function generateRAGDocument(messages, metadata, members, options = {}) {
  const {
    includeMetadata = true,
    groupByDate = true,
    format = 'markdown',
    chatId = null,
    teamId = null,
    channelId = null,
  } = options;

  // Create member lookup
  const memberMap = {};
  members.forEach((member) => {
    if (member.userId) {
      memberMap[member.userId] = member.displayName || 'Unknown User';
    }
  });

  let document = '';

  // Add document header
  if (includeMetadata) {
    document += generateHeader(metadata, messages.length, { chatId, teamId, channelId });
    document += '\n\n---\n\n';
  }

  // Process messages
  if (groupByDate) {
    document += generateGroupedByDate(messages, memberMap, includeMetadata);
  } else {
    document += generateSequential(messages, memberMap, includeMetadata);
  }

  return document;
}

/**
 * Generates document header with metadata
 */
function generateHeader(metadata, messageCount, options = {}) {
  const header = [];

  header.push('# Teams Chat Export for RAG');
  header.push('');

  if (metadata.topic) {
    header.push(`**Topic:** ${metadata.topic}`);
  }

  if (metadata.chatType) {
    header.push(`**Chat Type:** ${metadata.chatType}`);
  }

  // Add source info (chat vs channel)
  if (options.teamId && options.channelId) {
    header.push(`**Source:** Channel (Team: ${options.teamId.substring(0, 8)}..., Channel: ${options.channelId.substring(0, 8)}...)`);
  } else if (options.chatId) {
    header.push(`**Source:** Chat (${options.chatId.substring(0, 8)}...)`);
  }

  header.push(`**Total Messages:** ${messageCount}`);

  if (metadata.createdDateTime) {
    header.push(`**Created:** ${new Date(metadata.createdDateTime).toLocaleString()}`);
  }

  const now = new Date();
  header.push(`**Last Run:** ${now.toISOString()}`);
  header.push(`**Last Run (Local):** ${now.toLocaleString()}`);

  return header.join('\n');
}

/**
 * Generates messages grouped by date
 */
function generateGroupedByDate(messages, memberMap, includeMetadata) {
  const grouped = {};
  const dateObjects = {};

  // Group messages by date, keeping track of date objects for sorting
  messages.forEach((msg) => {
    const dateObj = new Date(msg.createdDateTime);
    const dateStr = dateObj.toLocaleDateString();

    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
      dateObjects[dateStr] = dateObj;
    }
    grouped[dateStr].push(msg);
  });

  const parts = [];

  // Sort dates chronologically (oldest first)
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    return dateObjects[a] - dateObjects[b];
  });

  // Generate output for each date in chronological order
  sortedDates.forEach((date) => {
    parts.push(`## ${date}\n`);

    grouped[date].forEach((msg) => {
      parts.push(formatMessage(msg, memberMap, includeMetadata));
    });

    parts.push('');
  });

  return parts.join('\n');
}

/**
 * Generates messages sequentially
 */
function generateSequential(messages, memberMap, includeMetadata) {
  const parts = ['## Chat Messages\n'];

  messages.forEach((msg) => {
    parts.push(formatMessage(msg, memberMap, includeMetadata));
  });

  return parts.join('\n');
}

/**
 * Formats a single message
 */
function formatMessage(msg, memberMap, includeMetadata) {
  const parts = [];

  // Get sender name
  const senderName = msg.from?.user?.displayName ||
                     (msg.from?.user?.id ? memberMap[msg.from.user.id] : null) ||
                     'Unknown User';

  // Format timestamp
  const timestamp = includeMetadata
    ? ` - ${new Date(msg.createdDateTime).toLocaleTimeString()}`
    : '';

  // Message header
  parts.push(`**${senderName}**${timestamp}`);

  // Message body
  if (msg.body?.content) {
    const content = cleanMessageContent(msg.body.content, msg.body.contentType);
    parts.push(content);
  }

  // Attachments
  if (msg.attachments && msg.attachments.length > 0) {
    parts.push('');
    parts.push('*Attachments:*');
    msg.attachments.forEach((att) => {
      parts.push(`- ${att.name || att.contentType || 'Attachment'}`);
    });
  }

  // Reactions
  if (msg.reactions && msg.reactions.length > 0) {
    const reactionSummary = msg.reactions
      .map((r) => r.reactionType)
      .join(', ');
    parts.push(`*Reactions: ${reactionSummary}*`);
  }

  parts.push('');

  return parts.join('\n');
}

/**
 * Cleans message content (removes HTML if present)
 */
function cleanMessageContent(content, contentType) {
  if (contentType === 'html') {
    // Remove HTML tags for cleaner RAG content
    return content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  return content;
}

/**
 * Saves RAG document to file
 * @param {string} content - Document content
 * @param {string} outputPath - Output file path
 */
export function saveRAGDocument(content, outputPath) {
  const dir = path.dirname(outputPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
}

/**
 * Checks if an export file exists for the given source
 * @param {string} outputPath - Output file path
 * @returns {boolean} True if file exists
 */
export function exportFileExists(outputPath) {
  return fs.existsSync(outputPath);
}

/**
 * Parses an existing export file to extract metadata
 * @param {string} outputPath - Path to existing export file
 * @returns {Object|null} Metadata object or null if parsing fails
 */
export function parseExistingExport(outputPath) {
  try {
    if (!fs.existsSync(outputPath)) {
      return null;
    }

    const content = fs.readFileSync(outputPath, 'utf8');
    const lines = content.split('\n');

    const metadata = {
      lastRun: null,
      lastRunISO: null,
      source: null,
      totalMessages: 0,
    };

    // Parse header for metadata
    for (const line of lines) {
      // Look for Last Run timestamp (ISO format is more reliable)
      const lastRunMatch = line.match(/\*\*Last Run:\*\*\s+(.+)/);
      if (lastRunMatch) {
        metadata.lastRunISO = lastRunMatch[1].trim();
        metadata.lastRun = new Date(metadata.lastRunISO);
      }

      // Look for source info
      const sourceMatch = line.match(/\*\*Source:\*\*\s+(.+)/);
      if (sourceMatch) {
        metadata.source = sourceMatch[1].trim();
      }

      // Look for total messages
      const messagesMatch = line.match(/\*\*Total Messages:\*\*\s+(\d+)/);
      if (messagesMatch) {
        metadata.totalMessages = parseInt(messagesMatch[1]);
      }

      // Stop at separator
      if (line.trim() === '---') {
        break;
      }
    }

    return metadata;
  } catch (error) {
    console.warn('Failed to parse existing export:', error.message);
    return null;
  }
}

/**
 * Appends new messages to an existing export file
 * @param {string} outputPath - Output file path
 * @param {Array} newMessages - New messages to append
 * @param {Object} memberMap - Member name mapping
 * @param {boolean} includeMetadata - Include timestamps
 * @param {boolean} groupByDate - Group by date
 * @returns {number} Number of messages appended
 */
export function appendMessagesToExport(outputPath, newMessages, memberMap, includeMetadata, groupByDate) {
  if (newMessages.length === 0) {
    return 0;
  }

  const existingContent = fs.readFileSync(outputPath, 'utf8');

  // Update the header with new stats
  let updatedContent = existingContent;

  // Update Total Messages count
  const totalMessagesMatch = existingContent.match(/\*\*Total Messages:\*\*\s+(\d+)/);
  if (totalMessagesMatch) {
    const oldCount = parseInt(totalMessagesMatch[1]);
    const newCount = oldCount + newMessages.length;
    updatedContent = updatedContent.replace(
      /\*\*Total Messages:\*\*\s+\d+/,
      `**Total Messages:** ${newCount}`
    );
  }

  // Update Last Run timestamp
  const now = new Date();
  updatedContent = updatedContent.replace(
    /\*\*Last Run:\*\*\s+.+/,
    `**Last Run:** ${now.toISOString()}`
  );
  updatedContent = updatedContent.replace(
    /\*\*Last Run \(Local\):\*\*\s+.+/,
    `**Last Run (Local):** ${now.toLocaleString()}`
  );

  // Generate new message content
  let newContent = '';
  if (groupByDate) {
    newContent = generateGroupedByDate(newMessages, memberMap, includeMetadata);
  } else {
    newContent = generateSequential(newMessages, memberMap, includeMetadata);
  }

  // Append new messages
  updatedContent += '\n' + newContent;

  fs.writeFileSync(outputPath, updatedContent, 'utf8');
  return newMessages.length;
}

/**
 * Generates statistics about the chat
 * @param {Array} messages - Array of messages
 * @param {Array} members - Array of members
 * @returns {Object} Statistics object
 */
export function generateStatistics(messages, members) {
  const stats = {
    totalMessages: messages.length,
    totalParticipants: members.length,
    dateRange: {
      start: null,
      end: null,
    },
    messagesByUser: {},
    messagesPerDay: {},
  };

  if (messages.length === 0) {
    return stats;
  }

  // Date range
  stats.dateRange.start = new Date(messages[0].createdDateTime);
  stats.dateRange.end = new Date(messages[messages.length - 1].createdDateTime);

  // Count messages by user and by day
  messages.forEach((msg) => {
    const userName = msg.from?.user?.displayName || 'Unknown';
    const date = new Date(msg.createdDateTime).toLocaleDateString();

    stats.messagesByUser[userName] = (stats.messagesByUser[userName] || 0) + 1;
    stats.messagesPerDay[date] = (stats.messagesPerDay[date] || 0) + 1;
  });

  return stats;
}

/**
 * Completely overwrites an existing export file with new content
 * Used for channels where incremental updates are not supported
 * @param {string} outputPath - Output file path
 * @param {string} content - New complete document content
 * @returns {boolean} True if successful
 */
export function overwriteExport(outputPath, content) {
  try {
    const dir = path.dirname(outputPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Overwrite the file completely
    fs.writeFileSync(outputPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to overwrite export:', error.message);
    return false;
  }
}
