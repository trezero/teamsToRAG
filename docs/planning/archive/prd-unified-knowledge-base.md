Here is the revised PRD, updated to integrate Docker as the foundational layer for deployment, setup, and service management.

-----

# PRD: Unified Teams Knowledge Base (Containerized)

## 1\. Overview

This feature will add functionality to export all cached Teams chats into a **dual-storage system**:

1.  A **local vector database** (ChromaDB) for semantic content search.
2.  A **local knowledge graph** (Neo4j) for entity and relationship mapping.

This dual-store system will power an **Agentic RAG** chat interface, enabling both semantic search ("What was discussed?") and relational queries ("Who was involved?").

**[New]** All required services (the application, vector DB, graph DB, and LLM) will be fully **containerized using Docker**, enabling a one-command setup, environmental consistency, and simplified dependency management.

## 2\. Goals

1.  **Automated Dual Export**: Process all chats from the SQLite cache and export them to *both* the vector database and the knowledge graph.
2.  **Semantic Search**: Enable natural language search for *topical content* across all Teams conversations (Vector Store).
3.  **Relational Search**: Enable natural language queries about *connections* between people, teams, and topics (Knowledge Graph).
4.  **Agentic RAG Interface**: Provide an interactive Q\&A interface that routes queries to the correct data store (vector, graph, or both) and synthesizes an answer.
5.  **Incremental Updates**: Only process new or updated chats to avoid redundant work in both stores.
6.  **[New] Containerized Deployment**: Simplify setup to a single `docker-compose up` command, ensuring all services (App, ChromaDB, Neo4j, Ollama) work in a consistent, isolated network.

## 3\. User Experience

### [New] First-Time Setup

The primary setup experience is now radically simplified.

```bash
# 1. Clone the repository
git clone <repo_url>
cd <repo_name>

# 2. Configure environment
cp .env.sample .env
# (User edits .env, e.g., to set NEO4J_PASSWORD)

# 3. Launch all services
docker-compose up --build

# 4. The application menu appears directly in the terminal
╔════════════════════════════════════════╗
║   Teams to RAG Generator              ║
╚════════════════════════════════════════╝
...
```

### Main Menu Addition (No change)

```
╔════════════════════════════════════════╗
║   Teams to RAG Generator              ║
╚════════════════════════════════════════╝

Cache Status:
  Chats: 1514 cached (2h ago) ✓ valid
  Teams: 15 cached, 89 channels (2h ago) ✓ valid

Please select an option:

1. Find and export a chat (1:1 or group)
...
6. Build/Update Knowledge Base (Vectors & Graph)
7. Search Knowledge Base (Agentic RAG)
8. Exit

Enter your choice [1-8]:
```

### Option 6: Build Knowledge Base Flow

**[Update]** The configuration section now reflects the Docker service hostnames.

```
Selected: Build/Update Knowledge Base (Vectors & Graph)

Knowledge Base Status:
  Total chats in cache: 1514
  ...

Configuration:
  Vector DB: ChromaDB (service: 'chromadb')
  Graph DB: Neo4j (service: 'neo4j')
  LLM: Ollama (service: 'ollama')
  Embedding model: all-MiniLM-L6-v2
  Chunk size: Semantic (approx. 5-10 messages)

Proceed with bulk export? (y/N): y
...
```

### Option 7: Agentic RAG Search Interface

**[Update]** The loading message confirms connection to Docker services.

```
Selected: Search Knowledge Base (Agentic RAG)

Loading data stores...
✓ Connected to Vector Store (service: 'chromadb')
✓ Connected to Knowledge Graph (service: 'neo4j')
✓ Connected to LLM (service: 'ollama')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Teams Chat Search (Agentic RAG)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

## 4\. Technical Implementation

### [New] Architecture: Docker Compose Network

The application is architected as a set of communicating services within a Docker network, managed by `docker-compose`.

```
┌───────────────────────────────────────────────────────────────────┐
│                      DOCKER NETWORK ('teams-rag_default')         │
│                                                                   │
│  ┌─────────────────────────┐                                      │
│  │ User (via docker-compose)│                                      │
│  └─────────────┬───────────┘                                      │
│                │ (stdin/tty)                                      │
│                ▼                                                  │
│  ┌─────────────────────────┐                                      │
│  │   App Service (Node.js) │                                      │
│  │  (Interactive CLI App)  │                                      │
│  │ ----------------------- │                                      │
│  │ - bulkExporter.js       │                                      │
│  │ - agenticSearch.js      │                                      │
│  │ - ... (all app logic)   │                                      │
│  └───────────┬─────────────┘                                      │
│              │                                                    │
│ ┌────────────┼──────────────────┬───────────────────┐             │
│ │            │                  │                   │             │
│ │(http)      │(bolt)            │(http)             │(http)      │
│ ▼            ▼                 ▼                   ▼             │
│ ┌──────────┐ ┌───────────────┐ ┌─────────────────┐ ┌───────────┐ │
│ │ ChromaDB │ │     Neo4j     │ │     Ollama      │ │  MS Graph │ │
│ │ Service  │ │    Service    │ │    Service (LLM)│ │  API      │ │
│ └─────┬────┘ └───────┬───────┘ └───────┬─────────┘ └───────────┘ │
│       │              │                 │                        │
│ ┌─────▼────┐ ┌───────▼───────┐ ┌───────▼─────────┐             │
│ │ ChromaDB │ │   Neo4j Data  │ │  Ollama Models  │             │
│ │ Volume   │ │   Volume      │ │  Volume         │             │
│ └──────────┘ └───────────────┘ └─────────────────┘             │
│ (Persistent Storage)                                            │
└───────────────────────────────────────────────────────────────────┘
```

### [New] Core Project Files

1.  **`Dockerfile`**

      - Defines the environment for the main `app` service.
      - Starts from a base Node.js (or Python) image.
      - Copies `package.json` / `requirements.txt` and installs dependencies.
      - Copies the application source code (`src/`, etc.).
      - Sets the `ENTRYPOINT` or `CMD` to launch the main application script (e.g., `node index.js`).

2.  **`docker-compose.yml`**

      - Defines the four main services: `app`, `chromadb`, `neo4j`, `ollama`.
      - `app`: Built from the local `Dockerfile`. It's configured with `stdin_open: true` and `tty: true` to remain interactive. It will `depend_on` the other three services.
      - `chromadb`: Uses the official `chromadb/chroma` image.
      - `neo4j`: Uses the official `neo4j` image, with environment variables for auth.
      - `ollama`: Uses the official `ollama/ollama` image.
      - **Volumes**: Defines named volumes for `chroma-data`, `neo4j-data`, and `ollama-data` to ensure all vector chunks, graph nodes, and downloaded LLM models are persistent.

### Module Updates

  - `src/vectorDB.js`: Connection logic is updated to read `VECTOR_DB_HOST_URL` from `.env` (e.g., `http://chromadb:8000`).
  - `src/graphDB.js`: Connection logic reads `GRAPH_DB_URI`, `GRAPH_DB_USER`, `GRAPH_DB_PASSWORD` from `.env` (e.g., `bolt://neo4j:7687`).
  - `src/llmClient.js`: Connection logic reads `LLM_HOST_URL` from `.env` (e.g., `http://ollama:11434`).

### [New] Dependencies

The *only* pre-requisites for the user are:

1.  **Docker Desktop** (or Docker Engine)
2.  **Docker Compose**

All other application-level dependencies (Node.js, Python, `npm` packages, `pip` packages) are managed *inside* the `Dockerfile` and are not required on the user's host machine.

### [Update] Configuration (`.env`)

The `.env` file is now the single source of truth for service communication.

```env
# Vector Database
VECTOR_DB_TYPE=chromadb
VECTOR_DB_HOST_URL=http://chromadb:8000 # Use service name
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_STRATEGY=semantic

# Knowledge Graph Database
GRAPH_DB_TYPE=neo4j
GRAPH_DB_URI=bolt://neo4j:7687 # Use service name
GRAPH_DB_USER=neo4j
GRAPH_DB_PASSWORD=your_password_here # User must set this

# RAG Agent (LLM)
LLM_PROVIDER=ollama
LLM_HOST_URL=http://ollama:11434 # Use service name
LLM_MODEL=llama3.1
MAX_CONTEXT_CHUNKS=5

# MS Teams Client
# ... (existing auth variables)
```

## 5\. Success Criteria

1.  ✅ Successfully index all chats into *both* the vector and graph stores.
2.  ✅ Agentic RAG correctly routes "what" questions to vector search.
3.  ✅ Agentic RAG correctly routes "who" / "how connected" questions to graph search.
4.  ✅ Incremental updates correctly process only new messages for both stores.
5.  **[New]** ✅ Application starts successfully with a single `docker-compose up` command.
6.  **[New]** ✅ Data (vectors, graph nodes, LLM models) persists between `docker-compose down` and `docker-compose up` cycles.

## 6\. Out of Scope (No change)

  - File Content Indexing
  - Advanced RAG (Reranking)
  - Multi-user support
  - GUI interface

## 7\. Implementation Phases

**[Update]** The phases are re-ordered to build the Docker foundation first.

### Phase 1: Docker Foundation (4-6 hours)

  - Create `Dockerfile` for the main application.
  - Create `docker-compose.yml` defining all four services (`app`, `chromadb`, `neo4j`, `ollama`) and their persistent volumes.
  - Configure the Docker network and ensure all services can start and communicate.
  - Update all client modules (`vectorDB.js`, `graphDB.js`, `llmClient.js`) to read hostnames from the `.env` file.

### Phase 2: Dual DB Setup (2-3 hours)

  - Test basic CRUD operations on the *containerized* ChromaDB and Neo4j services from the `app` container.
  - Update `vector_index_status` table in SQLite.

### Phase 3: Data Processing Pipelines (5-7 hours)

  - Create `chunking.js` (Semantic Chunking).
  - Create `entityExtractor.js` (LLM-based extraction).
  - Test both modules against the `ollama` service.

### Phase 4: Bulk Exporter Orchestration (4-6 hours)

  - Update `bulkExporter.js` to run both pipelines.
  - Implement incremental logic for both stores.
  - Add progress tracking and error handling.

### Phase 5: Agentic Search Interface (6-8 hours)

  - Create `agenticSearch.js`.
  - Implement the "agentic router" and "Cypher generator" (using the `ollama` service).
  - Build the interactive CLI with new commands.

### Phase 6: Menu Integration & Testing (2-3 hours)

  - Add options 6 and 7 to the main menu.
  - End-to-end testing of the full `docker-compose up` -\> build -\> query flow.

**Total Estimated Time: 23-33 hours**

## 8\. [New] Documentation Updates

  - **`README.md`**: Must be completely rewritten to be **Docker-first**.
      - **Quick Start**: `git clone`, `cp .env.sample .env`, `docker-compose up`.
      - **Configuration**: Explain key variables in `.env` (like `NEO4J_PASSWORD`).
      - **Usage**: Explain how to use the CLI menu once it appears.
      - **Data Persistence**: Explain where data is stored (Docker volumes) and how to clear it (`docker-compose down -v`).
  - **`docs/DEVELOPMENT.md`**: A new document explaining how to run the application *without* Docker for local development (e.g., "install Neo4j locally," "run `npm install`," etc.).

## 9\. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **[New]** Docker Resource Usage | High | The app will require significant RAM (for Neo4j, Ollama, and the app). Document the minimum RAM (e.g., 16GB) in the `README.md`. |
| **[New]** Docker Networking Issues | Medium | Inconsistent DNS or port conflicts. Using `docker-compose` with service names mitigates this, but documentation must be clear. |
| **[New]** First-Time Model Download | Medium | The first run of `bulkExporter` or `agenticSearch` will be slow as Ollama downloads the LLM model. This must be documented in the "Build" flow. |
| LLM-based Entity/Graph Errors | High | Incorrectly extracted entities or bad Cypher queries. Implement robust error handling and logging for all LLM calls. |
| Slow Bulk Export | Medium | Processing 1500+ chats can be slow. Use batching for both vector and graph insertions. |