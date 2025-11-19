# Design Decisions

This document captures the key architectural and implementation decisions made during the development of the Teams to RAG project. Understanding these decisions helps explain why certain approaches were chosen and provides context for future development.

## Table of Contents

1. [Client-Side Filtering for Incremental Updates](#client-side-filtering-for-incremental-updates)
2. [Dual Storage Architecture (Vector + Graph)](#dual-storage-architecture-vector--graph)
3. [Docker-First Deployment](#docker-first-deployment)
4. [Database Selection: ChromaDB and Neo4j](#database-selection-chromadb-and-neo4j)
5. [No External Ports by Default](#no-external-ports-by-default)
6. [Authentication Strategy Choices](#authentication-strategy-choices)
7. [Filename Sanitization Approach](#filename-sanitization-approach)
8. [Local Python Environment for Ingestion](#local-python-environment-for-ingestion)

---

## Client-Side Filtering for Incremental Updates

### Decision
Use client-side filtering with early pagination termination instead of server-side `$filter` for incremental updates.

### Context
Microsoft Graph API has inconsistent support for the `$filter` query parameter:
- **Chat messages**: `$filter` on `createdDateTime` is supported but requires specific syntax
- **Channel messages**: `$filter` is **not supported at all** (only `$top` and `$expand`)

Initial implementation attempted server-side filtering for both, resulting in API errors.

### Alternatives Considered

1. **Server-side filtering for chats only**
   - Pros: Efficient for chats, only fetches new messages
   - Cons: Different code paths for chats vs channels, complexity

2. **Always full refresh for both**
   - Pros: Simplest implementation
   - Cons: Inefficient for large chats, wastes API quota and bandwidth

3. **Client-side filtering with early termination** ✅ **SELECTED**
   - Pros: Works for both chats and channels, unified code path
   - Cons: Slightly less efficient than server-side filtering

### Implementation Details

**How it works:**
1. Fetch messages page by page (50 at a time, newest first)
2. Filter messages in memory based on `lastRun` timestamp
3. **Stop pagination early** when encountering messages older than last run
4. Append only new messages to existing exports

**Performance characteristics:**
- Best case (no new messages): Fetches 1 page, stops immediately (~1 second)
- Typical case (few new messages): Fetches 1-3 pages (~1-3 seconds)
- Worst case (many new messages): Similar to server-side filtering

**Key code:**
```javascript
// Early termination logic
if (sinceDateMs) {
  const filteredBatch = batch.filter(msg => {
    const msgDate = new Date(msg.createdDateTime).getTime();
    return msgDate > sinceDateMs;
  });

  // Stop if all messages are old
  if (filteredBatch.length === 0 && batch.length > 0) {
    break;
  }
}
```

### Outcome
- ✅ No API errors
- ✅ Works reliably for both chats and channels
- ✅ Acceptable performance (<3 seconds for typical incremental updates)
- ✅ Simplified codebase (unified approach)

### References
- [IMPLEMENTATION_FINAL.md](archive/phase1-incremental-updates-final.md)
- [teamsUpdatePlan.md](archive/phase1-incremental-updates-plan.md)

---

## Dual Storage Architecture (Vector + Graph)

### Decision
Use both a vector database (ChromaDB/Milvus) AND a knowledge graph (Neo4j) for complementary data access patterns.

### Context
Teams chat data has two distinct query patterns:
1. **Semantic/Content queries**: "What was discussed about Q1 planning?"
2. **Relational/Connection queries**: "Who did John work with on this project?"

### Alternatives Considered

1. **Vector database only**
   - Pros: Simpler architecture, one database to manage
   - Cons: Poor at answering "who" and "when" questions, no relationship traversal

2. **Graph database only**
   - Pros: Excellent for relationships, can store message text as properties
   - Cons: Inefficient for semantic search, no vector similarity

3. **Hybrid graph database** (e.g., Neo4j + vector indexes)
   - Pros: Single database, Neo4j supports vector indexes
   - Cons: Vector search in Neo4j is newer/less mature than dedicated vector DBs

4. **Dual storage (Vector + Graph)** ✅ **SELECTED**
   - Pros: Best tool for each job, mature technologies
   - Cons: More complex, data synchronization needed

### Design Principles

**Vector Store (ChromaDB/Milvus):**
- Stores message chunks with embeddings
- Optimized for semantic similarity search
- Metadata includes: chat ID, participants, date range, topic
- Use case: "Find discussions about [topic]"

**Knowledge Graph (Neo4j):**
- Stores entities (Person, Chat, Message, Topic) and relationships
- Optimized for connection queries and graph traversal
- Use case: "Who collaborated with whom on what?"

**Data Flow:**
```
Teams Messages
    ↓
[Chunking] → Vector Store (semantic search)
    ↓
[Entity Extraction] → Knowledge Graph (relationships)
```

### Implementation Approach

**Agentic Query Routing:**
- Simple keyword-based routing ("what" → vector, "who" → graph)
- LLM-based classification for ambiguous queries
- Hybrid queries use both stores

**Data Consistency:**
- Both stores updated atomically per chat
- SQLite tracking tables record indexing status for each store
- Incremental updates process only changed chats

### Outcome
- ✅ Handles both semantic and relational queries effectively
- ✅ Each database optimized for its workload
- ⚠️ Increased complexity (two databases to manage)
- ⚠️ Higher resource usage (memory, disk)

### References
- [unifiedTeamsKnowledgebasePRD.md](archive/prd-unified-knowledge-base.md)
- [DATA_SCHEMAS.md](../developer/data-schemas.md)

---

## Docker-First Deployment

### Decision
Package the RAG application as a Docker Compose multi-service stack, making Docker the primary deployment method.

### Context
The RAG application requires multiple services:
- Application (Node.js)
- Vector database (ChromaDB or Milvus)
- Knowledge graph (Neo4j)
- LLM (Ollama)

Manual installation of all these services is error-prone and platform-specific.

### Alternatives Considered

1. **Manual installation guide**
   - Pros: Maximum flexibility for users
   - Cons: Platform-specific, complex, error-prone, hard to support

2. **Single-service Docker (app only)**
   - Pros: Simpler Docker setup
   - Cons: Users still need to install databases manually

3. **Virtual machine image**
   - Pros: Everything pre-installed
   - Cons: Large downloads, less flexible, harder to update

4. **Docker Compose multi-service** ✅ **SELECTED**
   - Pros: One-command setup, consistent environment, easy updates
   - Cons: Requires Docker knowledge, resource-intensive

### Implementation Details

**Service Architecture:**
```yaml
services:
  app:          # Node.js CLI application
  chromadb:     # Vector database
  neo4j:        # Knowledge graph
  milvus:       # Alternative vector database
  etcd:         # Milvus dependency
  minio:        # Milvus dependency
```

**Network Isolation:**
- All services communicate via internal Docker network
- Service names used as hostnames (e.g., `http://chromadb:8000`)
- No external ports exposed by default (avoids conflicts)

**Data Persistence:**
- Named volumes for database data
- Bind mounts for user-accessible data (.cache, output)
- Volumes survive container restarts

**Configuration:**
- Single `.env` file for all settings
- Environment variables passed to all services
- Validation on startup

### Outcome
- ✅ One-command setup: `docker compose up --build`
- ✅ Consistent environment across platforms (Linux, macOS, Windows)
- ✅ Easy updates: `docker compose pull && docker compose up -d`
- ✅ Isolated environment (no conflicts with host system)
- ⚠️ Requires Docker Desktop (16GB RAM recommended)
- ⚠️ First-time setup includes large downloads (models, images)

### References
- [DOCKER_SETUP_NOTES.md](archive/docker-setup-notes.md)
- [unifiedTeamsKnowledgebasePRD.md](archive/prd-unified-knowledge-base.md)

---

## Database Selection: ChromaDB and Neo4j

### Decision
Use **ChromaDB** (or Milvus) for vector storage and **Neo4j** for knowledge graph.

### Vector Database: ChromaDB vs Milvus

**Evaluation Criteria:**
- Ease of setup and deployment
- Performance for typical workload
- Memory usage
- Python/Node.js support
- Docker support

**Comparison:**

| Feature | ChromaDB | Milvus |
|---------|----------|--------|
| Setup complexity | Very simple | Moderate (requires etcd, minio) |
| Memory usage | Low (~500MB) | Higher (~2GB) |
| Performance (small-medium) | Excellent | Excellent |
| Performance (large scale) | Good | Superior |
| Docker support | Official image | Official image |
| Python support | Excellent | Excellent |

**Decision:** Support both, default to ChromaDB
- ChromaDB for simpler setup and lower resource usage
- Milvus as option for users with large datasets (>1M messages)

### Knowledge Graph: Neo4j

**Why Neo4j?**
1. **Mature and battle-tested**: Industry standard for graph databases
2. **Cypher query language**: Expressive and readable
3. **Excellent visualization**: Neo4j Browser for debugging
4. **LangChain integration**: Well-supported for LLM applications
5. **Docker support**: Official images, well-documented
6. **APOC library**: Powerful procedures for complex operations

**Alternatives considered:**
- ArangoDB: Multi-model database, but less mature graph query language
- DGraph: Good performance, but smaller ecosystem
- Amazon Neptune: Cloud-only, not suitable for local deployment
- SQL with recursive CTEs: Poor performance for graph traversal

### Outcome
- ✅ ChromaDB: Simple, fast, low resource usage
- ✅ Neo4j: Powerful graph queries, great tooling
- ✅ Both have excellent Docker support
- ⚠️ Combined resource usage: ~3-4GB RAM minimum

### References
- [DATA_SCHEMAS.md](../developer/data-schemas.md)
- README.md (Architecture section)

---

## No External Ports by Default

### Decision
Docker Compose configuration exposes **no external ports** by default for database services.

### Context
Users may have existing services running on standard ports:
- ChromaDB: 8000
- Neo4j: 7474 (HTTP), 7687 (Bolt)
- Milvus: 19530, 9091, 2379

Exposing these ports would cause conflicts and prevent the application from starting.

### Design Approach

**Internal-only networking:**
- All services communicate via Docker network using service names
- App connects to `http://chromadb:8000` (not `localhost:8000`)
- Ports are only accessible within Docker network

**Commented-out port mappings:**
```yaml
# Uncomment these lines if you want to access services from host
# ports:
#   - "7474:7474"  # Neo4j Browser
#   - "7687:7687"  # Neo4j Bolt
```

**When to enable external ports:**
- Debugging with Neo4j Browser
- Testing with direct API calls
- Development outside Docker

### Alternatives Considered

1. **Always expose ports**
   - Pros: Immediate access to services
   - Cons: Port conflicts prevent startup

2. **Use non-standard port mappings** (e.g., 17474:7474)
   - Pros: Reduces conflict risk
   - Cons: Users still need to remember non-standard ports

3. **No external ports by default** ✅ **SELECTED**
   - Pros: No conflicts, works out of the box
   - Cons: Requires uncommenting for debugging

### Outcome
- ✅ Zero port conflicts on first run
- ✅ Application works immediately after `docker compose up`
- ✅ Users who need external access can easily enable it
- 📝 Documented in DOCKER_SETUP_NOTES.md

### References
- [DOCKER_SETUP_NOTES.md](archive/docker-setup-notes.md)

---

## Authentication Strategy Choices

### Decision
Support **both** delegated (user-based) and application (app-based) authentication modes.

### Context
Microsoft Graph API supports two authentication flows:
1. **Delegated**: User grants permissions, tool acts on their behalf
2. **Application**: App has its own permissions, works without user interaction

### Use Cases

**Delegated Authentication:**
- Personal use by individual users
- Interactive exports (user selects chats)
- No Azure AD admin required (self-service)
- Limited to user's own chats/channels

**Application Authentication:**
- Organizational use (admin exports all chats)
- Automated/scheduled exports
- Access to all chats in tenant
- Requires Azure AD admin consent

### Implementation

**Delegated Flow (Device Code):**
```
1. App requests device code
2. User visits URL and enters code
3. User approves permissions
4. App polls for token
5. Token used for API calls
```

**Application Flow (Client Credentials):**
```
1. App sends client ID + secret
2. Azure AD returns token
3. Token used for API calls (no user interaction)
```

**Configuration:**
```env
AUTH_MODE=delegated   # or "application"
CLIENT_SECRET=...     # only required for application mode
```

### Why Both?

Different users have different needs:
- **Individual users**: Don't have admin access, use delegated
- **IT administrators**: Need bulk exports, use application
- **Developers**: Testing different scenarios

**Single authentication codebase:**
- Both flows use same token format (JWT)
- Same API calls after authentication
- Switch by changing `AUTH_MODE` environment variable

### Outcome
- ✅ Supports both personal and organizational use cases
- ✅ No admin required for individual users
- ✅ Powerful automation for administrators
- 📝 Clear documentation for each mode

### References
- [CLAUDE.md](../../CLAUDE.md) - Authentication Layer section
- README.md - Configuration section

---

## Filename Sanitization Approach

### Decision
Use human-readable chat/channel names for filenames with sanitization for filesystem compatibility.

### Context
Original implementation used chat/channel IDs for filenames, resulting in:
```
chat-19_meeting_NDQzNGVkYTEtYjU4Yi00NGFjLTliNTMtZDBlMDVlODdjZTAz@thread.v2.md
```

This is technically correct but hard to identify and manage.

### Design Goals
1. Human-readable filenames
2. Filesystem compatibility (all operating systems)
3. Consistent naming across runs (for incremental updates)
4. Fallback for unnamed chats

### Sanitization Rules

**Invalid characters removed/replaced:**
```javascript
const sanitizeForFilename = (str) => {
  return str
    .replace(/[:<>"\/\\|?*]/g, '-')  // Replace invalid chars with dash
    .replace(/\s+/g, '-')              // Replace spaces with dash
    .replace(/-+/g, '-')               // Replace multiple dashes with single
    .replace(/^-|-$/g, '');            // Remove leading/trailing dashes
};
```

**Examples:**
| Original Name | Sanitized Filename |
|--------------|-------------------|
| "IRIS Dev Integration Meeting" | `chat-IRIS-Dev-Integration-Meeting.md` |
| "Team Standup: Q4 2025" | `chat-Team-Standup-Q4-2025.md` |
| "Q4-Planning & Strategy" | `channel-Q4-Planning-Strategy.md` |
| (no name) | `chat-19_meeting.md` (uses shortened ID) |

### Incremental Update Compatibility

**Challenge:** If a chat is renamed in Teams, the filename changes.

**Solutions considered:**
1. **Always use ID** - Prevents renaming issues but sacrifices readability
2. **Use name, fallback to ID on conflict** - Complex logic
3. **Use name, create new file if renamed** ✅ **SELECTED** - Simple, predictable

**Outcome:**
- Renamed chats create new export files
- Old files remain (user can manually merge or delete)
- Incremental updates work for unchanged names

### Implementation
- Metadata fetched before filename generation
- Filename format: `{prefix}-{sanitized-name}.md`
- Prefix: `chat-` or `channel-`
- Fallback to shortened ID if name unavailable

### Outcome
- ✅ Human-readable filenames
- ✅ Cross-platform compatibility
- ✅ Alphabetical sorting by name
- ⚠️ Chat renames create new files (acceptable trade-off)

### References
- [FILENAME_UPDATE.md](archive/change-filename-sanitization.md)

---

## Local Python Environment for Ingestion

### Decision
Run data ingestion scripts on the **host machine** using a local Python environment, not inside Docker.

### Context
The data ingestion script (`scripts/ingest_data.py`) needs to:
1. Read Teams markdown files from the host filesystem
2. Connect to Milvus database running in Docker
3. Generate embeddings using sentence-transformers (requires significant RAM)

### Alternatives Considered

1. **Run ingestion inside Docker**
   - Pros: Fully containerized, no local Python needed
   - Cons: Complex file mounting, slower embedding generation, resource constraints

2. **Run ingestion on host** ✅ **SELECTED**
   - Pros: Direct file access, faster embeddings, easier development
   - Cons: Requires local Python environment

3. **API endpoint in app container**
   - Pros: Can upload files via HTTP
   - Cons: Adds complexity, file transfer overhead

### Implementation

**Architecture:**
```
┌─────────────────────────────────────┐
│   Local Machine (Conda/venv)       │
│                                     │
│  python scripts/ingest_data.py      │ ← Runs locally
│         ↓                           │
│  Imports: backend/vector_store.py   │
│         ↓                           │
└─────────┼───────────────────────────┘
          │ Network: localhost:19530
          ↓
┌─────────────────────────────────────┐
│     Docker Containers               │
│  - Milvus (Vector DB)               │ ← Stores vectors
│  - FastAPI Backend                  │
└─────────────────────────────────────┘
```

**Setup:**
```bash
# Create conda environment with Python 3.10
conda create -n milvusImport310 python=3.10 -y
conda activate milvusImport310

# Install only ingestion dependencies (minimal)
pip install -r scripts/requirements-ingestion.txt
```

**Separate requirements files:**
- `backend/requirements.txt` - Full backend (FastAPI, web server, etc.)
- `scripts/requirements-ingestion.txt` - Minimal (pymilvus, sentence-transformers, pydantic)

### Why Python 3.10?

**Compatibility requirements:**
- PyMilvus: Works best with Python 3.8-3.10
- Sentence Transformers: Requires Python 3.7+
- NumPy/PyTorch: Best support for 3.10

Python 3.11+ has compatibility issues with some ML libraries.

### Outcome
- ✅ Fast embedding generation (uses host CPU/GPU)
- ✅ Direct filesystem access (no mounting complexity)
- ✅ Easy development and debugging
- ✅ Separate concerns (ingestion vs web app)
- ⚠️ Requires local Python environment (well-documented)

### References
- README.md - Local Python Environment Setup section
- `scripts/requirements-ingestion.txt`

---

## Summary

These design decisions reflect a balance between:
- **Usability**: Easy setup, clear error messages, good defaults
- **Flexibility**: Multiple authentication modes, database options, deployment methods
- **Performance**: Client-side filtering, local embeddings, optimized queries
- **Maintainability**: Unified code paths, clear separation of concerns, good documentation

Understanding these decisions helps explain the current architecture and guides future development. When proposing changes, consider how they align with or challenge these principles.

## Related Documentation

- [Roadmap](roadmap.md) - Future features and priorities
- [Archive](archive/) - Historical PRDs and implementation notes showing how we got here
- [Architecture Guide](../developer/architecture.md) - Current system architecture
