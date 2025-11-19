# User Stories: Unified Teams Knowledge Base

User stories for the dual-storage Teams knowledge base system, organized by implementation phases from the PRD.

---

## Epic 1: Docker Foundation (Phase 1)

### Story 1.1: One-Command Setup
**As a** developer new to the project
**I want** to start the entire application with a single Docker command
**So that** I don't have to manually install and configure multiple services

**Acceptance Criteria:**
- [ ] Running `docker-compose up --build` starts all services (app, ChromaDB, Neo4j, Ollama)
- [ ] All services successfully connect to each other within the Docker network
- [ ] The main application CLI menu appears in the terminal
- [ ] Services start in the correct order (databases before app)
- [ ] Clear error messages if any service fails to start

**Technical Notes:**
- Create `Dockerfile` for Node.js app with all dependencies
- Configure `docker-compose.yml` with service dependencies (`depends_on`)
- Use `stdin_open: true` and `tty: true` for interactive CLI
- Reference: PRD Section 4 (Docker Compose Network diagram)

**Definition of Done:**
- Fresh clone → `docker-compose up` → menu appears in <2 minutes
- No manual installation steps required (except Docker itself)

---

### Story 1.2: Persistent Data Storage
**As a** user of the knowledge base
**I want** my indexed data to persist between application restarts
**So that** I don't have to re-index all my chats every time

**Acceptance Criteria:**
- [ ] Vector data persists in Docker volume `chroma-data`
- [ ] Graph data persists in Docker volume `neo4j-data`
- [ ] LLM models persist in Docker volume `ollama-data`
- [ ] SQLite cache persists in bind mount `./cache`
- [ ] `docker-compose down` followed by `docker-compose up` preserves all data
- [ ] `docker-compose down -v` correctly removes all volumes (for clean reset)

**Technical Notes:**
- Define named volumes in `docker-compose.yml`
- Mount SQLite cache as bind volume for easy access
- Document volume locations in README

**Definition of Done:**
- Index 100 chats → Stop containers → Restart → Query works immediately
- Documentation explains how to back up volumes

---

### Story 1.3: Service Health Monitoring
**As a** user troubleshooting connection issues
**I want** to see the health status of all services
**So that** I can identify which service is causing problems

**Acceptance Criteria:**
- [ ] Each service in `docker-compose.yml` has a healthcheck defined
- [ ] `docker-compose ps` shows health status (healthy/unhealthy)
- [ ] Application displays service connection status in menu
- [ ] Failed service connections show helpful error messages

**Technical Notes:**
- Add healthcheck for ChromaDB (HTTP endpoint `/api/v1/heartbeat`)
- Add healthcheck for Neo4j (Cypher query `RETURN 1`)
- Add healthcheck for Ollama (HTTP endpoint `/api/tags`)
- Create `healthCheck.js` module for app-level checks
- Reference: DATA_SCHEMAS.md Section 3 (validation queries)

**Definition of Done:**
- Stop Neo4j service → App shows clear error: "Cannot connect to Knowledge Graph"
- `docker-compose ps` accurately reflects service states

---

### Story 1.4: Environment Configuration
**As a** user setting up the application
**I want** a clear configuration file with documented options
**So that** I can customize database passwords and service URLs

**Acceptance Criteria:**
- [ ] `.env.sample` includes all required variables with descriptions
- [ ] Application validates required env vars on startup
- [ ] Missing critical variables (e.g., `NEO4J_PASSWORD`) show clear errors
- [ ] Service hostnames use Docker service names (e.g., `chromadb:8000`)
- [ ] README explains which variables must be changed vs defaults

**Technical Notes:**
- Update `.env.sample` with all new variables from PRD Section 4.6
- Add validation in startup code (`index.js`)
- Document security note: Change default Neo4j password

**Definition of Done:**
- User edits `.env`, sets password → `docker-compose up` → works
- Missing `NEO4J_PASSWORD` → Clear error before startup

---

## Epic 2: Dual Database Setup (Phase 2)

### Story 2.1: Vector Store Initialization
**As a** developer setting up the knowledge base
**I want** ChromaDB to automatically initialize with the correct collection
**So that** I can immediately start indexing messages

**Acceptance Criteria:**
- [ ] Application creates `teams_messages` collection on first run
- [ ] Collection uses cosine similarity for embeddings
- [ ] HNSW index is configured with optimal parameters (M=16, ef_construction=200)
- [ ] Collection metadata is stored (description, config)
- [ ] Initialization is idempotent (safe to run multiple times)

**Technical Notes:**
- Create `src/vectorDB.js` module with `initializeCollection()` function
- Use ChromaDB client library to connect to `http://chromadb:8000`
- Reference: DATA_SCHEMAS.md Section 1 (Collection Configuration)

**Definition of Done:**
- First run creates collection with correct settings
- Second run doesn't fail or duplicate collection

---

### Story 2.2: Knowledge Graph Initialization
**As a** developer setting up the knowledge base
**I want** Neo4j to automatically create constraints and indexes
**So that** graph queries are fast and data integrity is enforced

**Acceptance Criteria:**
- [ ] Application creates all node uniqueness constraints (Person.userId, Chat.chatId, etc.)
- [ ] Application creates all indexes (timestamps, names, composite indexes)
- [ ] Full-text indexes are created for Person names and Topic names
- [ ] Initialization is idempotent
- [ ] Initialization completes in <10 seconds

**Technical Notes:**
- Create `src/graphDB.js` module with `initializeSchema()` function
- Use Neo4j driver to connect to `bolt://neo4j:7687`
- Execute Cypher commands from DATA_SCHEMAS.md Section 2
- Handle "already exists" errors gracefully

**Definition of Done:**
- First run creates all constraints and indexes
- Query: `SHOW CONSTRAINTS` and `SHOW INDEXES` returns expected results
- Re-running doesn't error

---

### Story 2.3: SQLite Tracking Tables
**As a** system tracking indexing progress
**I want** SQLite tables to record which chats are indexed in each store
**So that** I can implement incremental updates and troubleshoot sync issues

**Acceptance Criteria:**
- [ ] `vector_index_status` table exists with all fields from DATA_SCHEMAS.md
- [ ] `graph_index_status` table exists with all fields from DATA_SCHEMAS.md
- [ ] Indexes are created on `status` and `updated_at` columns
- [ ] Foreign keys reference existing `chats` table
- [ ] Migration script handles existing databases

**Technical Notes:**
- Add migration logic to `src/cache.js`
- Run migration on app startup (check if tables exist)
- Reference: DATA_SCHEMAS.md Section 1.2 and 2.6

**Definition of Done:**
- Fresh database → Tables created automatically
- Existing database → Tables added without data loss

---

### Story 2.4: Connection Validation
**As a** user running the knowledge base menu
**I want** to see if databases are reachable before attempting operations
**So that** I get immediate feedback on configuration issues

**Acceptance Criteria:**
- [ ] Menu shows connection status for ChromaDB, Neo4j, and Ollama
- [ ] Connection check happens at startup (with timeout)
- [ ] Failed connections show specific error (wrong password, wrong URL, etc.)
- [ ] User can retry connection without restarting app

**Technical Notes:**
- Create `validateConnections()` function in `src/index.js`
- Test vector DB: Try to list collections
- Test graph DB: Try to run `RETURN 1`
- Test LLM: Try to list models
- Display results in menu header (like cache status)

**Definition of Done:**
- Stop Neo4j → Menu shows "❌ Knowledge Graph: disconnected"
- Fix Neo4j → Refresh menu → Shows "✓ Knowledge Graph: connected"

---

## Epic 3: Data Processing Pipelines (Phase 3)

### Story 3.1: Semantic Message Chunking
**As a** system processing chat messages
**I want** to split messages into semantically meaningful chunks
**So that** vector search returns relevant conversation segments

**Acceptance Criteria:**
- [ ] Chunks respect token limits (max 400 tokens to stay under 512 embedding limit)
- [ ] Chunks preserve conversational context (2-10 messages per chunk)
- [ ] Large time gaps (>4 hours) trigger new chunks (new conversation threads)
- [ ] Last message of each chunk overlaps with first message of next chunk
- [ ] Chunks include metadata (timestamp range, participants, message IDs)

**Technical Notes:**
- Create `src/chunking.js` module
- Implement `chunkMessages()` function from DATA_SCHEMAS.md Section 1.3
- Use simple token estimation: `tokens ≈ content.length / 4`
- Handle edge cases: very long single messages, empty messages

**Definition of Done:**
- 100-message chat → Produces 10-15 chunks
- Each chunk has 2-10 messages
- No chunk exceeds 400 tokens

---

### Story 3.2: LLM-Based Entity Extraction
**As a** system building the knowledge graph
**I want** to extract people, topics, and relationships from conversations
**So that** users can query "who talked about what"

**Acceptance Criteria:**
- [ ] Extract person names from message metadata (senders)
- [ ] Extract topics using LLM analysis (3-5 main topics per chat)
- [ ] Topics are normalized (e.g., "Q1 Planning" and "Q1 planning" → same topic)
- [ ] Confidence scores are assigned to extracted topics (0-1)
- [ ] Extraction handles LLM failures gracefully (retries, fallbacks)

**Technical Notes:**
- Create `src/entityExtractor.js` module
- Use Ollama service at `http://ollama:11434`
- Prompt template: See PRD architectural review comments
- Parse JSON response from LLM (with error handling for invalid JSON)
- Batch messages (10-20 at a time) to avoid context limit

**Definition of Done:**
- 50-message chat about "Q1 planning" → Extracts topic "Q1 Planning"
- Invalid LLM response → Logs error, continues with next batch
- Extraction completes in <1 second per 10 messages

---

### Story 3.3: Vector Embedding Generation
**As a** system preparing data for semantic search
**I want** to generate embeddings for each message chunk
**So that** I can store them in ChromaDB

**Acceptance Criteria:**
- [ ] Uses configured embedding model (default: `all-MiniLM-L6-v2`)
- [ ] Embeddings are 384-dimensional vectors
- [ ] Batching: Process 50 chunks at a time for efficiency
- [ ] Embeddings are generated before ChromaDB insertion
- [ ] Handles embedding failures (logs, retries, skips bad chunks)

**Technical Notes:**
- Use sentence-transformers library (if Python) or equivalent JS library
- Or call Ollama's embedding API: `POST /api/embeddings`
- Reference: PRD Section 4.6 (Configuration)

**Definition of Done:**
- 100 chunks → Generates 100 embeddings
- Each embedding is 384-dim array of floats
- Process completes in <30 seconds (depends on CPU)

---

### Story 3.4: Graph Relationship Builder
**As a** system building the knowledge graph
**I want** to create nodes and relationships from chat data
**So that** users can query connections between people and topics

**Acceptance Criteria:**
- [ ] Creates Person nodes for all chat members (with deduplication)
- [ ] Creates Chat nodes with metadata (topic, type, counts)
- [ ] Creates Message nodes (lightweight, with summary)
- [ ] Creates Topic nodes from LLM extraction
- [ ] Creates all relationships: MEMBER_OF, SENT, IN_CHAT, DISCUSSES
- [ ] Uses MERGE (not CREATE) to avoid duplicates

**Technical Notes:**
- Create `src/graphBuilder.js` module
- Use `UNWIND` for batch operations (faster than individual queries)
- Use transactions for atomicity (all-or-nothing per chat)
- Reference: DATA_SCHEMAS.md Section 2 (all node and relationship types)

**Definition of Done:**
- 10-person chat with 50 messages → Creates 10 Person, 1 Chat, 50 Message, ~5 Topic nodes
- Running twice doesn't duplicate nodes
- All relationships are correctly linked

---

## Epic 4: Bulk Exporter Orchestration (Phase 4)

### Story 4.1: Full Knowledge Base Build
**As a** user with 1500 cached chats
**I want** to export all chats to both vector and graph stores
**So that** I can start querying my complete Teams history

**Acceptance Criteria:**
- [ ] Menu option 6: "Build/Update Knowledge Base"
- [ ] Shows status: Total chats, Already indexed, To be processed
- [ ] Shows configuration: Vector DB type, Graph DB type, LLM model
- [ ] Prompts for confirmation before processing
- [ ] Processes chats in batches (10 at a time) to manage memory
- [ ] Shows progress: "Processing chat 42/1500 (3%)"
- [ ] Updates tracking tables after each chat succeeds
- [ ] Logs errors but continues processing remaining chats

**Technical Notes:**
- Create `src/bulkExporter.js` module with `buildKnowledgeBase()` function
- Query SQLite: Get all chats not in `vector_index_status` with status='completed'
- For each chat:
  1. Fetch messages (reuse `teamsClient.js`)
  2. Chunk messages → Embed → Insert to ChromaDB
  3. Extract entities → Insert to Neo4j
  4. Update both tracking tables
- Use ora spinners for progress indication

**Definition of Done:**
- 100 chats complete processing in <30 minutes
- All 100 chats appear in both ChromaDB and Neo4j
- Tracking tables show status='completed' for all 100

---

### Story 4.2: Incremental Knowledge Base Updates
**As a** user who previously indexed chats
**I want** to only process new messages since the last run
**So that** I don't waste time re-processing old data

**Acceptance Criteria:**
- [ ] System detects chats with `last_indexed_timestamp` in tracking tables
- [ ] Only fetches messages created after `last_indexed_timestamp`
- [ ] Updates existing vector chunks (appends new chunks)
- [ ] Updates existing graph nodes (adds new Message nodes, relationships)
- [ ] Updates tracking tables with new timestamp and counts

**Technical Notes:**
- Modify `bulkExporter.js` to check tracking tables first
- Use `sinceDate` parameter in `fetchChatMessages()` (reuse existing incremental logic)
- For vector store: Append new chunks with incremented `chunk_index`
- For graph store: Add new Message nodes, update Person/Topic message counts
- Reference: Existing incremental logic in `ragGenerator.js`

**Definition of Done:**
- Index 100 chats → Add 50 new messages to 1 chat → Re-run
- System processes only 1 chat, adds only new messages
- Query returns both old and new messages

---

### Story 4.3: Error Handling and Recovery
**As a** system administrator
**I want** failed chat processing to not halt the entire bulk export
**So that** I can review and retry failures separately

**Acceptance Criteria:**
- [ ] Errors during processing are caught and logged
- [ ] Failed chats have status='failed' in tracking tables
- [ ] Error message is stored in `error_message` field
- [ ] Bulk export continues to next chat after failure
- [ ] Summary report shows: Succeeded, Failed, Skipped
- [ ] User can re-run to retry failed chats only

**Technical Notes:**
- Wrap each chat processing in try-catch
- Log full error stack trace to file (`logs/bulk-export.log`)
- Use structured logging (JSON) for easier parsing
- Add CLI option: `--retry-failed` to reprocess failed chats

**Definition of Done:**
- Process 100 chats, 5 fail (e.g., API errors)
- Summary: "95 succeeded, 5 failed"
- Tracking table shows 5 with status='failed' and error messages
- Re-run with `--retry-failed` → Processes only those 5

---

### Story 4.4: Progress Persistence
**As a** user running a long bulk export
**I want** progress to be saved continuously
**So that** I can safely stop and resume the process

**Acceptance Criteria:**
- [ ] Tracking tables are updated immediately after each chat completes
- [ ] Stopping the process (Ctrl+C) doesn't corrupt data
- [ ] Resuming continues from last completed chat (no duplicates)
- [ ] Progress percentage is accurate (based on tracking table status)

**Technical Notes:**
- Use database transactions per chat (not per batch)
- Handle SIGINT (Ctrl+C) gracefully: Wait for current chat to finish
- On startup, query tracking tables to calculate progress

**Definition of Done:**
- Start export of 100 chats → Stop after 30 → Resume
- System processes remaining 70 chats
- No duplicates in vector or graph stores

---

## Epic 5: Agentic Search Interface (Phase 5)

### Story 5.1: Query Intent Classification
**As a** user asking a question
**I want** the system to automatically route my query to the right data store
**So that** I get the most relevant results

**Acceptance Criteria:**
- [ ] "What" questions → Vector search (semantic content)
- [ ] "Who" questions → Graph search (relationships)
- [ ] "When" questions → Graph search (temporal queries)
- [ ] "How are X and Y related?" → Graph search
- [ ] Complex questions → Hybrid search (both stores)
- [ ] Intent classification uses simple rules first, LLM as fallback

**Technical Notes:**
- Create `src/agenticRouter.js` module
- Intent classification logic:
  1. Keyword matching (fast): "what" → vector, "who" → graph
  2. If ambiguous, use LLM: "Classify this query as: [semantic|relational|hybrid]"
- Return: `{intent: 'vector'|'graph'|'hybrid', confidence: 0.9}`

**Definition of Done:**
- "What was discussed about Q1?" → Routes to vector
- "Who did John work with?" → Routes to graph
- "What did John discuss with Jane?" → Routes to hybrid

---

### Story 5.2: Vector Search Execution
**As a** system routing a semantic query
**I want** to search ChromaDB and return relevant chunks
**So that** I can provide context for LLM answer generation

**Acceptance Criteria:**
- [ ] Queries ChromaDB with user question as query text
- [ ] Returns top 5 results by default (configurable)
- [ ] Applies filters from query (e.g., date ranges, participants)
- [ ] Returns chunks with metadata (chat topic, participants, timestamp)
- [ ] Handles empty results gracefully

**Technical Notes:**
- Use `collection.query()` method
- Extract filters from user query (e.g., "last month" → date_bucket filter)
- Reference: DATA_SCHEMAS.md Section 1.6 (Example Vector Queries)

**Definition of Done:**
- Query: "database optimization" → Returns 5 relevant chunks
- Query: "Q1 planning last month" → Filters by date_bucket
- No results → Returns empty list (no error)

---

### Story 5.3: Graph Search with Cypher Generation
**As a** system routing a relational query
**I want** to dynamically generate Cypher queries from natural language
**So that** I can answer questions about people and relationships

**Acceptance Criteria:**
- [ ] Uses LLM to convert natural language → Cypher query
- [ ] Provides LLM with schema context (node types, relationships)
- [ ] Validates generated Cypher (basic syntax check)
- [ ] Executes Cypher against Neo4j
- [ ] Handles query errors (invalid Cypher, timeout)
- [ ] Returns structured results (list of nodes/relationships)

**Technical Notes:**
- Prompt template: "Given this graph schema: [schema], generate Cypher for: [user query]"
- Include example Cypher queries in prompt (few-shot learning)
- Use Neo4j `db.execute_read()` for safety (read-only)
- Reference: DATA_SCHEMAS.md Section 2.7 (Example Cypher Queries)

**Definition of Done:**
- "Who did John collaborate with?" → Generates valid Cypher → Returns list of people
- "What topics did the team discuss?" → Returns list of topics
- Invalid Cypher generated → System retries once, then returns error

---

### Story 5.4: Answer Synthesis
**As a** user receiving search results
**I want** the system to synthesize a natural language answer
**So that** I don't have to interpret raw search results

**Acceptance Criteria:**
- [ ] Combines search results (vector chunks OR graph data) with user query
- [ ] Uses LLM to generate natural language answer
- [ ] Answer cites sources (chat names, participants, dates)
- [ ] Answer is concise (max 300 words)
- [ ] If no results found, states "No relevant information found"

**Technical Notes:**
- Prompt template: "Given this context: [results], answer: [user query]"
- For vector results: Include chunk content + metadata
- For graph results: Format as bullet points
- Use configured LLM (Ollama)

**Definition of Done:**
- Query: "What did we discuss about features?" → Answer: "John and Jane discussed new features for Q1, including mockups and roadmap planning (from Q1 Planning chat, Jan 15)."
- No results → "I couldn't find any discussions about that topic."

---

### Story 5.5: Interactive Search Interface
**As a** user
**I want** a conversational interface to ask multiple questions
**So that** I can explore my Teams knowledge base interactively

**Acceptance Criteria:**
- [ ] Menu option 7: "Search Knowledge Base (Agentic RAG)"
- [ ] Shows connection status for all services
- [ ] Displays prompt: "Ask a question (or 'exit' to quit):"
- [ ] Shows query routing decision (e.g., "🔍 Using: Vector Search")
- [ ] Displays answer with formatted citations
- [ ] Supports multi-turn conversation (ask follow-up questions)
- [ ] Typing "exit" or "quit" returns to main menu

**Technical Notes:**
- Create `src/agenticSearch.js` module with `runSearchInterface()` function
- Use readline for interactive input
- Display routing decision for transparency
- Keep conversation history (last 3 Q&A pairs) for context

**Definition of Done:**
- User enters menu → Asks 5 questions → Gets 5 answers
- Can exit cleanly with "exit" command
- Routing decisions are shown for each query

---

## Epic 6: Menu Integration & Testing (Phase 6)

### Story 6.1: Main Menu Integration
**As a** user
**I want** new knowledge base options in the main menu
**So that** I can access all features from one place

**Acceptance Criteria:**
- [ ] Menu option 6: "Build/Update Knowledge Base (Vectors & Graph)"
- [ ] Menu option 7: "Search Knowledge Base (Agentic RAG)"
- [ ] Menu shows KB stats if available (e.g., "Indexed: 1500 chats, 75K chunks")
- [ ] Options are disabled with message if services not connected
- [ ] Existing menu options (1-5) still work

**Technical Notes:**
- Modify `src/menu.js` to add new options
- Query tracking tables for stats: `SELECT COUNT(*) FROM vector_index_status WHERE status='completed'`
- Check service health before showing menu

**Definition of Done:**
- Menu displays with 8 options (was 6, now 8)
- Selecting option 6 runs bulk exporter
- Selecting option 7 runs search interface

---

### Story 6.2: End-to-End Smoke Test
**As a** developer
**I want** to verify the complete workflow works
**So that** I'm confident the system is ready for use

**Test Scenario:**
1. Fresh clone → `docker-compose up --build`
2. Services start successfully, menu appears
3. Select option 1: Export 5 test chats from Teams
4. Select option 6: Build knowledge base (indexes 5 chats)
5. Select option 7: Search interface
   - Query: "What was discussed?" → Returns results
   - Query: "Who participated?" → Returns people
6. Stop containers → Restart → Query still works (data persisted)

**Acceptance Criteria:**
- [ ] All steps complete without errors
- [ ] Search returns correct results
- [ ] Data persists after restart

**Definition of Done:**
- Complete test scenario documented
- All acceptance criteria met
- No manual fixes required

---

### Story 6.3: Performance Benchmarking
**As a** system administrator
**I want** to know performance characteristics under load
**So that** I can set user expectations

**Benchmarks:**
- [ ] Bulk export: Chats processed per minute
- [ ] Vector search: Query latency (p50, p95, p99)
- [ ] Graph search: Query latency (p50, p95, p99)
- [ ] End-to-end RAG: Total time from question to answer

**Targets (from architectural review):**
- Bulk export: >100 chats/minute
- Vector search: <500ms p95
- Graph query: <1s p95
- RAG query: <3s end-to-end

**Technical Notes:**
- Create `scripts/benchmark.js`
- Test with 100, 500, 1000 chats
- Log results to CSV for analysis

**Definition of Done:**
- Benchmark script runs successfully
- Results documented in `docs/PERFORMANCE.md`
- Targets are met or gaps identified

---

### Story 6.4: Documentation Completion
**As a** new user
**I want** comprehensive documentation
**So that** I can set up and use the system without help

**Documentation Requirements:**
- [ ] README.md: Docker-first quick start (3-step setup)
- [ ] README.md: Configuration guide (`.env` variables explained)
- [ ] README.md: Usage guide (all menu options documented)
- [ ] README.md: Data persistence and backup instructions
- [ ] README.md: Troubleshooting common issues
- [ ] docs/DEVELOPMENT.md: Local development without Docker
- [ ] docs/ARCHITECTURE.md: System design overview
- [ ] DATA_SCHEMAS.md: Already created ✅
- [ ] USER_STORIES.md: This file ✅

**Acceptance Criteria:**
- [ ] Complete rewrite of README.md (Docker-first)
- [ ] All code examples are accurate and tested
- [ ] Screenshots or ASCII diagrams where helpful
- [ ] Links to external resources (Docker docs, Neo4j docs)

**Definition of Done:**
- New user can follow README and get system running in <15 minutes
- All questions anticipated in troubleshooting section

---

## Non-Functional User Stories

### Story NF-1: Resource Constraints Documentation
**As a** user with limited hardware
**I want** to know minimum system requirements
**So that** I don't waste time on a system that can't run this

**Acceptance Criteria:**
- [ ] README documents minimum requirements: 16GB RAM, 20GB disk
- [ ] README explains why (Neo4j + Ollama + ChromaDB + models)
- [ ] README suggests alternatives (smaller LLM models, remote services)

---

### Story NF-2: Data Privacy
**As a** user with sensitive chat data
**I want** to know where my data is stored and who can access it
**So that** I can comply with company policies

**Acceptance Criteria:**
- [ ] Documentation states: All data stored locally (Docker volumes)
- [ ] No data sent to external services (except Microsoft Graph API for fetching)
- [ ] LLM runs locally (Ollama), no cloud API calls
- [ ] Instructions for backing up and encrypting volumes

---

### Story NF-3: Observability
**As a** developer debugging issues
**I want** detailed logs of all operations
**So that** I can diagnose failures

**Acceptance Criteria:**
- [ ] All errors logged to `logs/` directory with timestamps
- [ ] Log levels: ERROR, WARN, INFO, DEBUG (configurable)
- [ ] Key operations logged: Bulk export progress, query routing decisions, API calls
- [ ] Logs use structured format (JSON) for easy parsing

---

## Implementation Priority

### Must-Have (MVP)
- Stories 1.1, 1.2, 1.4 (Docker setup)
- Stories 2.1, 2.2, 2.3 (Database initialization)
- Stories 3.1, 3.2, 3.4 (Data processing)
- Stories 4.1, 4.3 (Bulk export with error handling)
- Stories 5.1, 5.2, 5.4, 5.5 (Vector search and interface)
- Story 6.1 (Menu integration)

### Should-Have (Enhanced Experience)
- Story 1.3 (Health monitoring)
- Story 3.3 (Embeddings - may be handled by library)
- Story 4.2 (Incremental updates)
- Story 5.3 (Graph search with Cypher)
- Story 6.4 (Documentation)

### Nice-to-Have (Future)
- Story 4.4 (Progress persistence)
- Stories 6.2, 6.3 (Testing and benchmarking)
- NF stories (non-functional)

---

## Story Point Estimates (Rough)

| Epic | Stories | Story Points | Hours |
|------|---------|--------------|-------|
| Epic 1 (Docker) | 4 | 13 | 4-6h |
| Epic 2 (DB Setup) | 4 | 8 | 2-3h |
| Epic 3 (Pipelines) | 4 | 21 | 5-7h |
| Epic 4 (Bulk Export) | 4 | 21 | 4-6h |
| Epic 5 (Search) | 5 | 34 | 6-8h |
| Epic 6 (Integration) | 4 | 13 | 2-3h |
| **Total** | **25** | **110** | **23-33h** |

---

## Acceptance Test Scenarios

### Scenario 1: Fresh Installation
```bash
# Given: Fresh clone, Docker installed
git clone <repo>
cd teamsToRAG
cp .env.sample .env
# Edit .env: Set NEO4J_PASSWORD

# When: Start application
docker-compose up --build

# Then:
# - All services start (green health checks)
# - Menu appears with 8 options
# - Option 6 and 7 show "Not yet indexed"
```

### Scenario 2: First Indexing
```bash
# Given: Application running, 100 chats in cache

# When: Select option 6 (Build KB)
# Then:
# - Shows "100 chats to process"
# - Progress indicator updates
# - Completes in <10 minutes
# - Success message: "Indexed 100 chats"

# When: Select option 7 (Search)
# Then:
# - Shows "✓ Connected" for all services
# - Prompt appears
```

### Scenario 3: Semantic Search
```bash
# Given: Knowledge base indexed

# When: Query "What was discussed about Q1?"
# Then:
# - Shows "🔍 Using: Vector Search"
# - Returns answer within 3 seconds
# - Answer includes citations (chat name, date)
```

### Scenario 4: Relational Search
```bash
# Given: Knowledge base indexed

# When: Query "Who did John collaborate with?"
# Then:
# - Shows "🔍 Using: Graph Search"
# - Returns list of people
# - Shows chat names where they collaborated
```

### Scenario 5: Data Persistence
```bash
# Given: Knowledge base indexed with 100 chats

# When: Stop containers
docker-compose down

# When: Restart
docker-compose up

# Then:
# - Menu shows "Indexed: 100 chats"
# - Search queries work immediately (no re-indexing)
```

---

These user stories provide:
- ✅ Clear acceptance criteria for each feature
- ✅ Technical implementation notes
- ✅ Definition of done
- ✅ Priority and estimates
- ✅ End-to-end test scenarios
- ✅ Organized by PRD phases

Ready for sprint planning!
