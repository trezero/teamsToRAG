# Teams to RAG Documentation

Welcome to the comprehensive documentation hub for the Teams to RAG project. This documentation covers both the CLI export tool and the optional Docker-based RAG knowledge base application.

## Getting Started

### New Users
- **Want to export Teams chats?** Start with the [CLI Usage Guide](user-guide/cli-usage.md)
- **Want to deploy the AI search app?** Check out [Docker Deployment](user-guide/docker-deployment.md)
- **First time setup?** See [Configuration Guide](user-guide/configuration.md)

### Developers
- **Understand the architecture:** [Architecture Overview](developer/architecture.md)
- **Work with databases:** [Data Schemas](developer/data-schemas.md)
- **Want to contribute?** [Contributing Guide](developer/contributing.md)

### RAG System Designers
- **Choose RAG strategies:** [RAG Strategy Guide](rag/strategy-guide.md)
- **Implementation details:** [Technical Reference](rag/technical-reference.md)

## Documentation Structure

### User Guide
End-user documentation for installation, configuration, and daily usage.

- **[CLI Usage](user-guide/cli-usage.md)** - Complete guide to the Teams export tool
  - Interactive menu walkthrough
  - Exporting chats (1:1, group, channels)
  - Incremental updates
  - RAG optimization with Claude AI
  - Command-line flags reference

- **[Docker Deployment](user-guide/docker-deployment.md)** - Deploying the RAG knowledge base
  - Why Docker? Use cases and benefits
  - Architecture overview (services, networking)
  - Step-by-step deployment
  - Ollama configuration options
  - Service management and monitoring
  - Data persistence and volumes

- **[Configuration](user-guide/configuration.md)** - Environment variables and settings
  - Required vs optional variables
  - Authentication modes (delegated vs application)
  - Database settings
  - RAG configuration
  - Security best practices

- **[Troubleshooting](user-guide/troubleshooting.md)** - Common issues and solutions
  - Authentication errors
  - API errors (Microsoft Graph)
  - Database connection issues
  - Docker errors
  - Performance problems
  - How to get help (logs, diagnostics)

### Developer Guide
Technical documentation for developers working on or extending the project.

- **[Architecture](developer/architecture.md)** - System design and components
  - CLI Tool Architecture
    - Authentication layer (OAuth 2.0)
    - Microsoft Graph API client
    - Caching system (SQLite)
    - Interactive menu
    - RAG document generation
  - Docker RAG App Architecture
    - Service topology
    - Vector store (Milvus)
    - Knowledge graph (Neo4j)
    - LLM integration (Ollama/OpenAI)
  - Data flow diagrams
  - Technology choices and rationale

- **[Data Schemas](developer/data-schemas.md)** - Vector and graph database schemas
  - Vector store schema (ChromaDB/Milvus)
  - Knowledge graph schema (Neo4j)
  - Data mapping and transformation
  - Query patterns
  - Performance optimization

- **[Docker Setup](developer/docker-setup.md)** - Docker internals and customization
  - Docker architecture deep dive
  - Network topology and service communication
  - Port configuration
  - Volume management
  - Customization options
  - Performance tuning

- **[API Reference](developer/api-reference.md)** - Microsoft Graph API usage
  - API endpoints used
  - API limitations and workarounds
  - Pagination strategies
  - Rate limiting
  - Error handling patterns

- **[Contributing](developer/contributing.md)** - How to contribute
  - Development setup (local vs Docker)
  - Code organization
  - Testing approach
  - Pull request guidelines
  - Coding standards

### RAG System
Documentation specific to the RAG (Retrieval-Augmented Generation) knowledge base features.

- **[RAG Overview](rag/README.md)** - Introduction to the RAG system
  - System overview and capabilities
  - Quick start for users and developers
  - Technology stack
  - Related documentation

- **[Strategy Guide](rag/strategy-guide.md)** - Choosing optimal RAG strategies
  - Decision-making framework
  - Quick reference by data format
  - Data preparation strategies
    - Context-aware chunking
    - Contextual retrieval
    - Fine-tune embeddings
  - Retrieval strategies
    - Re-ranking
    - Agentic RAG
    - Hierarchical RAG
    - Knowledge graphs
    - Query expansion

- **[Development Plan](rag/development-plan.md)** - RAG application roadmap
  - Data source analysis
  - Recommended RAG strategy for Teams data
  - Technical architecture
  - Development phases
  - Key considerations (privacy, performance, scalability)

- **[Implementation Prompt](rag/implementation-prompt.md)** - Detailed specification
  - Core functionality requirements
  - Technical stack specifications
  - RAG strategy implementation
  - Code structure
  - Quality requirements

- **[Technical Reference](rag/technical-reference.md)** - Complete implementation guide
  - System architecture diagrams
  - Data ingestion pipeline
  - Vector store operations
  - RAG engine implementation
  - API endpoints and data models
  - Performance benchmarks
  - Deployment and troubleshooting

### Planning & History
Project roadmap, design decisions, and historical context.

- **[Roadmap](planning/roadmap.md)** - Current and future features
  - Completed features (Phase 1, 2, 3)
  - Current development status
  - Planned enhancements
  - Out of scope / Future considerations

- **[Design Decisions](planning/design-decisions.md)** - Why things are the way they are
  - Client-side filtering rationale
  - Dual storage strategy (vector + graph)
  - Docker deployment choices
  - Technology selection (ChromaDB, Neo4j, Milvus)
  - Authentication strategy

- **[Archive](planning/archive/)** - Historical PRDs and implementation notes
  - Phase 1 implementation story
  - Feature PRDs (interactive menu, vector export, knowledge base)
  - Technical decision records
  - User stories

## Key Concepts

### Two Tools in One
This repository contains two distinct but complementary tools:

1. **CLI Export Tool** (src/) - Node.js application for exporting Teams data
2. **RAG Knowledge Base** (backend/, frontend/, docker-compose.yml) - Full-stack AI search application

You can use either or both depending on your needs.

### Authentication Modes

**Delegated Auth** (Device Code Flow):
- User-based permissions
- No client secret required
- Interactive authentication
- 15-minute device code expiry

**Application Auth** (Client Credentials):
- App-based permissions
- Requires client secret
- Non-interactive
- Requires admin consent

### Incremental Updates

**Chat Messages:**
- Supports incremental updates
- Client-side filtering by date
- Stops pagination when old messages found
- Efficient for large chats

**Channel Messages:**
- No incremental support (API limitation)
- Always fetches all messages
- Use MAX_MESSAGES to limit

### Caching Strategy

- **Cache Validity:** 24 hours (configurable)
- **What's Cached:** Chat lists, channel lists, team metadata
- **Benefits:** Faster menu navigation, reduced API calls
- **Management:** Force refresh and clear cache options in menu

## Common Workflows

### Export a Teams Chat
1. Run `npm start` to open interactive menu
2. Select "Browse and select a chat to export"
3. Choose your chat from the list
4. Export is saved to `./output/` directory
5. Subsequent runs update the same file incrementally

### Deploy RAG Knowledge Base
1. Start Docker services: `docker-compose up -d`
2. Create Python environment: `conda create -n milvusImport310 python=3.10 -y`
3. Install dependencies: `pip install -r scripts/requirements-ingestion.txt`
4. Ingest data: `python scripts/ingest_data.py output/`
5. Access UI: http://localhost:3000

### Optimize Exports for RAG
1. Export chat: `npm start generate -- --chat-id "19:abc..."`
2. Optimize: `npm run optimize -- output/chat-name.md`
3. Optimized version saved with `-optimized` suffix
4. Ingest optimized files to RAG system

### Troubleshoot Authentication Issues
1. Check [Troubleshooting Guide](user-guide/troubleshooting.md)
2. Verify Azure AD app configuration
3. Run `npm start validate` to test auth
4. Check permissions and admin consent
5. Review error messages for specific guidance

## Additional Resources

### External Documentation
- [Microsoft Graph API Reference](https://learn.microsoft.com/en-us/graph/api/overview)
- [Milvus Documentation](https://milvus.io/docs)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [Ollama Documentation](https://ollama.ai/)

### Project Files
- [CLAUDE.md](../CLAUDE.md) - Context for Claude Code AI assistant
- [package.json](../package.json) - Node.js dependencies and scripts
- [docker-compose.yml](../docker-compose.yml) - Docker service definitions

## Contributing

We welcome contributions! Here's how to get involved:

1. Read the [Contributing Guide](developer/contributing.md)
2. Check [open issues](https://github.com/your-repo/issues)
3. Review the [Architecture](developer/architecture.md) to understand the codebase
4. Follow coding standards and testing guidelines
5. Submit pull requests with clear descriptions

## Getting Help

- **Documentation Issues:** Check this documentation hub first
- **Bug Reports:** Create an issue on GitHub
- **Feature Requests:** Create an issue with "enhancement" label
- **Questions:** Check troubleshooting guide or create a discussion

## Version History

This documentation structure was reorganized in November 2025 to:
- Reduce duplication from 14 root files to 2
- Create clear separation of user/developer/planning docs
- Improve discoverability and navigation
- Preserve historical context in archive

See [planning/archive/](planning/archive/) for project evolution details.

---

**Quick Links:**
- [Back to Main README](../README.md)
- [CLI Usage](user-guide/cli-usage.md)
- [Docker Deployment](user-guide/docker-deployment.md)
- [Architecture](developer/architecture.md)
- [RAG Documentation](rag/README.md)
