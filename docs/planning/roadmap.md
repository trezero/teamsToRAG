# Teams to RAG - Project Roadmap

This document consolidates the current status, completed features, and planned enhancements for the Teams to RAG project.

## Project Status

The Teams to RAG project consists of two main components:
1. **CLI Export Tool** (Core - Complete): Export Microsoft Teams chats and channels to RAG-optimized markdown
2. **Docker RAG Application** (Foundation Complete): Vector database + knowledge graph + LLM search over exported data

## Completed Features

### Phase 1: CLI Export Tool Foundation (Complete)
- [x] Microsoft Graph API integration with dual auth modes (delegated + application)
- [x] Device code flow OAuth 2.0 authentication
- [x] Interactive menu system for chat/channel discovery
- [x] SQLite caching layer for improved performance (24-hour cache validity)
- [x] Smart incremental updates with client-side filtering
- [x] Chat export to RAG-optimized markdown
- [x] Channel export to RAG-optimized markdown
- [x] Member resolution for 1:1 and group chats
- [x] Filename sanitization for consistent export naming
- [x] Configurable message grouping by date
- [x] HTML content cleaning and formatting
- [x] Optional metadata inclusion (timestamps, reactions, attachments)

**Key Implementation Details:**
- Client-side filtering with early pagination termination (Graph API limitation workaround)
- Incremental update tracking via file headers
- Cache management with status indicators
- Comprehensive error handling and user feedback

### Phase 2: Docker Infrastructure (Complete)
- [x] Full Docker Compose setup for multi-service deployment
- [x] Milvus vector database integration
- [x] Neo4j knowledge graph database integration
- [x] ChromaDB vector store support
- [x] Ollama LLM integration (external host connection)
- [x] Data persistence with Docker volumes
- [x] Internal-only port configuration (no port conflicts)
- [x] Environment-based configuration
- [x] Service health monitoring
- [x] Development and production deployment modes

**Architecture:**
- Isolated Docker network for service communication
- Named volumes for persistent storage (vector DB, graph DB, cache)
- Host bind mounts for accessible data (.cache, output)
- External Ollama connection via `host.docker.internal`

### Phase 3: Data Ingestion Pipeline (Complete)
- [x] Teams chat Markdown parser
- [x] Structured data extraction from chat exports
- [x] Message chunking for vector storage
- [x] Embedding generation using sentence transformers
- [x] Milvus collection initialization and configuration
- [x] Batch processing for efficient ingestion
- [x] Local Python environment setup for ingestion scripts
- [x] Ingestion CLI with verbose logging

## Current Status: Foundation Complete

The project has successfully established:
- A working CLI tool for exporting Teams data to markdown
- A containerized RAG application foundation with vector and graph databases
- Data ingestion capabilities for loading Teams data into Milvus
- Basic infrastructure for semantic search

**What's Working:**
- Export any Teams chat or channel to markdown
- Incremental updates for chats (new messages only)
- Docker deployment of all services
- Data persistence across container restarts
- Manual data ingestion from markdown files

**What's In Progress:**
- RAG query interface (web-based chat UI is scaffolded but not fully functional)
- Automated bulk export from Teams directly to vector database
- Knowledge graph population from chat data
- Agentic search with query routing

## Planned Features

### Phase 4: RAG Enhancement (Next Priority)
- [ ] Context-aware semantic chunking (5-10 messages per chunk)
- [ ] Re-ranking integration for improved search results
- [ ] Agentic query routing (vector vs graph vs hybrid)
- [ ] LLM integration for answer synthesis
- [ ] Prompt engineering and optimization
- [ ] Conversational search interface
- [ ] Source attribution in answers

**Focus Areas:**
- Semantic message grouping based on conversation flow
- Time-gap detection for chunk boundaries
- Hybrid search combining vector similarity and graph relationships
- Natural language to Cypher query generation
- Interactive Q&A interface with follow-up questions

### Phase 5: Bulk Export to Vector Database (Planned)
- [ ] Automated bulk export from cached chats to vector DB
- [ ] Incremental vector database updates
- [ ] Progress tracking and recovery for long-running exports
- [ ] Entity extraction using LLM (people, topics, dates)
- [ ] Knowledge graph population
- [ ] Relationship mapping (person-to-person, person-to-topic)
- [ ] Batch processing optimization

**Based on:** bulkExportToVectorDBPRD.md and unifiedTeamsKnowledgebasePRD.md

**Expected Workflow:**
1. User selects "Build/Update Knowledge Base" from menu
2. System processes all cached chats in batches
3. Messages are chunked and embedded
4. Entities are extracted and stored in graph
5. Both stores are updated atomically
6. Progress is persisted for resumability

### Phase 6: Production Features (Future)
- [ ] Query expansion for better search coverage
- [ ] Conversation memory in RAG interface
- [ ] Multi-chat batch processing
- [ ] Advanced error handling and retries
- [ ] Performance optimization and caching
- [ ] Search result ranking and filtering
- [ ] Export scheduling and automation
- [ ] Usage analytics and monitoring

**Stretch Goals:**
- Web-based management UI
- Multi-tenant support
- Cloud vector database options (Pinecone, Weaviate)
- Real-time sync with Teams (webhook integration)
- Advanced graph queries (influence analysis, topic trends)
- Export to other formats (PDF, HTML, JSON)

## Out of Scope

The following features are explicitly **not planned** for the foreseeable future:

### Current Limitations by Design
- **Multi-user/Multi-tenant**: Single-user local deployment only
- **Cloud Vector DB**: Only local ChromaDB/Milvus support
- **External API**: No REST API or web service endpoints
- **Advanced RAG Techniques**: No query rewriting, hypothetical documents, or multi-query retrieval
- **GUI Interface**: CLI and Docker-based only (no desktop application)
- **Real-time Sync**: Manual refresh only (no webhook listeners)
- **Multi-language Support**: English only
- **Custom Embedding Models**: Pre-trained models only
- **Distributed Processing**: Single machine deployment only

### Explicitly Deferred
- File content indexing (attachments, shared documents)
- Sentiment analysis of conversations
- Email and calendar integration
- Slack or other platform support
- Advanced analytics dashboard
- Content moderation or filtering
- Compliance and audit logging
- High availability / clustering

### Microsoft Graph API Limitations
- **Channel incremental updates**: Not supported by API (must fetch all messages)
- **Advanced filtering**: Limited `$filter` support on message endpoints
- **Delta queries**: Only for all user chats, not specific chats/channels
- **Historical data**: Limited to 8 months for some endpoints

## Migration Path

### For Existing Users
1. **CLI Tool Users**: No changes required, incremental updates continue to work
2. **Docker RAG App Early Adopters**: May need to rebuild containers and re-ingest data as schemas evolve
3. **Manual Ingestion**: Will be replaced by automated bulk export in Phase 5

### Upgrade Strategy
- Semantic versioning for releases
- Breaking changes will be documented in CHANGELOG
- Migration scripts provided for schema changes
- Backward compatibility for markdown export format

## Success Criteria

### Phase 4 Success Metrics
- RAG answers cite specific chats and dates
- Search returns relevant results in <1 second
- Answer synthesis completes in <3 seconds
- Query routing accuracy >90%

### Phase 5 Success Metrics
- Bulk export processes 100 chats/minute
- Incremental updates only process changed chats
- Graph queries complete in <1 second
- Entity extraction accuracy >85%

### Phase 6 Success Metrics
- Query expansion improves recall by 20%
- Batch processing reduces total time by 50%
- Error recovery allows resuming long exports
- Performance optimization reduces resource usage by 30%

## Timeline

**Note:** This is an open-source project with contributions from volunteers. Timelines are estimates and subject to change.

- **Phase 4 (RAG Enhancement)**: Q1 2026 (estimated 6-8 weeks effort)
- **Phase 5 (Bulk Export)**: Q2 2026 (estimated 4-6 weeks effort)
- **Phase 6 (Production)**: Q3 2026 onwards (ongoing improvements)

## How to Contribute

See the [Contributing Guide](../developer/contributing.md) for information on:
- Development setup
- Code organization
- Testing approach
- Pull request guidelines

## Related Documentation

- [Design Decisions](design-decisions.md) - Why we made key architectural choices
- [Historical Archive](archive/) - PRDs and implementation notes showing project evolution
- [User Stories](archive/user-stories-knowledge-base.md) - Detailed requirements for Phase 5
- [Data Schemas](../developer/data-schemas.md) - Vector and graph database schemas

## Feedback and Suggestions

Have ideas for future features? Please:
1. Check if it's in "Out of Scope" (we may have already considered it)
2. Open a GitHub issue with the "enhancement" label
3. Describe your use case and why it would be valuable
4. Be patient - we prioritize based on community needs and implementation complexity
