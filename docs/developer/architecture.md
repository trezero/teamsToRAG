# Architecture Documentation

This document provides a comprehensive overview of the Teams to RAG project architecture, covering both the CLI Tool and the Docker RAG Application.

## Overview

Teams to RAG is a dual-architecture project consisting of:
1. **CLI Tool**: Node.js application that exports Microsoft Teams chat conversations to RAG-optimized markdown documents
2. **Docker RAG Application**: Complete containerized AI chat application for querying exported Teams knowledge using vector databases and RAG

## CLI Tool Architecture

### Core Components

The CLI tool is built with Node.js and provides both interactive and command-line interfaces for exporting Teams data.

```
src/
├── index.js          # Main CLI entry point (Commander.js)
├── menu.js           # Interactive menu UI
├── auth.js           # OAuth2 authentication (delegated + application)
├── teamsClient.js    # Microsoft Graph API client
├── chatFinder.js     # Chat/channel discovery with caching
├── cache.js          # SQLite caching layer
├── ragGenerator.js   # Markdown document generation
├── ragOptimizer.js   # Claude AI RAG optimization
└── optimizeRag.js    # RAG optimizer CLI
```

### Authentication Layer (src/auth.js)

Supports two authentication modes for accessing Microsoft Graph API:

**Delegated Authentication (Device Code Flow)**
- OAuth 2.0 device code flow for user-based authentication
- No client secret required
- User-based permissions (ChatMessage.Read, Chat.Read, ChannelMessage.Read.All)
- Polls Microsoft's token endpoint with configurable intervals
- Provides helpful error messages for common Azure AD configuration issues (e.g., public client flows not enabled)

**Application Authentication (Client Credentials Flow)**
- Client credentials flow for app-based authentication
- Requires client secret from Azure AD
- App-based permissions (Chat.Read.All, ChannelMessage.Read.All) with admin consent
- Used for automated, non-interactive scenarios

### Microsoft Graph API Client (src/teamsClient.js)

Handles all interactions with Microsoft Graph API v1.0:

**Base Configuration**
- Base URL: `https://graph.microsoft.com/v1.0`
- Supports pagination for all list operations (chats, channels, messages)

**Key API Endpoints**
- `/me/chats` - List user's chats
- `/me/chats/{id}/messages` - Get chat messages
- `/teams/{teamId}/channels` - List team channels
- `/teams/{teamId}/channels/{channelId}/messages` - Get channel messages

**Important Limitations**
- **Channel messages API does NOT support `$filter` on `createdDateTime`** - only `$top` and `$expand` are supported
- Chat messages use client-side filtering for incremental updates (fetches newest first, stops when old messages found)
- Channel messages always fetch ALL messages (no incremental support due to API limitations)

### Caching System (src/cache.js)

Local SQLite-based caching for improved performance:

**Database Location**: `.cache/teams-cache.db`

**Schema**
```sql
-- Chat metadata cache
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  chat_type TEXT,
  topic TEXT,
  display_name TEXT,
  members TEXT,                -- JSON array
  created_at INTEGER,
  last_updated INTEGER,
  fetched_at INTEGER
);

-- Team metadata cache
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  description TEXT,
  fetched_at INTEGER
);

-- Channel metadata cache
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  display_name TEXT,
  description TEXT,
  fetched_at INTEGER
);

-- Sync tracking
CREATE TABLE cache_metadata (
  key TEXT PRIMARY KEY,
  last_full_sync INTEGER
);
```

**Cache Behavior**
- 24-hour cache validity period (configurable via `CACHE_VALIDITY_MS`)
- Significantly improves interactive menu performance
- Database initialization creates tables and indexes automatically
- All database operations use transactions for better performance

### Interactive Menu System (src/menu.js + src/chatFinder.js)

Provides user-friendly interface for browsing and exporting Teams data:

**menu.js**: Main interactive CLI menu with 6 options
- Export chat by ID
- Browse and select chat
- Export channel
- Force refresh cache
- Clear cache
- Validate configuration

**chatFinder.js**: Handles fetching and displaying chats/channels
- Resolves 1:1 chat names by expanding members during fetch (`$expand=members`)
- Displays cache status (age, validity) to users at menu startup
- Supports force refresh and cache clearing

### RAG Document Generation (src/ragGenerator.js)

Converts Teams messages to RAG-optimized markdown:

**Incremental Update Support**
- Detects existing exports by parsing file headers
- Parses `Last Run` timestamp from existing files to determine since date
- `appendMessagesToExport()`: Updates header stats and appends new messages to existing file

**Document Processing**
- Groups messages by date (configurable via `GROUP_BY_DATE`)
- Cleans HTML content (removes tags, converts entities)
- Generates consistent filenames based on chat/channel name or ID

**Message Format**
- Sender name
- Optional timestamp (configurable via `INCLUDE_METADATA`)
- Message content
- Attachments
- Reactions

**Filename Sanitization**
- Removes invalid filename characters: `:<>"\/\|?*`
- Replaces spaces with `-`
- Format: `chat-{name}.md` or `channel-{name}.md`
- Consistent naming enables incremental updates (same chat = same filename)

### Main CLI (src/index.js)

Entry point using Commander.js for argument parsing:

**Commands**
- `menu` (default) - Interactive menu interface
- `generate` - Generate from .env settings or CLI flags
- `validate` - Validate configuration and test authentication

**Features**
- Environment variables overridable by CLI flags
- Determines if operation is chat vs channel based on provided IDs
- Output path generation with filename sanitization

## Docker RAG Application Architecture

### Service Topology

The Docker RAG application runs 3 core services in an isolated Docker network:

```
teams-rag-network/
├── app                     # Node.js CLI application
│   ├── Connects to: chromadb:8000
│   ├── Connects to: neo4j:7687
│   └── Connects to: host.docker.internal:11434 (Ollama)
├── chromadb               # Vector database for semantic search
│   └── Internal port: 8000
└── neo4j                  # Graph database for relationships
    ├── Internal port: 7474 (HTTP)
    └── Internal port: 7687 (Bolt)
```

### Network Configuration

**Internal-Only Architecture**
- All ports are INTERNAL by default to avoid conflicts
- App container communicates with databases using Docker service names
- External port exposure is NOT required for app functionality

**External Service Integration**
- Ollama runs on host machine (not containerized)
- Connection via `host.docker.internal:11434`
- Configured via `LLM_HOST_URL` environment variable

**Network Topology**
```
Host Machine (127.0.0.1)
├── Your Ollama (port 11434)
└── Docker Network: teams-rag-network
    ├── app (connects to chromadb:8000, neo4j:7687, host.docker.internal:11434)
    ├── chromadb (port 8000 internal only)
    └── neo4j (ports 7474, 7687 internal only)
```

### Data Flow

**Ingestion Pipeline**
```
Local Machine (Conda Environment)
         ↓
python scripts/ingest_data.py
         ↓
Imports: backend/vector_store.py
         ↓
    Network connection
         ↓
Docker Containers
├── Milvus (Vector DB) - Stores vectors
├── FastAPI Backend - Web application
└── React Frontend
```

**Query Pipeline**
```
User Query (Frontend)
         ↓
FastAPI Backend (main.py)
         ↓
RAG Engine (rag_engine.py)
    ├── Vector Store (vector_store.py) - Semantic search
    └── Knowledge Graph (Neo4j) - Relationship queries
         ↓
LLM (Ollama/OpenAI)
         ↓
Response to Frontend
```

### Storage Architecture

**Docker Volumes (Persistent Storage)**
- `teams-rag-chroma-data`: Vector embeddings
- `teams-rag-neo4j-data`: Graph database
- `teams-rag-neo4j-logs`: Neo4j logs
- `teams-rag-neo4j-import`: Import directory
- `teams-rag-neo4j-plugins`: Neo4j plugins (APOC)

**Bind Mounts (Host Access)**
- `./.cache`: SQLite cache (accessible from host)
- `./output`: Exported markdown files (accessible from host)

### Component Responsibilities

**Backend (FastAPI)**
- `main.py`: API endpoints and routing
- `rag_engine.py`: RAG pipeline logic and orchestration
- `vector_store.py`: Milvus/ChromaDB integration
- `data_ingestion.py`: Teams markdown parser
- `models.py`: Pydantic data models

**Frontend (React)**
- `ChatInterface.js`: User interface for queries
- `api.js`: Backend API client
- Real-time chat-like interaction

**Scripts**
- `ingest_data.py`: Data ingestion tool (runs locally, not in Docker)
- `setup.sh`: Initial environment setup

## Data Processing Architecture

### Member Resolution

**For Chats**
- Uses `$expand=members` to get member details during initial fetch
- Creates `memberMap` (userId → displayName) for message formatting
- 1:1 chats without topics display as `[1:1] {OtherUserName}`

### Incremental Updates with Client-Side Filtering

**Chat Messages**
- API returns newest messages first
- Client filters by `createdDateTime > lastRun`
- Stops pagination early when old messages are found
- Implemented in `fetchChatMessages()` in teamsClient.js

**Channel Messages**
- No incremental support due to API limitations
- Always fetches all messages
- Implemented in `fetchChannelMessages()` in teamsClient.js

**Export File Tracking**
- Export files track `Last Run` timestamp in ISO format in header
- Enables reliable incremental updates on subsequent exports

### RAG Configuration

**Embedding Model**: `all-MiniLM-L6-v2`
- Lightweight and fast
- Good balance of quality and performance

**Chunk Size**: 1000 characters
- Optimized for conversation context
- Prevents token limit issues

**Retrieval Strategy**: Hybrid with re-ranking
- Combines semantic search with keyword matching
- Re-ranks results for better relevance

**LLM Integration**: OpenAI GPT-3.5-turbo with Ollama fallback
- Primary: OpenAI API (if configured)
- Fallback: Local Ollama instance
- Configurable via environment variables

## Error Handling Patterns

### Microsoft Graph API Errors

**404 Not Found**
- Chat or channel does not exist
- User does not have access

**403 Permission Denied**
- Delegated auth: Missing required permissions
- Application auth: Admin consent not granted
- User not member of chat/channel

**429 Rate Limited**
- Too many requests
- Implements exponential backoff

### Authentication Errors

**Device Code Flow**
- Device code expired (15-minute window)
- Public client flows not enabled in Azure AD
- Provides configuration instructions in error messages

**Client Credentials Flow**
- Invalid client secret
- Application not granted required permissions
- Missing admin consent

### User Experience

- All spinners use ora for consistent UX
- Helpful error messages with actionable instructions
- Progress indicators for long-running operations

## Configuration Management

### Environment Variables

**CLI Tool (.env)**
```env
# Authentication (Required)
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
AUTH_MODE=delegated|application
CLIENT_SECRET=your-secret  # Required for application mode

# Source Identifiers (Choose One)
TEAMS_CHAT_ID=chat-id
TEAMS_TEAM_ID=team-id
TEAMS_CHANNEL_ID=channel-id

# Output Configuration
OUTPUT_DIR=./output
MAX_MESSAGES=100  # Optional limit
INCLUDE_METADATA=true
GROUP_BY_DATE=true

# Optional Features
ANTHROPIC_API_KEY=your-key  # For RAG optimization
```

**Docker Application (.env)**
```env
# Vector Database
VECTOR_DB_HOST=milvus-standalone
VECTOR_DB_PORT=19530

# LLM Configuration
LLM_HOST_URL=http://host.docker.internal:11434

# Optional: OpenAI API fallback
OPENAI_API_KEY=your-openai-api-key

# Graph Database
GRAPH_DB_URI=bolt://neo4j:7687
NEO4J_PASSWORD=your-secure-password
```

## Performance Considerations

### Caching Strategy

- 24-hour cache validity reduces API calls
- SQLite transactions for fast batch operations
- Indexes on frequently queried fields

### API Optimization

- Pagination for large result sets
- Expand parameter to reduce round trips
- Client-side filtering to minimize data transfer

### Docker Optimization

- Named volumes for persistent data
- Internal-only networking for security
- Bind mounts only for necessary host access

## Security Considerations

### Authentication

- OAuth 2.0 device code flow for user consent
- Client credentials for automated scenarios
- Tokens stored securely in memory only

### Network Isolation

- Docker services communicate via internal network
- No external port exposure required
- Host access only via `host.docker.internal`

### Data Privacy

- Local SQLite cache (not shared)
- Docker volumes isolated per deployment
- No data sent to external services (except LLM APIs)

## Extensibility

### Adding New Export Formats

Extend `ragGenerator.js` to support additional output formats:
- JSON for API integration
- HTML for web viewing
- CSV for spreadsheet analysis

### Custom RAG Strategies

Modify `rag_engine.py` to implement:
- Different chunking strategies
- Alternative embedding models
- Custom re-ranking algorithms

### Additional Database Integrations

Add support for other vector databases:
- Pinecone
- Weaviate
- Qdrant

## References

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/overview)
- [OAuth 2.0 Device Authorization Grant](https://oauth.net/2/device-flow/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
