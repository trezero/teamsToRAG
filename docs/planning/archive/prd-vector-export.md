# PRD: Bulk Export to Vector Database with RAG Search Interface

## Overview

Add functionality to export all cached chats to a local vector database (ChromaDB or Milvus) and provide an interactive chat interface for semantic search and RAG-based question answering across all Teams conversations.

## Goals

1. **Automated Bulk Export**: Process all chats from the SQLite cache and export them to a vector database
2. **Semantic Search**: Enable natural language search across all Teams conversations
3. **RAG Chat Interface**: Provide an interactive Q&A interface that retrieves relevant context from Teams chats
4. **Incremental Updates**: Only process new or updated chats to avoid redundant work
5. **Performance**: Handle large volumes of chat data efficiently with chunking and batching

## User Experience

### Main Menu Addition

```
╔════════════════════════════════════════╗
║   Teams to RAG Generator               ║
╚════════════════════════════════════════╝

Cache Status:
  Chats: 1514 cached (2h ago) ✓ valid
  Teams: 15 cached, 89 channels (2h ago) ✓ valid

Please select an option:

1. Find and export a chat (1:1 or group)
2. Find and export a channel
3. Generate from current .env settings
4. Refresh cache (force re-fetch from API)
5. Clear cache
6. Bulk export all chats to vector database
7. Search chats (RAG interface)
8. Exit

Enter your choice [1-8]:
```

### Option 6: Bulk Export Flow

```
Selected: Bulk export all chats to vector database

Vector Database Status:
  Total chats in cache: 1514
  Already indexed: 245
  New chats to process: 1269
  Updated chats to reprocess: 0

Configuration:
  Vector DB: ChromaDB (local)
  Storage: .vectordb/teams-chats
  Chunk size: 1000 tokens
  Overlap: 200 tokens
  Embedding model: all-MiniLM-L6-v2

Proceed with bulk export? (y/N): y

🔐 Authenticating...
✓ Authentication successful

Processing chats...
[████████████████████░░░░] 85% (1285/1514) - Current: "AI+ Dev Team Daily"
  ✓ Fetched 342 messages
  ✓ Generated 15 chunks
  ✓ Embedded and stored

Estimated time remaining: 2m 15s

✓ Bulk export complete!

Summary:
  Total chats processed: 1514
  Total messages: 45,823
  Total chunks created: 12,456
  Vector DB size: 1.2 GB
  Processing time: 18m 32s

Next steps:
  - Use option 7 to search your chats
  - Re-run this option to update with new messages
```

### Option 7: RAG Search Interface

```
Selected: Search chats (RAG interface)

Loading vector database...
✓ Loaded 12,456 chunks from 1514 chats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Teams Chat Search (RAG Interface)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
  /search <query>  - Semantic search only
  /ask <question>  - RAG-based Q&A
  /stats           - Show database statistics
  /exit            - Exit search interface

> /ask What were the main topics discussed in AI+ meetings?

🔍 Searching relevant conversations...
✓ Found 15 relevant chunks from 8 different chats

💬 Answer:

Based on your Teams conversations, the main topics discussed in AI+ meetings included:

1. **Product Launch Strategy**: Multiple discussions about the AI+ soft launch, 
   release checklists, and go-to-market (GTM) planning.

2. **SKU Development**: Several rounds of discussions about AI Plus SKUs, 
   including pricing and packaging decisions.

3. **Customer-Facing Materials**: Reviews of AI+ overview documents, internal 
   one-pagers, and sales deck content.

4. **Technical Integration**: Discussions about integrating AI+ with existing 
   products like Vision, Datacore, and WIN.

5. **Training and Enablement**: Planning for IMT training and webinar dry runs.

📎 Sources (8 chats):
  1. "AI+ Release Checklist Review" (19:meeting_NjM3NzU1...)
  2. "AI Plus Skus- Final Round" (19:meeting_N2Q3ZDViYjQt...)
  3. "AI+ Overview and deck review" (19:meeting_NjdjNGJkYjQt...)
  4. "Check point for AI+ softlaunch" (19:meeting_ODljNzRlMGUt...)
  5. "AI + GTM" (19:meeting_NGZiNzBjYTctOWMwZS...)
  [+3 more]

> /search Jason Perr meetings last month

🔍 Searching...
✓ Found 23 results

Results:
  1. [1:1] Jason Perr (Score: 0.95)
     Last message: "Let's sync up on the Q1 roadmap tomorrow"
     Date: 2024-10-28
     
  2. Jason and Abhi meeting (Score: 0.92)
     Last message: "Thanks for the demo walkthrough"
     Date: 2024-10-25
     
  3. Jason- Deepika (Score: 0.89)
     Last message: "Following up on the customer feedback"
     Date: 2024-10-22
     
  [+20 more results]

Show full conversation? Enter number (1-23) or 'n' for next page: 1

[Displaying full conversation from chat #1...]

> /stats

Vector Database Statistics:
  Total chats indexed: 1514
  Total messages: 45,823
  Total chunks: 12,456
  Average messages per chat: 30.3
  
  Date range: 2023-01-15 to 2024-10-31
  
  Storage:
    Vector DB size: 1.2 GB
    Metadata DB size: 45 MB
    Total disk usage: 1.25 GB
  
  Last updated: 2024-10-31 12:15:32
  Last full sync: 2024-10-31 10:30:15

> /exit

Exiting search interface...
```

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Teams to RAG App                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ SQLite Cache │──────│ Bulk Exporter│                │
│  │  (Chats)     │      │   Module     │                │
│  └──────────────┘      └───────┬──────┘                │
│                                 │                        │
│                                 ▼                        │
│                        ┌────────────────┐               │
│                        │  Chunking &    │               │
│                        │  Embedding     │               │
│                        └───────┬────────┘               │
│                                │                        │
│                                ▼                        │
│                        ┌────────────────┐               │
│                        │   ChromaDB     │               │
│                        │  Vector Store  │               │
│                        └───────┬────────┘               │
│                                │                        │
│                                ▼                        │
│                        ┌────────────────┐               │
│                        │  RAG Search    │               │
│                        │   Interface    │               │
│                        └────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### New Modules

#### 1. `src/vectorDB.js`
- Initialize ChromaDB collection
- Store chat chunks with metadata
- Retrieve similar chunks by embedding
- Track indexing status per chat
- Handle incremental updates

#### 2. `src/bulkExporter.js`
- Iterate through all chats in SQLite cache
- Fetch messages for each chat using existing `teamsClient.js`
- Generate markdown using existing `ragGenerator.js`
- Chunk documents intelligently (by message groups, date, or token count)
- Embed chunks and store in vector DB
- Track progress and handle errors gracefully
- Skip already-indexed chats (check by chat ID + last updated timestamp)

#### 3. `src/chunking.js`
- Split long conversations into semantic chunks
- Preserve message boundaries (don't split mid-message)
- Add overlap between chunks for context continuity
- Include metadata: chat ID, date range, participants, chunk index
- Target chunk size: ~1000 tokens with 200 token overlap

#### 4. `src/ragSearch.js`
- Interactive CLI search interface
- Semantic search using vector similarity
- RAG-based Q&A using retrieved context
- Format and display results with source attribution
- Commands: `/search`, `/ask`, `/stats`, `/exit`

#### 5. `src/llmClient.js` (optional, for RAG Q&A)
- Integration with local LLM (Ollama) or OpenAI API
- Generate answers based on retrieved context
- Format prompts with chat context
- Handle streaming responses

### Data Models

#### Vector Database Schema (ChromaDB Collection)

```javascript
{
  collection_name: "teams_chats",
  metadata: {
    description: "Microsoft Teams chat conversations",
    created_at: "2024-10-31T12:00:00Z"
  }
}
```

#### Document Structure

```javascript
{
  id: "chat_19:meeting_ABC123_chunk_0",
  embedding: [0.123, 0.456, ...], // 384-dim vector
  document: "Markdown content of chunk...",
  metadata: {
    chat_id: "19:meeting_ABC123...",
    chat_name: "AI+ Dev Team Daily",
    chat_type: "meeting",
    chunk_index: 0,
    total_chunks: 15,
    date_range_start: "2024-10-01",
    date_range_end: "2024-10-15",
    message_count: 23,
    participants: ["Alice", "Bob", "Charlie"],
    indexed_at: "2024-10-31T12:15:32Z",
    last_message_timestamp: "2024-10-15T14:30:00Z"
  }
}
```

#### Indexing Status Table (SQLite)

```sql
CREATE TABLE vector_index_status (
  chat_id TEXT PRIMARY KEY,
  last_indexed_at INTEGER,
  last_message_timestamp INTEGER,
  chunk_count INTEGER,
  message_count INTEGER,
  status TEXT, -- 'indexed', 'failed', 'pending'
  error_message TEXT,
  FOREIGN KEY (chat_id) REFERENCES chats(id)
);
```

### Dependencies

New packages to install:
```json
{
  "chromadb": "^1.8.1",           // Vector database
  "langchain": "^0.1.0",          // Chunking and RAG utilities
  "@langchain/community": "^0.0.20", // ChromaDB integration
  "tiktoken": "^1.0.10",          // Token counting
  "ollama": "^0.5.0"              // Optional: local LLM
}
```

Alternative: Use Milvus Lite instead of ChromaDB
```json
{
  "@zilliz/milvus2-sdk-node": "^2.3.5"
}
```

### Processing Strategy

#### Incremental Indexing
1. Query SQLite cache for all chats
2. For each chat, check `vector_index_status` table:
   - If not indexed: Process fully
   - If indexed but `last_message_timestamp` > `last_indexed_at`: Reprocess
   - If indexed and up-to-date: Skip
3. Batch process chats in groups of 10-20 for efficiency
4. Update status table after each successful indexing

#### Chunking Strategy
- **Option A: Message-based chunks** (Recommended)
  - Group 10-20 messages per chunk
  - Preserve conversation flow
  - Include date headers
  
- **Option B: Token-based chunks**
  - Split at ~1000 tokens
  - Respect message boundaries
  - Add 200 token overlap

- **Option C: Date-based chunks**
  - One chunk per day or week
  - Good for long-running chats
  - Maintains temporal context

#### Embedding Strategy
- Use `all-MiniLM-L6-v2` (384 dimensions, fast, good quality)
- Batch embed chunks (32-64 at a time)
- Cache embeddings to avoid recomputation

### Error Handling

1. **Authentication failures**: Retry with exponential backoff
2. **Rate limiting**: Respect Microsoft Graph API limits (batch requests)
3. **Missing chats**: Log and continue with others
4. **Embedding failures**: Retry individual chunks, log failures
5. **Vector DB errors**: Rollback batch, retry with smaller batch size
6. **Disk space**: Check available space before starting, warn if low

### Performance Considerations

#### Estimated Processing Time
- 1514 chats × 30 messages avg = ~45,000 messages
- Fetch rate: ~100 messages/second (with batching)
- Embedding rate: ~500 chunks/second (batched)
- Total time: ~15-20 minutes for full index

#### Optimization Strategies
1. **Parallel processing**: Process 5-10 chats concurrently
2. **Batch API calls**: Use `$batch` endpoint for message fetching
3. **Batch embeddings**: Embed 64 chunks at once
4. **Progress persistence**: Save progress every 50 chats (resume on failure)
5. **Memory management**: Process in batches, clear memory between batches

### RAG Search Implementation

#### Search Flow
1. User enters query
2. Embed query using same model
3. Vector similarity search in ChromaDB (top-k=10-20)
4. Rerank results by relevance
5. Display results with metadata

#### Q&A Flow
1. User asks question
2. Retrieve top-k relevant chunks (k=5-10)
3. Construct prompt with context
4. Send to LLM (Ollama or OpenAI)
5. Stream response to user
6. Show source attribution

#### Prompt Template
```
You are a helpful assistant that answers questions based on Microsoft Teams chat conversations.

Context from relevant chats:
---
{chunk_1}
Source: {chat_name_1} ({date_range_1})

{chunk_2}
Source: {chat_name_2} ({date_range_2})
---

Question: {user_question}

Instructions:
- Answer based only on the provided context
- Cite specific chats when referencing information
- If the context doesn't contain enough information, say so
- Be concise but thorough

Answer:
```

## User Feedback

### Progress Indicators
- Real-time progress bar with percentage
- Current chat being processed
- Estimated time remaining
- Success/failure counts
- Retry attempts for failed chats

### Summary Statistics
- Total chats processed
- Total messages indexed
- Total chunks created
- Processing time
- Vector DB size
- Failed chats (with option to retry)

## Configuration

### Environment Variables
```env
# Vector Database
VECTOR_DB_TYPE=chromadb          # or 'milvus'
VECTOR_DB_PATH=.vectordb/teams   # Local storage path
EMBEDDING_MODEL=all-MiniLM-L6-v2 # Sentence transformer model
CHUNK_SIZE=1000                   # Target tokens per chunk
CHUNK_OVERLAP=200                 # Overlap tokens
BATCH_SIZE=10                     # Chats to process in parallel

# RAG Search
LLM_PROVIDER=ollama              # 'ollama', 'openai', or 'none'
LLM_MODEL=llama3.1               # Model name
LLM_TEMPERATURE=0.7              # Response creativity
MAX_CONTEXT_CHUNKS=5             # Chunks to include in prompt
```

## Success Criteria

1. ✅ Successfully index all 1514 chats from cache
2. ✅ Search returns relevant results in < 1 second
3. ✅ RAG answers are accurate and cite sources
4. ✅ Incremental updates only process new/changed chats
5. ✅ Handle failures gracefully with retry logic
6. ✅ Vector DB size is reasonable (< 2GB for 1500 chats)
7. ✅ Processing time is acceptable (< 30 minutes for full index)
8. ✅ Search interface is intuitive and responsive

## Out of Scope

- **Multi-user support**: Single-user local deployment only
- **Cloud vector DB**: Only local ChromaDB/Milvus
- **Advanced RAG**: No query rewriting, hypothetical documents, etc.
- **GUI interface**: CLI only
- **Real-time sync**: Manual refresh only
- **Multi-language support**: English only
- **Custom embedding models**: Use pre-trained models only
- **Distributed processing**: Single machine only

## Implementation Phases

### Phase 1: Vector DB Setup (2-3 hours)
- Install ChromaDB
- Create `vectorDB.js` module
- Initialize collection
- Test basic CRUD operations
- Add indexing status table to SQLite

### Phase 2: Chunking & Embedding (3-4 hours)
- Create `chunking.js` module
- Implement message-based chunking
- Integrate sentence-transformers
- Test chunking on sample chats
- Optimize chunk size and overlap

### Phase 3: Bulk Exporter (4-5 hours)
- Create `bulkExporter.js` module
- Implement incremental indexing logic
- Add progress tracking
- Implement error handling and retries
- Add batch processing
- Test with subset of chats

### Phase 4: Search Interface (3-4 hours)
- Create `ragSearch.js` module
- Implement semantic search
- Build interactive CLI
- Add result formatting
- Test search quality

### Phase 5: RAG Q&A (Optional, 3-4 hours)
- Create `llmClient.js` module
- Integrate Ollama or OpenAI
- Implement RAG pipeline
- Add prompt engineering
- Test answer quality

### Phase 6: Menu Integration (1-2 hours)
- Add options 6 and 7 to main menu
- Update menu display
- Add configuration validation
- Update documentation

### Phase 7: Testing & Polish (2-3 hours)
- End-to-end testing
- Performance optimization
- Error handling improvements
- Documentation updates
- README updates

**Total Estimated Time: 18-25 hours**

## Testing Approach

### Unit Tests
- Chunking logic with various message patterns
- Embedding generation and storage
- Vector similarity search
- Incremental update detection

### Integration Tests
- Full bulk export of 10 sample chats
- Search across indexed chats
- RAG Q&A with known questions
- Incremental update workflow

### Performance Tests
- Index 100 chats, measure time
- Search latency with various query types
- Memory usage during bulk export
- Disk space usage

### User Acceptance Tests
- Export all cached chats successfully
- Search returns relevant results
- RAG answers are accurate
- Interface is intuitive

## Migration Path

1. Users run option 6 to perform initial bulk export
2. Subsequent runs only process new/updated chats
3. Option to force full reindex if needed
4. Export existing markdown files to vector DB (optional)

## Documentation Updates

### README.md
- Add "Vector Database Search" section
- Document bulk export process
- Document RAG search interface
- Add configuration options
- Add troubleshooting guide

### New Files
- `docs/VECTOR_SEARCH.md` - Detailed search guide
- `docs/RAG_SETUP.md` - Setup and configuration
- `.env.sample` - Add vector DB variables

## Future Enhancements (Not in Scope)

1. **Advanced RAG techniques**
   - Query rewriting
   - Hypothetical document embeddings
   - Multi-query retrieval

2. **Web interface**
   - React-based search UI
   - Chat history visualization
   - Export search results

3. **Analytics**
   - Most discussed topics
   - Participant interaction graphs
   - Sentiment analysis

4. **Integrations**
   - Slack export support
   - Email integration
   - Calendar event context

5. **Cloud deployment**
   - Hosted vector DB (Pinecone, Weaviate)
   - API endpoint for search
   - Multi-tenant support

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large vector DB size | High disk usage | Implement compression, offer cleanup options |
| Slow bulk export | Poor UX | Show progress, allow background processing |
| Poor search quality | Low adoption | Fine-tune chunking, use better embeddings |
| API rate limits | Failed exports | Implement backoff, batch requests |
| Memory issues | Crashes | Process in smaller batches, clear memory |
| LLM hallucinations | Incorrect answers | Emphasize source attribution, allow search-only mode |

## Conclusion

This feature will transform the Teams to RAG tool from a simple export utility into a powerful knowledge base that enables semantic search and intelligent Q&A across all Teams conversations. The incremental approach ensures users can start with basic search and optionally add RAG capabilities later.
