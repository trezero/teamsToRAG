# API Reference

This document provides detailed technical reference for the Microsoft Graph API integration, internal APIs, and testing approaches used in the Teams to RAG project.

## Microsoft Graph API Integration

### Base Configuration

```javascript
const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
```

All API calls use Microsoft Graph API v1.0 endpoint.

### Authentication Headers

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### API Endpoints

#### List User's Chats

**Endpoint**: `GET /me/chats`

**Supported Query Parameters**:
- `$top`: Limit number of results (default: 50, max: 50)
- `$expand`: Expand related entities (e.g., `members`)
- `$filter`: Filter results (limited support)

**Example Request**:
```javascript
const response = await fetch(
  `${GRAPH_API_BASE}/me/chats?$expand=members&$top=50`,
  { headers }
);
```

**Response**:
```json
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats",
  "@odata.count": 150,
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/me/chats?$skip=50",
  "value": [
    {
      "id": "19:abc123def456@thread.v2",
      "topic": "Project Planning",
      "createdDateTime": "2025-01-15T09:00:00Z",
      "lastUpdatedDateTime": "2025-01-20T14:30:00Z",
      "chatType": "group",
      "members": [
        {
          "userId": "29:1234567890",
          "displayName": "John Doe",
          "email": "john.doe@company.com"
        }
      ]
    }
  ]
}
```

#### Get Chat Messages

**Endpoint**: `GET /chats/{chatId}/messages`

**Supported Query Parameters**:
- `$top`: Limit number of results (default: 50, max: 50)
- `$orderby`: Sort results (e.g., `createdDateTime desc`)
- `$filter`: Filter by date (e.g., `createdDateTime gt 2025-01-01T00:00:00Z`)

**Example Request**:
```javascript
const response = await fetch(
  `${GRAPH_API_BASE}/chats/${chatId}/messages?$top=50&$orderby=createdDateTime desc`,
  { headers }
);
```

**Response**:
```json
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19:abc123')/messages",
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats/19:abc123/messages?$skip=50",
  "value": [
    {
      "id": "1705311120000",
      "messageType": "message",
      "createdDateTime": "2025-01-15T09:32:00Z",
      "from": {
        "user": {
          "id": "29:1234567890",
          "displayName": "John Doe"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<p>Let's discuss the Q1 roadmap today.</p>"
      },
      "attachments": [],
      "reactions": []
    }
  ]
}
```

#### List Team Channels

**Endpoint**: `GET /teams/{teamId}/channels`

**Supported Query Parameters**:
- `$top`: Limit number of results
- `$filter`: Filter by channel properties

**Example Request**:
```javascript
const response = await fetch(
  `${GRAPH_API_BASE}/teams/${teamId}/channels`,
  { headers }
);
```

#### Get Channel Messages

**Endpoint**: `GET /teams/{teamId}/channels/{channelId}/messages`

**IMPORTANT LIMITATION**: This endpoint does NOT support `$filter` on `createdDateTime`. Only `$top` and `$expand` are supported.

**Supported Query Parameters**:
- `$top`: Limit number of results (default: 50, max: 50)
- `$expand`: Expand replies (e.g., `replies`)

**Example Request**:
```javascript
const response = await fetch(
  `${GRAPH_API_BASE}/teams/${teamId}/channels/${channelId}/messages?$top=50`,
  { headers }
);
```

**Why No Incremental Updates for Channels**:
- The API does not support `$filter` on `createdDateTime`
- Cannot query for "messages after date X"
- Must fetch all messages every time
- Client-side filtering is not practical due to pagination

### Pagination Handling

All list operations implement pagination:

```javascript
async function fetchAllPages(url, headers) {
  const results = [];
  let nextLink = url;

  while (nextLink) {
    const response = await fetch(nextLink, { headers });
    const data = await response.json();

    results.push(...data.value);

    // Check for next page
    nextLink = data['@odata.nextLink'];
  }

  return results;
}
```

### Error Handling

#### HTTP Status Codes

**200 OK**: Successful request
```javascript
if (response.ok) {
  const data = await response.json();
  // Process data
}
```

**404 Not Found**: Resource does not exist or user has no access
```javascript
{
  "error": {
    "code": "NotFound",
    "message": "The requested resource does not exist.",
    "innerError": {
      "request-id": "abc123",
      "date": "2025-01-20T10:00:00"
    }
  }
}
```

**403 Forbidden**: Permission denied
```javascript
{
  "error": {
    "code": "Forbidden",
    "message": "The caller does not have permission to perform the action.",
    "innerError": {
      "request-id": "abc123",
      "date": "2025-01-20T10:00:00"
    }
  }
}
```

**429 Too Many Requests**: Rate limited
```javascript
{
  "error": {
    "code": "TooManyRequests",
    "message": "The request has been throttled.",
    "retryAfter": 120
  }
}
```

#### Error Handling Pattern

```javascript
async function handleGraphAPIRequest(url, headers) {
  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 404) {
        throw new Error(`Resource not found: ${error.error.message}`);
      } else if (response.status === 403) {
        throw new Error(`Permission denied: ${error.error.message}. Check your API permissions.`);
      } else if (response.status === 429) {
        const retryAfter = error.error.retryAfter || 60;
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await sleep(retryAfter * 1000);
        return handleGraphAPIRequest(url, headers); // Retry
      } else {
        throw new Error(`API error (${response.status}): ${error.error.message}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Microsoft Graph API Error:', error.message);
    throw error;
  }
}
```

## Implementation Details

### Incremental Updates with Client-Side Filtering

#### Chat Messages Strategy

```javascript
/**
 * Fetches chat messages with incremental update support
 *
 * Strategy:
 * 1. API returns newest messages first ($orderby createdDateTime desc)
 * 2. Filter messages by createdDateTime > lastRun
 * 3. Stop pagination early when old messages are found
 *
 * @param {string} chatId - Teams chat ID
 * @param {string} lastRun - ISO timestamp of last export
 * @returns {Array} New messages since lastRun
 */
async function fetchChatMessages(chatId, lastRun = null) {
  const messages = [];
  let nextLink = `${GRAPH_API_BASE}/chats/${chatId}/messages?$top=50&$orderby=createdDateTime desc`;
  let foundOldMessage = false;

  while (nextLink && !foundOldMessage) {
    const data = await handleGraphAPIRequest(nextLink, headers);

    for (const message of data.value) {
      const messageDate = new Date(message.createdDateTime);
      const lastRunDate = lastRun ? new Date(lastRun) : null;

      // If message is older than lastRun, stop fetching
      if (lastRunDate && messageDate <= lastRunDate) {
        foundOldMessage = true;
        break;
      }

      messages.push(message);
    }

    nextLink = foundOldMessage ? null : data['@odata.nextLink'];
  }

  return messages.reverse(); // Return oldest-first
}
```

#### Channel Messages Strategy

```javascript
/**
 * Fetches channel messages (NO incremental support)
 *
 * Limitation: Microsoft Graph API does not support $filter on createdDateTime
 * for channel messages. Must fetch all messages.
 *
 * @param {string} teamId - Teams team ID
 * @param {string} channelId - Teams channel ID
 * @returns {Array} All channel messages
 */
async function fetchChannelMessages(teamId, channelId) {
  const messages = [];
  let nextLink = `${GRAPH_API_BASE}/teams/${teamId}/channels/${channelId}/messages?$top=50`;

  while (nextLink) {
    const data = await handleGraphAPIRequest(nextLink, headers);
    messages.push(...data.value);
    nextLink = data['@odata.nextLink'];
  }

  return messages;
}
```

### Filename Sanitization

```javascript
/**
 * Sanitizes chat/channel name for use as filename
 *
 * Rules:
 * - Remove invalid filename characters: :<>"\/\|?*
 * - Replace spaces with hyphens
 * - Trim leading/trailing hyphens
 * - Convert to lowercase for consistency
 *
 * @param {string} name - Chat or channel name
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(name) {
  return name
    .replace(/[:<>"\/\\|?*]/g, '')  // Remove invalid characters
    .replace(/\s+/g, '-')            // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '')         // Trim leading/trailing hyphens
    .toLowerCase();                  // Lowercase for consistency
}

// Examples:
// "Project Planning" -> "project-planning"
// "Q1: Features & Bugs" -> "q1-features-bugs"
// "Dev / Testing" -> "dev-testing"
```

### Member Resolution

```javascript
/**
 * Resolves member names for message formatting
 *
 * Strategy:
 * - Use $expand=members during chat fetch to get member details
 * - Build memberMap (userId -> displayName)
 * - Use map to format message sender names
 *
 * @param {string} chatId - Teams chat ID
 * @returns {Object} Chat with resolved member names
 */
async function getChatWithMembers(chatId) {
  const response = await fetch(
    `${GRAPH_API_BASE}/chats/${chatId}?$expand=members`,
    { headers }
  );

  const chat = await response.json();

  // Build member map
  const memberMap = {};
  for (const member of chat.members || []) {
    memberMap[member.userId] = member.displayName;
  }

  // For 1:1 chats without topic, show other user's name
  if (chat.chatType === 'oneOnOne' && !chat.topic) {
    const currentUserId = getCurrentUserId(); // From auth token
    const otherMember = chat.members.find(m => m.userId !== currentUserId);
    chat.displayName = `[1:1] ${otherMember?.displayName || 'Unknown'}`;
  } else {
    chat.displayName = chat.topic || chat.id;
  }

  return { chat, memberMap };
}
```

### Export File Header Parsing

```javascript
/**
 * Parses Last Run timestamp from existing export file
 *
 * Header format:
 * # Chat: Project Planning
 * **Chat Type:** Group
 * **Message Count:** 150
 * **Last Run:** 2025-01-20T14:30:00.000Z
 * **Exported On:** 2025-01-20
 *
 * @param {string} filePath - Path to existing export file
 * @returns {Date|null} Last run timestamp or null if not found
 */
function parseLastRunFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').slice(0, 10); // Only check first 10 lines

  for (const line of lines) {
    const match = line.match(/\*\*Last Run:\*\*\s*(.+)/);
    if (match) {
      return new Date(match[1].trim());
    }
  }

  return null;
}
```

## Testing Approach

### Configuration Validation

```bash
# Validate authentication and permissions
npm start validate
```

**What It Checks**:
- Environment variables are set correctly
- Azure AD application is configured properly
- Authentication succeeds (device code flow or client credentials)
- User/app has required permissions
- Can fetch test data (user's chats)

**Example Output**:
```
✓ Environment variables loaded
✓ Authentication successful
✓ User ID: 29:1234567890
✓ Permissions validated
✓ Test fetch: Found 150 chats
```

### Small Chat Testing

```bash
# Test with limited messages to avoid rate limits
npm start generate -- --chat-id "19:abc123..." --max-messages 10
```

**Best Practices**:
1. Start with a small, known chat
2. Use `--max-messages` flag to limit API calls
3. Verify permissions before processing large datasets
4. Check output quality before bulk exports

### Cache Testing

```bash
# Test cache behavior in interactive menu
npm start menu

# Options:
# - View cache status and age
# - Force refresh to bypass cache
# - Clear cache entirely
```

### API Error Simulation

**404 Not Found** - Test with invalid chat ID:
```bash
npm start generate -- --chat-id "invalid-id"
```

**403 Forbidden** - Test with chat user is not member of:
```bash
npm start generate -- --chat-id "19:not-a-member..."
```

### Rate Limiting Testing

```bash
# Process multiple chats quickly to trigger rate limiting
for chatId in chat1 chat2 chat3; do
  npm start generate -- --chat-id "$chatId"
done
```

**Expected Behavior**:
- Initial requests succeed
- After threshold, receive 429 responses
- Client automatically retries with backoff
- All requests eventually complete

## Common API Patterns

### Retry with Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
}

// Usage:
const data = await retryWithBackoff(() =>
  handleGraphAPIRequest(url, headers)
);
```

### Batch Processing with Progress

```javascript
const ora = require('ora');

async function processChatsBatch(chatIds) {
  const spinner = ora(`Processing 0/${chatIds.length} chats...`).start();

  for (let i = 0; i < chatIds.length; i++) {
    const chatId = chatIds[i];
    spinner.text = `Processing ${i + 1}/${chatIds.length} chats...`;

    await exportChat(chatId);
  }

  spinner.succeed(`Processed ${chatIds.length} chats`);
}
```

### Concurrent Request Limiting

```javascript
const pLimit = require('p-limit');

// Limit to 5 concurrent requests
const limit = pLimit(5);

const promises = chatIds.map(chatId =>
  limit(() => exportChat(chatId))
);

await Promise.all(promises);
```

## Performance Optimization

### Minimize API Calls

1. **Use $expand to reduce round trips**
   ```javascript
   // BAD: Two requests
   const chat = await getChat(chatId);
   const members = await getChatMembers(chatId);

   // GOOD: One request
   const chat = await getChat(chatId, { expand: 'members' });
   ```

2. **Use caching for frequently accessed data**
   ```javascript
   // Cache chat metadata for 24 hours
   const cachedChat = getChatFromCache(chatId);
   if (cachedChat && !isCacheStale(cachedChat)) {
     return cachedChat;
   }
   ```

3. **Implement early pagination stopping**
   ```javascript
   // Stop fetching when no new messages found
   while (nextLink && !foundOldMessage) {
     // ... fetch and check
   }
   ```

### Rate Limit Management

- Default rate limit: ~1000 requests per minute per app
- Implement exponential backoff on 429 responses
- Use `Retry-After` header value if provided
- Batch operations where possible

## Troubleshooting Guide

### "Permission denied" errors

**Delegated auth**: Ensure these delegated permissions are granted:
- `ChatMessage.Read`
- `Chat.Read`
- `ChannelMessage.Read.All`

**Application auth**: Ensure these application permissions with admin consent:
- `Chat.Read.All`
- `ChannelMessage.Read.All`

**Additional check**: Verify user is member of chat/channel for delegated auth

### "Device code expired"

- Device code expires after 15 minutes (configurable in Azure AD)
- User must complete authentication within this window
- Increase timeout in Azure AD app configuration if needed

### Channel incremental updates not working

- This is **expected behavior**
- Microsoft Graph API does not support `$filter` on channel messages
- Channels always fetch all messages
- Workaround: Use client-side filtering after fetch (not recommended for large channels)

### Cache not refreshing

- Cache validity is 24 hours by default (see `CACHE_VALIDITY_MS` in cache.js)
- Use menu option 4 to force refresh
- Use menu option 5 to clear cache entirely
- Check `fetched_at` timestamp in SQLite database

## References

- [Microsoft Graph API - Chats](https://learn.microsoft.com/en-us/graph/api/resources/chat)
- [Microsoft Graph API - Messages](https://learn.microsoft.com/en-us/graph/api/resources/chatmessage)
- [Microsoft Graph API - Pagination](https://learn.microsoft.com/en-us/graph/paging)
- [Microsoft Graph API - Error Responses](https://learn.microsoft.com/en-us/graph/errors)
- [OAuth 2.0 Device Authorization Grant](https://oauth.net/2/device-flow/)
