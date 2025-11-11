# AI Coding Prompt: Teams Chat RAG Application

## Project Overview
Build a complete AI chat application that allows users to query knowledge extracted from Microsoft Teams chat exports using a local Milvus vector database. The application should implement Retrieval-Augmented Generation (RAG) with optimal strategies for conversational data.

## Requirements

### Core Functionality
- **Data Ingestion**: Parse Teams chat Markdown files and extract structured data
- **Vector Storage**: Store chat knowledge in local Milvus database with embeddings
- **RAG Engine**: Implement context-aware chunking, re-ranking, and agentic retrieval
- **Chat Interface**: Web-based UI for natural language queries and responses
- **Local Deployment**: Full containerized setup with Docker Compose

### Data Format
Teams chats are exported as Markdown with:
- Header metadata (topic, chat type, message count, timestamps)
- Date sections (## MM/DD/YYYY)
- Messages as: **User Name** - HH:MM AM/PM
- Content including text, code blocks, links, and multi-line messages

### Technical Stack
- **Backend**: Python with FastAPI (recommended for ML integrations)
- **Vector DB**: Milvus 2.x with local Docker deployment
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **LLM**: OpenAI API (gpt-3.5-turbo) with fallback to local Ollama
- **Frontend**: React with modern chat UI components
- **Infrastructure**: Docker Compose with separate services

### RAG Strategy Implementation
1. **Context-aware Chunking**: Split conversations by semantic boundaries (date changes, topic shifts) while preserving conversation flow
2. **Re-ranking**: Use cross-encoder for improved retrieval precision
3. **Agentic RAG**: Dynamic retrieval strategy based on query type (specific facts vs. general summaries)

## Implementation Phases

### Phase 1: Foundation (MVP)
1. **Milvus Setup**: Docker Compose with Milvus standalone
2. **Data Parser**: Python script to parse Teams Markdown into structured JSON
3. **Embedding Pipeline**: Generate and store vectors for chat content
4. **Basic Retrieval**: Simple vector similarity search
5. **Minimal UI**: React app with text input and response display

### Phase 2: RAG Enhancement
1. **Context-aware Chunking**: Implement semantic splitting preserving conversation context
2. **Re-ranking Integration**: Add cross-encoder model for result refinement
3. **Agentic Logic**: Query analysis to choose retrieval strategy
4. **LLM Integration**: Connect OpenAI API for response generation
5. **Prompt Engineering**: Craft effective system prompts for Teams chat context

### Phase 3: Production Features
1. **Query Expansion**: Generate multiple query variants for better retrieval
2. **Conversation Memory**: Maintain chat history and context
3. **Batch Processing**: Handle large chat exports efficiently
4. **Error Handling**: Comprehensive logging and graceful failures
5. **Performance Optimization**: Caching and index optimization

## Code Structure
```
teams-rag-app/
├── docker-compose.yml
├── backend/
│   ├── main.py (FastAPI app)
│   ├── models.py (Pydantic models)
│   ├── rag_engine.py (RAG logic)
│   ├── data_ingestion.py (Teams parser)
│   ├── vector_store.py (Milvus client)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── ChatInterface.js
│   │   └── api.js
│   └── package.json
├── milvus/
│   └── docker-compose.yml (Milvus config)
└── scripts/
    ├── ingest_data.py
    └── setup.sh
```

## Key Implementation Details

### Data Ingestion
- Parse Markdown headers for metadata
- Extract user names, timestamps, and message content
- Handle code blocks, links, and formatting
- Generate conversation chunks with context preservation

### Vector Database Schema
- Collection: "teams_chats"
- Fields: id, text, embedding, metadata (user, date, channel, chunk_type)
- Indexes: HNSW for vector search, scalar filters for metadata

### RAG Pipeline
1. **Query Processing**: Analyze query intent and expand if needed
2. **Retrieval**: Multi-stage search (initial candidates + re-ranking)
3. **Context Assembly**: Combine relevant chunks with conversation context
4. **Generation**: LLM generates response using retrieved context

### API Endpoints
- POST /ingest: Upload and process Teams chat files
- POST /chat: Send user query and receive AI response
- GET /conversations: List available chat sources
- GET /health: Service health check

## Quality Requirements
- **Response Time**: < 2 seconds for typical queries
- **Accuracy**: Relevant context retrieval from chat history
- **Scalability**: Handle 10k+ messages per chat export
- **Reliability**: Graceful error handling and recovery
- **Security**: Local deployment with no external data leakage

## Testing Strategy
- Unit tests for data parsing and RAG logic
- Integration tests for vector storage and retrieval
- E2E tests for chat functionality
- Performance benchmarks for large datasets

## Deployment
- Single command setup with Docker Compose
- Environment configuration for API keys and settings
- Volume mounts for data persistence
- Health checks and monitoring

Generate production-ready code following best practices for each component. Include comprehensive error handling, logging, and documentation. Ensure the application is easy to deploy and use locally.