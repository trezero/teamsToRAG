# Teams to RAG

Export Microsoft Teams chats to markdown and query them with AI-powered search.

## What is This?

**Two tools in one repository:**

### 1. CLI Export Tool (Core Feature)
Export Microsoft Teams conversations (1:1, group chats, channels) to RAG-optimized markdown documents. Supports incremental updates, smart caching, and optional Claude AI optimization for better retrieval.

**Key capabilities:**
- Interactive menu for selecting chats/channels
- Incremental exports (only fetch new messages)
- Local SQLite caching for fast performance
- Two authentication modes (delegated/application)
- RAG optimization with Claude AI

### 2. RAG Knowledge Base (Optional - Docker)
Self-hosted AI chat application that lets you query your Teams data using natural language. Combines vector database (Milvus), knowledge graph (Neo4j), and LLM (Ollama/OpenAI) for intelligent search.

**Key capabilities:**
- Semantic search over Teams conversations
- Context-aware chunking and re-ranking
- Web-based chat interface
- Full containerized deployment
- No external data transmission (runs locally)

## Quick Start

### Option 1: CLI Export Tool (Fastest)

Export Teams chats to markdown in 3 steps:

```bash
# 1. Install dependencies
npm install

# 2. Configure authentication (create .env file)
cp .env.example .env
# Edit .env with your Azure AD app credentials

# 3. Run interactive menu
npm start
```

See [CLI Usage Guide](docs/user-guide/cli-usage.md) for detailed instructions.

### Option 2: Docker RAG Knowledge Base

Deploy the full AI search application:

```bash
# 1. Start all services
docker-compose up -d

# 2. Setup local Python environment for data ingestion
conda create -n milvusImport310 python=3.10 -y
conda activate milvusImport310
pip install -r scripts/requirements-ingestion.txt

# 3. Ingest your Teams exports
python scripts/ingest_data.py /path/to/markdown/files/

# 4. Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000/docs
```

See [Docker Deployment Guide](docs/user-guide/docker-deployment.md) for complete setup.

## Documentation

All documentation has been organized into the `docs/` directory:

- [User Guide](docs/user-guide/) - Installation, configuration, and usage
  - [CLI Usage](docs/user-guide/cli-usage.md) - Using the Teams export tool
  - [Docker Deployment](docs/user-guide/docker-deployment.md) - Deploying the RAG application
  - [Configuration](docs/user-guide/configuration.md) - Environment variables and settings
  - [Troubleshooting](docs/user-guide/troubleshooting.md) - Common issues and solutions

- [Developer Guide](docs/developer/) - Architecture and contribution guidelines
  - [Architecture](docs/developer/architecture.md) - System design and components
  - [Data Schemas](docs/developer/data-schemas.md) - Vector and graph database schemas
  - [Contributing](docs/developer/contributing.md) - Development setup and standards

- [RAG Documentation](docs/rag/) - RAG system design and strategies
  - [Strategy Guide](docs/rag/strategy-guide.md) - Choosing optimal RAG strategies
  - [Technical Reference](docs/rag/technical-reference.md) - RAG engine implementation

- [Planning & Roadmap](docs/planning/) - Project evolution and future features

## Features

### CLI Export Tool
- **Interactive Chat Selection**: Browse and select from all accessible chats and channels
- **Incremental Updates**: Only fetch new messages since last export (chat messages only)
- **Smart Caching**: 24-hour cache for chat/channel lists improves performance
- **Two Auth Modes**:
  - Delegated (device code flow) - no client secret required
  - Application (client credentials) - for service accounts
- **RAG Optimization**: Optional Claude AI processing for better search results
- **Flexible Output**: Customizable markdown format with metadata and grouping options

### RAG Knowledge Base (Docker)
- **Vector Search**: Semantic similarity search using Milvus
- **Knowledge Graph**: Relationship-based queries with Neo4j
- **Context-Aware Chunking**: Preserves conversation flow and boundaries
- **Re-ranking**: Cross-encoder model improves retrieval precision
- **Agentic Retrieval**: Dynamic strategy selection based on query type
- **Web Interface**: React-based chat UI for natural language queries
- **Local Deployment**: All data stays on your infrastructure
- **Dual LLM Support**: OpenAI API or local Ollama

## Prerequisites

### For CLI Export Tool
- Node.js 18+
- Azure AD application with Microsoft Graph API permissions:
  - Delegated: `ChatMessage.Read`, `Chat.Read`, `ChannelMessage.Read.All`
  - Application: `Chat.Read.All`, `ChannelMessage.Read.All`

### For RAG Knowledge Base (Additional)
- Docker and Docker Compose
- Python 3.10 (for data ingestion scripts)
- Conda (recommended for environment management)

## Configuration

Create a `.env` file in the project root:

```env
# Required for CLI Export Tool
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
AUTH_MODE=delegated  # or "application"

# Required for application mode only
CLIENT_SECRET=your-client-secret

# Optional: RAG optimization
ANTHROPIC_API_KEY=your-anthropic-key

# Optional: Output settings
OUTPUT_DIR=./output
MAX_MESSAGES=  # empty = all messages
INCLUDE_METADATA=true
GROUP_BY_DATE=true

# Optional: For RAG Knowledge Base
LLM_HOST_URL=http://host.docker.internal:11434
OPENAI_API_KEY=your-openai-key
VECTOR_DB_HOST=milvus-standalone
VECTOR_DB_PORT=19530
```

See [Configuration Guide](docs/user-guide/configuration.md) for complete reference.

## Architecture

### CLI Tool
```
Authentication → Microsoft Graph API → Local Cache (SQLite) → Export (Markdown)
                                                             ↓
                                            Optional: Claude AI Optimization
```

### RAG Knowledge Base
```
Teams Markdown Files → Data Ingestion → Vector Store (Milvus)
                                      → Knowledge Graph (Neo4j)
                                                ↓
User Query → RAG Engine → Retrieval + Re-ranking → LLM → Response
```

## Common Commands

```bash
# CLI Export Tool
npm start                    # Interactive menu
npm start menu              # Same as above
npm start generate          # Generate from .env settings
npm start validate          # Test authentication

# With CLI options
npm start generate -- --chat-id "19:abc..." --output ./custom/path.md

# RAG optimization
npm run optimize -- output/chat-Project-Discussion.md

# RAG Knowledge Base
docker-compose up -d        # Start services
docker-compose logs -f      # View logs
docker-compose down         # Stop services

# Data ingestion (requires conda environment)
conda activate milvusImport310
python scripts/ingest_data.py sample_data/
python scripts/ingest_data.py --verbose /path/to/markdown/
```

## Important Notes

### Incremental Updates
- **Chat messages**: Supports incremental updates with client-side filtering
- **Channel messages**: No incremental support due to Microsoft Graph API limitations (always fetches all messages)
- Export files track `Last Run` timestamp for reliable incremental updates

### Authentication
- **Delegated mode**: User-based authentication via device code flow (15-minute expiry)
- **Application mode**: App-based authentication with client secret (requires admin consent)
- User must be a member of chat/channel for delegated auth

### Performance
- Chat/channel lists cached for 24 hours (configurable)
- Force refresh available in interactive menu
- RAG query response: < 2 seconds average
- Vector search: < 100ms for top-k retrieval

## Troubleshooting

See the [Troubleshooting Guide](docs/user-guide/troubleshooting.md) for detailed solutions.

**Quick fixes:**

- **Permission denied**: Check Azure AD app permissions and admin consent
- **Device code expired**: Complete authentication within 15 minutes
- **Milvus connection failed**: `docker-compose ps` to verify services are running
- **Cache not refreshing**: Use menu option to force refresh or clear cache

## Project Status

### Completed
- CLI export tool with incremental updates
- Interactive menu system
- Local SQLite caching
- Docker RAG application (MVP)
- Vector database integration (Milvus)
- Basic web interface

### In Progress
- Advanced RAG features (context-aware chunking, re-ranking)
- Knowledge graph integration enhancements
- Query expansion and multi-query support

### Planned
- Conversation memory in RAG app
- Batch processing improvements
- Analytics and usage insights
- Multi-tenancy support

See [Roadmap](docs/planning/roadmap.md) for detailed plans.

## Contributing

Contributions are welcome! See the [Contributing Guide](docs/developer/contributing.md) for:
- Development setup (local vs Docker)
- Code organization and standards
- Testing approach
- Pull request guidelines

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: Comprehensive guides in [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **API Reference**: http://localhost:8000/docs (when Docker services running)

---

**Note:** This project combines a lightweight CLI export tool (Node.js) with an optional full-stack RAG application (Docker). You can use just the CLI tool for exports, or deploy the complete knowledge base for AI-powered search.
