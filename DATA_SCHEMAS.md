# Data Schemas: Vector Store & Knowledge Graph

This document defines the data models for the dual-storage system powering the Unified Teams Knowledge Base.

## Overview

The system maintains two synchronized data stores:
1. **ChromaDB (Vector Store)**: Semantic search over message content
2. **Neo4j (Knowledge Graph)**: Relational queries over people, chats, and topics

---

## 1. Vector Store Schema (ChromaDB)

### Collection Configuration

```python
collection_config = {
    "name": "teams_messages",
    "metadata": {
        "description": "Semantic chunks from Microsoft Teams conversations",
        "hnsw:space": "cosine",           # Cosine similarity for embeddings
        "hnsw:construction_ef": 200,      # Higher = better quality, slower build
        "hnsw:M": 16,                     # Connections per node (balanced)
        "hnsw:search_ef": 100             # Search quality
    }
}
```

### Document Schema

Each document represents a semantic chunk of messages.

```javascript
{
  // Primary identifier
  "id": "chat_19abc123_chunk_042",

  // The embedded text content
  "content": "John Doe - 9:32 AM\nLet's discuss the Q1 roadmap today.\n\nJane Smith - 9:35 AM\nSounds good! I have some ideas for the new feature.\n\nJohn Doe - 9:40 AM\nGreat! Can you share the mockups?",

  // Metadata for filtering and context
  "metadata": {
    // Chat identifiers
    "chat_id": "19:abc123def456@thread.v2",
    "chat_type": "group",                    // "oneOnOne" | "group" | "channel"
    "chat_topic": "Q1 Planning",
    "team_id": null,                         // Only for channels
    "channel_id": null,                      // Only for channels

    // Temporal information
    "chunk_start_time": "2025-01-15T09:32:00Z",
    "chunk_end_time": "2025-01-15T09:40:00Z",
    "date_bucket": "2025-01-15",            // For date-based filtering
    "indexed_at": "2025-01-20T14:23:00Z",

    // Chunk metadata
    "chunk_index": 42,                       // Sequence number within chat
    "message_count": 3,                      // Messages in this chunk
    "message_ids": [
      "1705311120000",
      "1705311300000",
      "1705311600000"
    ],

    // Participants in this chunk
    "participants": ["John Doe", "Jane Smith"],
    "participant_count": 2,

    // Content characteristics
    "has_attachments": false,
    "has_code_blocks": false,
    "has_mentions": false,
    "token_count": 187,                     // Approximate

    // Extracted metadata (optional, from LLM)
    "topics": ["roadmap", "Q1 planning", "feature mockups"],
    "sentiment": "neutral",                 // "positive" | "neutral" | "negative"
    "is_decision": false,
    "is_action_item": false
  }
}
```

### Indexing Strategy

```sql
-- SQLite tracking table
CREATE TABLE vector_index_status (
  chat_id TEXT PRIMARY KEY,
  last_message_id TEXT,                    -- Last processed message
  last_message_timestamp INTEGER,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',           -- 'pending'|'processing'|'completed'|'failed'
  error_message TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (chat_id) REFERENCES chats(id)
);

CREATE INDEX idx_vector_status ON vector_index_status(status);
CREATE INDEX idx_vector_updated ON vector_index_status(updated_at);
```

### Chunking Algorithm

```javascript
/**
 * Semantic chunking strategy for Teams messages
 *
 * Goals:
 * - Preserve conversational context
 * - Keep chunks within token limits (max 512 tokens for embedding model)
 * - Create meaningful semantic boundaries
 */

const CHUNKING_CONFIG = {
  max_messages_per_chunk: 10,
  max_tokens_per_chunk: 400,              // Leave buffer for embedding model (512 max)
  min_messages_per_chunk: 2,
  overlap_messages: 1,                    // Include last message of previous chunk
  time_gap_threshold_minutes: 240         // 4 hours = new conversation thread
};

function chunkMessages(messages, config = CHUNKING_CONFIG) {
  const chunks = [];
  let currentChunk = [];
  let currentTokenCount = 0;
  let lastMessageTime = null;

  for (const message of messages) {
    const messageTokens = estimateTokens(message.content);
    const timeSinceLastMessage = lastMessageTime
      ? (new Date(message.createdDateTime) - lastMessageTime) / (1000 * 60)
      : 0;

    // Start new chunk if:
    // 1. Token limit would be exceeded
    // 2. Message limit would be exceeded
    // 3. Large time gap detected (new conversation thread)
    const shouldSplitChunk = (
      currentTokenCount + messageTokens > config.max_tokens_per_chunk ||
      currentChunk.length >= config.max_messages_per_chunk ||
      timeSinceLastMessage > config.time_gap_threshold_minutes
    );

    if (shouldSplitChunk && currentChunk.length >= config.min_messages_per_chunk) {
      chunks.push({
        messages: currentChunk,
        tokenCount: currentTokenCount
      });

      // Overlap: keep last message for context
      currentChunk = config.overlap_messages > 0
        ? [currentChunk[currentChunk.length - 1]]
        : [];
      currentTokenCount = config.overlap_messages > 0
        ? estimateTokens(currentChunk[0].content)
        : 0;
    }

    currentChunk.push(message);
    currentTokenCount += messageTokens;
    lastMessageTime = new Date(message.createdDateTime);
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      messages: currentChunk,
      tokenCount: currentTokenCount
    });
  }

  return chunks;
}
```

### Example Vector Queries

```python
# Semantic search with filters
results = collection.query(
    query_texts=["What was discussed about the Q1 roadmap?"],
    n_results=5,
    where={
        "chat_type": "group",
        "date_bucket": {"$gte": "2025-01-01", "$lte": "2025-03-31"}
    },
    where_document={"$contains": "roadmap"}
)

# Search by participants
results = collection.query(
    query_texts=["Feature development plans"],
    n_results=10,
    where={
        "$and": [
            {"participants": {"$contains": "John Doe"}},
            {"chat_type": {"$ne": "oneOnOne"}}
        ]
    }
)

# Search with topic filter
results = collection.query(
    query_texts=["database optimization"],
    n_results=5,
    where={"topics": {"$contains": "performance"}}
)
```

---

## 2. Knowledge Graph Schema (Neo4j)

### Node Types

#### Person Node
```cypher
// Represents a Teams user
(:Person {
  userId: "29:abc123def456",              // Microsoft Graph user ID
  displayName: "John Doe",
  email: "john.doe@company.com",
  userPrincipalName: "john.doe@company.com",
  firstName: "John",                      // Extracted from displayName
  lastName: "Doe",                        // Extracted from displayName
  firstSeenAt: datetime("2025-01-15T09:00:00Z"),
  lastSeenAt: datetime("2025-01-20T16:30:00Z"),
  messageCount: 342,                      // Total messages sent
  chatCount: 28                           // Chats participated in
})

// Constraints and Indexes
CREATE CONSTRAINT person_userId IF NOT EXISTS FOR (p:Person) REQUIRE p.userId IS UNIQUE;
CREATE INDEX person_displayName IF NOT EXISTS FOR (p:Person) ON (p.displayName);
CREATE INDEX person_email IF NOT EXISTS FOR (p:Person) ON (p.email);
```

#### Chat Node
```cypher
// Represents a Teams chat (1:1, group, or channel)
(:Chat {
  chatId: "19:abc123def456@thread.v2",
  chatType: "group",                     // "oneOnOne" | "group" | "channel"
  topic: "Q1 Planning",
  teamId: null,                          // For channels only
  channelId: null,                       // For channels only
  createdAt: datetime("2025-01-15T09:00:00Z"),
  lastActivityAt: datetime("2025-01-20T16:30:00Z"),
  messageCount: 156,
  memberCount: 8,
  isActive: true                         // Has activity in last 30 days
})

// Constraints and Indexes
CREATE CONSTRAINT chat_chatId IF NOT EXISTS FOR (c:Chat) REQUIRE c.chatId IS UNIQUE;
CREATE INDEX chat_type IF NOT EXISTS FOR (c:Chat) ON (c.chatType);
CREATE INDEX chat_lastActivity IF NOT EXISTS FOR (c:Chat) ON (c.lastActivityAt);
```

#### Message Node
```cypher
// Represents a single Teams message (lightweight version)
(:Message {
  messageId: "1705311120000",
  chatId: "19:abc123def456@thread.v2",
  timestamp: datetime("2025-01-15T09:32:00Z"),
  contentSummary: "Discussed Q1 roadmap planning",  // First 200 chars or LLM summary
  hasAttachments: false,
  hasReactions: false,
  hasReplies: false,
  replyToMessageId: null,                // For threading
  tokenCount: 42
})

// Constraints and Indexes
CREATE CONSTRAINT message_id IF NOT EXISTS FOR (m:Message) REQUIRE m.messageId IS UNIQUE;
CREATE INDEX message_timestamp IF NOT EXISTS FOR (m:Message) ON (m.timestamp);
CREATE INDEX message_chatId IF NOT EXISTS FOR (m:Message) ON (m.chatId);
```

#### Topic Node
```cypher
// Represents an extracted topic/theme (LLM-generated)
(:Topic {
  name: "Q1 Planning",                   // Normalized topic name
  category: "business",                  // Optional categorization
  firstMentioned: datetime("2025-01-15T09:32:00Z"),
  lastMentioned: datetime("2025-01-20T16:30:00Z"),
  mentionCount: 23,                      // Across all messages
  messageCount: 18,                      // Unique messages discussing this
  relatedTopics: ["roadmap", "features", "planning"]
})

// Constraints and Indexes
CREATE CONSTRAINT topic_name IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE;
CREATE INDEX topic_category IF NOT EXISTS FOR (t:Topic) ON (t.category);
```

#### Decision Node (Optional Enhancement)
```cypher
// Represents an extracted decision from conversations
(:Decision {
  decisionId: "dec_chat19abc_msg1705311120000",
  summary: "Agreed to launch Q1 feature by March 15",
  madeAt: datetime("2025-01-15T09:45:00Z"),
  confidence: 0.85,                      // LLM extraction confidence
  status: "active",                      // "active" | "superseded" | "cancelled"
  impactLevel: "high"                    // "low" | "medium" | "high"
})
```

### Relationship Types

#### MEMBER_OF
```cypher
// Person participates in Chat
(:Person)-[:MEMBER_OF {
  joinedAt: datetime("2025-01-15T09:00:00Z"),
  role: "owner",                         // "owner" | "member" | "guest"
  messageCount: 42,                      // Messages by this person in this chat
  lastMessageAt: datetime("2025-01-20T14:30:00Z"),
  isActive: true                         // Active in last 30 days
}]->(:Chat)

// Index for queries
CREATE INDEX member_of_rel IF NOT EXISTS FOR ()-[r:MEMBER_OF]-() ON (r.lastMessageAt);
```

#### SENT
```cypher
// Person sent Message
(:Person)-[:SENT {
  timestamp: datetime("2025-01-15T09:32:00Z")
}]->(:Message)
```

#### IN_CHAT
```cypher
// Message belongs to Chat
(:Message)-[:IN_CHAT]->(:Chat)
```

#### DISCUSSES
```cypher
// Message discusses Topic
(:Message)-[:DISCUSSES {
  relevance: 0.92,                       // LLM-scored relevance (0-1)
  isPrimary: true,                       // Is this the main topic of the message?
  extractedAt: datetime("2025-01-20T10:00:00Z")
}]->(:Topic)
```

#### REPLIED_TO
```cypher
// Message is a reply to another Message
(:Message)-[:REPLIED_TO {
  latencyMinutes: 3                      // Time between messages
}]->(:Message)
```

#### COLLABORATES_WITH (Derived)
```cypher
// Person frequently interacts with another Person
// This is a computed relationship, not stored directly
MATCH (p1:Person)-[:SENT]->(:Message)-[:IN_CHAT]->(:Chat)<-[:IN_CHAT]-(:Message)<-[:SENT]-(p2:Person)
WHERE p1 <> p2
RETURN p1, p2, count(*) as interactionCount
ORDER BY interactionCount DESC
```

### Graph Database Indexes

```cypher
// Composite indexes for common query patterns
CREATE INDEX message_chat_time IF NOT EXISTS
FOR (m:Message) ON (m.chatId, m.timestamp);

CREATE INDEX person_activity IF NOT EXISTS
FOR (p:Person) ON (p.lastSeenAt, p.messageCount);

// Full-text search indexes
CREATE FULLTEXT INDEX topic_search IF NOT EXISTS
FOR (t:Topic) ON EACH [t.name];

CREATE FULLTEXT INDEX person_search IF NOT EXISTS
FOR (p:Person) ON EACH [p.displayName, p.email];
```

### SQLite Tracking Table

```sql
CREATE TABLE graph_index_status (
  chat_id TEXT PRIMARY KEY,
  last_message_id TEXT,
  last_message_timestamp INTEGER,
  node_count INTEGER DEFAULT 0,           -- Total nodes created
  relationship_count INTEGER DEFAULT 0,   -- Total relationships created
  person_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  topic_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (chat_id) REFERENCES chats(id)
);

CREATE INDEX idx_graph_status ON graph_index_status(status);
```

### Example Cypher Queries

```cypher
// 1. Find who collaborated with whom on a topic
MATCH (p1:Person)-[:SENT]->(:Message)-[:DISCUSSES]->(t:Topic {name: "Q1 Planning"})
MATCH (p1)-[:SENT]->(:Message)-[:IN_CHAT]->(:Chat)<-[:IN_CHAT]-(:Message)<-[:SENT]-(p2:Person)
WHERE p1 <> p2
RETURN p1.displayName, p2.displayName, count(*) as collaborationCount
ORDER BY collaborationCount DESC
LIMIT 10;

// 2. Find most discussed topics in a date range
MATCH (m:Message)-[:DISCUSSES]->(t:Topic)
WHERE m.timestamp >= datetime("2025-01-01")
  AND m.timestamp <= datetime("2025-01-31")
RETURN t.name, count(m) as mentions
ORDER BY mentions DESC
LIMIT 20;

// 3. Find conversation threads (replies)
MATCH path = (root:Message)-[:REPLIED_TO*1..5]->(ancestor:Message)
WHERE root.messageId = "1705311120000"
RETURN path;

// 4. Find most active chats for a person
MATCH (p:Person {displayName: "John Doe"})-[m:MEMBER_OF]->(c:Chat)
RETURN c.topic, c.chatType, m.messageCount, c.lastActivityAt
ORDER BY m.messageCount DESC
LIMIT 10;

// 5. Find people who are experts on a topic (most messages)
MATCH (p:Person)-[:SENT]->(:Message)-[:DISCUSSES]->(t:Topic {name: "database optimization"})
RETURN p.displayName, count(*) as contributions
ORDER BY contributions DESC
LIMIT 10;

// 6. Find related topics (co-occurrence in messages)
MATCH (t1:Topic)<-[:DISCUSSES]-(m:Message)-[:DISCUSSES]->(t2:Topic)
WHERE t1.name = "Q1 Planning" AND t1 <> t2
RETURN t2.name, count(m) as coOccurrence
ORDER BY coOccurrence DESC
LIMIT 10;

// 7. Find chat overlap between two people
MATCH (p1:Person {displayName: "John Doe"})-[:MEMBER_OF]->(c:Chat)<-[:MEMBER_OF]-(p2:Person {displayName: "Jane Smith"})
RETURN c.topic, c.chatType, c.messageCount
ORDER BY c.lastActivityAt DESC;
```

---

## 3. Data Mapping: SQLite Cache → Dual Stores

### Source: SQLite Cache Schema

```sql
-- Existing cache tables (from cache.js)
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  chat_type TEXT,
  topic TEXT,
  display_name TEXT,
  members TEXT,                          -- JSON array
  created_at INTEGER,
  last_updated INTEGER,
  fetched_at INTEGER
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  description TEXT,
  fetched_at INTEGER
);

CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  display_name TEXT,
  description TEXT,
  fetched_at INTEGER
);
```

### Transformation Pipeline

```javascript
// Pseudo-code for data flow

async function exportChatToStores(chatId) {
  // 1. Load from SQLite cache
  const chatMetadata = getChatFromCache(chatId);
  const members = JSON.parse(chatMetadata.members);

  // 2. Fetch messages from Microsoft Graph API
  const messages = await fetchChatMessages(accessToken, chatId);

  // 3. Process for Vector Store
  const chunks = chunkMessages(messages, CHUNKING_CONFIG);
  const vectorDocuments = chunks.map((chunk, idx) => ({
    id: `chat_${chatId}_chunk_${idx.toString().padStart(3, '0')}`,
    content: formatChunkContent(chunk.messages),
    metadata: buildVectorMetadata(chatId, chatMetadata, chunk, idx)
  }));
  await vectorDB.addDocuments(chatId, vectorDocuments);

  // 4. Process for Knowledge Graph
  const graphData = await extractGraphEntities(messages, members, chatMetadata);
  await graphDB.addChatGraph(chatId, graphData);

  // 5. Update tracking tables
  await updateVectorIndexStatus(chatId, messages.length, chunks.length);
  await updateGraphIndexStatus(chatId, graphData.nodeCount, graphData.relationshipCount);
}

// Vector metadata builder
function buildVectorMetadata(chatId, chatMetadata, chunk, chunkIndex) {
  const messages = chunk.messages;
  const participants = [...new Set(messages.map(m => m.from.user.displayName))];

  return {
    chat_id: chatId,
    chat_type: chatMetadata.chat_type,
    chat_topic: chatMetadata.topic,
    chunk_index: chunkIndex,
    chunk_start_time: messages[0].createdDateTime,
    chunk_end_time: messages[messages.length - 1].createdDateTime,
    date_bucket: messages[0].createdDateTime.split('T')[0],
    message_count: messages.length,
    message_ids: messages.map(m => m.id),
    participants: participants,
    participant_count: participants.length,
    has_attachments: messages.some(m => m.attachments?.length > 0),
    has_code_blocks: messages.some(m => m.body?.content?.includes('<code>')),
    token_count: chunk.tokenCount,
    indexed_at: new Date().toISOString()
  };
}

// Graph entity extractor (LLM-based)
async function extractGraphEntities(messages, members, chatMetadata) {
  const entities = {
    people: members.map(m => ({
      userId: m.userId,
      displayName: m.displayName,
      email: m.email
    })),
    messages: messages.map(m => ({
      messageId: m.id,
      timestamp: m.createdDateTime,
      senderId: m.from.user.id,
      contentSummary: m.body.content.substring(0, 200),
      hasAttachments: m.attachments?.length > 0,
      replyToMessageId: m.replyToId || null
    })),
    topics: [],
    relationships: []
  };

  // Extract topics using LLM
  const topicsResponse = await llmClient.extractTopics(messages);
  entities.topics = topicsResponse.topics;

  // Build relationships
  for (const message of messages) {
    // Person SENT Message
    entities.relationships.push({
      type: 'SENT',
      from: message.from.user.id,
      fromType: 'Person',
      to: message.id,
      toType: 'Message',
      properties: { timestamp: message.createdDateTime }
    });

    // Message IN_CHAT Chat
    entities.relationships.push({
      type: 'IN_CHAT',
      from: message.id,
      fromType: 'Message',
      to: chatMetadata.id,
      toType: 'Chat'
    });

    // Message DISCUSSES Topic (from LLM extraction)
    const messageTopics = topicsResponse.messageTopicMap[message.id] || [];
    for (const topic of messageTopics) {
      entities.relationships.push({
        type: 'DISCUSSES',
        from: message.id,
        fromType: 'Message',
        to: topic.name,
        toType: 'Topic',
        properties: { relevance: topic.relevance }
      });
    }
  }

  // Person MEMBER_OF Chat
  for (const member of members) {
    entities.relationships.push({
      type: 'MEMBER_OF',
      from: member.userId,
      fromType: 'Person',
      to: chatMetadata.id,
      toType: 'Chat',
      properties: {
        joinedAt: chatMetadata.created_at,
        messageCount: messages.filter(m => m.from.user.id === member.userId).length
      }
    });
  }

  return entities;
}
```

---

## 4. Query Patterns & Use Cases

### Vector Store Queries

| Use Case | Query Pattern | Filters |
|----------|---------------|---------|
| "What did we discuss about X?" | Semantic search on `content` | `topics` contains X |
| "Show me conversations from last week" | Semantic search | `date_bucket` >= last_week |
| "Find discussions with John" | Semantic search | `participants` contains "John" |
| "What were the action items?" | Semantic search: "action item" | `is_action_item` = true |

### Graph Queries

| Use Case | Query Pattern |
|----------|---------------|
| "Who talks to whom most?" | `MATCH (p1)-[:SENT]->()-[:IN_CHAT]->()<-[:IN_CHAT]-()<-[:SENT]-(p2)` |
| "What topics does John discuss?" | `MATCH (p:Person {name:"John"})-[:SENT]->()-[:DISCUSSES]->(t:Topic)` |
| "Who are the experts on X?" | `MATCH (p)-[:SENT]->()-[:DISCUSSES]->(:Topic {name:X})` |
| "Show me conversation threads" | `MATCH path = (m)-[:REPLIED_TO*]->(root)` |
| "Which chats overlap between A and B?" | `MATCH (a)-[:MEMBER_OF]->(c)<-[:MEMBER_OF]-(b)` |

### Hybrid Queries (Both Stores)

| Use Case | Strategy |
|----------|----------|
| "What did John and Jane discuss about feature X?" | 1. Graph: Find common chats between John & Jane<br>2. Vector: Semantic search in those chats for "feature X" |
| "Who were involved in decisions about Y?" | 1. Vector: Find decision messages about Y<br>2. Graph: Find participants in those chats |

---

## 5. Performance Considerations

### Vector Store Optimization

```python
# Batch inserts (faster than one-by-one)
batch_size = 100
for i in range(0, len(documents), batch_size):
  batch = documents[i:i+batch_size]
  collection.add(
    ids=[d['id'] for d in batch],
    documents=[d['content'] for d in batch],
    metadatas=[d['metadata'] for d in batch]
  )
```

### Graph Database Optimization

```cypher
// Use MERGE instead of CREATE to avoid duplicates
MERGE (p:Person {userId: $userId})
ON CREATE SET p.displayName = $displayName,
              p.firstSeenAt = datetime()
ON MATCH SET p.lastSeenAt = datetime(),
             p.messageCount = p.messageCount + 1

// Batch operations using UNWIND
UNWIND $messages AS msg
MERGE (m:Message {messageId: msg.id})
SET m.timestamp = datetime(msg.createdDateTime),
    m.contentSummary = msg.summary

// Use parameters for better query plan caching
MATCH (p:Person {userId: $userId})-[:SENT]->(m:Message)
WHERE m.timestamp >= $startDate AND m.timestamp <= $endDate
RETURN m
```

---

## 6. Data Consistency & Validation

### Validation Queries

```javascript
// Check vector-graph sync
async function validateSync() {
  // 1. Count chats in each store
  const sqliteCount = await db.get('SELECT COUNT(*) as count FROM chats');
  const vectorCount = await vectorDB.getCollectionStats();
  const graphCount = await graphDB.executeCypher('MATCH (c:Chat) RETURN count(c)');

  // 2. Find chats in SQLite but not in vector store
  const vectorStatus = await db.all(`
    SELECT chat_id FROM chats
    WHERE id NOT IN (SELECT chat_id FROM vector_index_status WHERE status = 'completed')
  `);

  // 3. Find chats in SQLite but not in graph
  const graphStatus = await db.all(`
    SELECT chat_id FROM chats
    WHERE id NOT IN (SELECT chat_id FROM graph_index_status WHERE status = 'completed')
  `);

  return {
    sqliteCount: sqliteCount.count,
    vectorCount,
    graphCount,
    vectorMissing: vectorStatus,
    graphMissing: graphStatus
  };
}
```

---

This schema design provides:
- ✅ Clear separation of concerns (semantic vs relational)
- ✅ Rich metadata for advanced filtering
- ✅ Optimized indexing strategies
- ✅ Concrete examples for implementation
- ✅ Performance considerations built-in
