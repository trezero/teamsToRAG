# RAG System Documentation

This directory contains comprehensive documentation for the Retrieval-Augmented Generation (RAG) system that powers the Teams knowledge base application.

## Overview

The RAG system enables intelligent querying of Microsoft Teams chat data by combining:
- **Vector Storage**: Milvus database for semantic search
- **Knowledge Graphs**: Neo4j for relationship-based queries
- **LLM Integration**: Ollama/OpenAI for response generation
- **Smart Retrieval**: Context-aware chunking, re-ranking, and agentic strategies

## Documentation Structure

### [Strategy Guide](strategy-guide.md)
Decision-making framework for selecting optimal RAG strategies based on data format and query types.

**Topics covered:**
- Data preparation strategies (context-aware chunking, contextual retrieval, fine-tuning)
- Retrieval strategies (re-ranking, agentic RAG, hierarchical RAG)
- Knowledge graphs and multi-query approaches
- Quick reference table for strategy selection by data format

**Use this when:** Designing or optimizing RAG pipelines for different datasets.

### [Development Plan](development-plan.md)
High-level roadmap for building the AI chat application with local Milvus vector database.

**Topics covered:**
- Data source analysis (Teams chat format)
- Recommended RAG strategy stack
- Technical architecture and components
- Development phases and timelines
- Success metrics and risk mitigation

**Use this when:** Understanding project scope, architecture decisions, or implementation phases.

### [Implementation Prompt](implementation-prompt.md)
Detailed specification for AI-assisted code generation of the RAG application.

**Topics covered:**
- Core functionality requirements
- Technical stack specifications
- RAG strategy implementation details
- Code structure and API design
- Quality requirements and testing strategy

**Use this when:** Implementing specific features or understanding detailed requirements.

### [Technical Reference](technical-reference.md)
Comprehensive technical documentation for the Teams RAG Chat Application.

**Topics covered:**
- System architecture and component design
- Data ingestion pipeline (TeamsChatParser, chunking strategy)
- Vector store schema and operations (Milvus)
- RAG engine implementation (QueryAnalyzer, ContextAwareChunker)
- API endpoints and data models
- Performance characteristics and benchmarks
- Deployment and troubleshooting guides

**Use this when:** Developing, debugging, or maintaining the RAG system components.

## Quick Start

### For Users
If you're looking to use the RAG knowledge base:
1. Start with the [User Guide](../user-guide/docker-deployment.md) for deployment instructions
2. Review [Configuration](../user-guide/configuration.md) for environment setup

### For Developers
If you're building or modifying the RAG system:
1. Read the [Development Plan](development-plan.md) to understand the architecture
2. Review the [Technical Reference](technical-reference.md) for implementation details
3. Consult the [Strategy Guide](strategy-guide.md) for RAG optimization decisions

## RAG Strategy Stack

Based on the Teams chat data format (conversational, semi-structured, with code snippets), the recommended combination is:

1. **Context-aware Chunking** (Data Prep) - Preserves conversation flow and semantic boundaries
2. **Re-ranking** (Retrieval) - Improves precision by using cross-encoder for final selection
3. **Agentic RAG** (Retrieval) - Dynamically chooses retrieval strategy based on query type

This stack balances accuracy, performance, and flexibility for conversational data.

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Vector DB** | Milvus 2.3.4 | Semantic similarity search |
| **Knowledge Graph** | Neo4j | Relationship queries |
| **Embeddings** | Sentence Transformers | Text vectorization |
| **LLM** | Ollama/OpenAI | Response generation |
| **Backend** | FastAPI | REST API |
| **Frontend** | React | User interface |

## Related Documentation

- [User Guide](../user-guide/) - How to use the RAG knowledge base
- [Developer Guide](../developer/) - System architecture and contribution guidelines
- [Data Schemas](../developer/data-schemas.md) - Vector and graph database schemas

## Contributing

See the [Contributing Guide](../developer/contributing.md) for development setup and guidelines for improving the RAG system.
