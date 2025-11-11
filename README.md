# Teams RAG Chat Application

A complete AI chat application that allows users to query knowledge extracted from Microsoft Teams chat exports using a local Milvus vector database and Retrieval-Augmented Generation (RAG).

## Features

- **Data Ingestion**: Parse Teams chat Markdown files and extract structured data
- **Vector Storage**: Store chat knowledge in local Milvus database with embeddings
- **RAG Engine**: Implement context-aware chunking, re-ranking, and agentic retrieval
- **Chat Interface**: Web-based UI for natural language queries and responses
- **Local Deployment**: Full containerized setup with Docker Compose

## Architecture

```
teams-rag-app/
├── docker-compose.yml          # Multi-service Docker setup
├── backend/                    # FastAPI backend
│   ├── main.py                # API endpoints
│   ├── rag_engine.py          # RAG pipeline logic
│   ├── vector_store.py        # Milvus integration
│   ├── data_ingestion.py      # Teams parser
│   ├── models.py              # Pydantic models
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── ChatInterface.js
│   │   └── api.js
│   └── package.json
├── scripts/                    # Utility scripts
│   ├── ingest_data.py         # Data ingestion tool
│   └── setup.sh               # Setup script
└── docs/                      # Documentation
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- **Python 3.10** (required for data ingestion scripts)
- Conda (recommended for Python environment management)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd teams-rag-app
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment

Edit `.env` file with your settings:

```env
# Vector Database
VECTOR_DB_HOST=milvus-standalone
VECTOR_DB_PORT=19530

# LLM Configuration
LLM_HOST_URL=http://host.docker.internal:11434

# Optional: OpenAI API fallback
OPENAI_API_KEY=your-openai-api-key
```

### 3. Setup Local Python Environment for Data Ingestion

**Important:** The data ingestion script ([`scripts/ingest_data.py`](scripts/ingest_data.py)) runs on your **local machine** (not inside Docker) and connects to the Milvus database running in Docker. You need to set up a local Python environment with the required dependencies.

#### Option A: Using Conda (Recommended)

Create a dedicated conda environment with Python 3.10:

```bash
# Create conda environment
conda create -n milvusImport310 python=3.10 -y

# Activate the environment
conda activate milvusImport310

# Install required dependencies (minimal set for ingestion only)
pip install -r scripts/requirements-ingestion.txt
```

#### Option B: Using venv

```bash
# Create virtual environment with Python 3.10
python3.10 -m venv venv

# Activate the environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required dependencies (minimal set for ingestion only)
pip install -r scripts/requirements-ingestion.txt
```

**Note:** The [`scripts/requirements-ingestion.txt`](scripts/requirements-ingestion.txt) file contains only the minimal dependencies needed for data ingestion (`pymilvus`, `sentence-transformers`, `pydantic`). This is much lighter than the full [`backend/requirements.txt`](backend/requirements.txt) which includes FastAPI, web server dependencies, and other packages needed for the Docker container.

### 4. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- Milvus vector database
- FastAPI backend (web application)
- React frontend
- Supporting services (etcd, minio)

### 5. Ingest Teams Data

**Note:** Make sure your conda environment is activated before running ingestion!

```bash
# Activate environment (if not already active)
conda activate milvusImport310

# Ingest a directory of Teams chat files
python scripts/ingest_data.py sample_data

# Or ingest a single file
python scripts/ingest_data.py /path/to/teams/chat.md

# Verbose output for troubleshooting
python scripts/ingest_data.py --verbose sample_data
```

The ingestion script:
- Runs **locally** using your conda environment
- Connects to Milvus database running in Docker
- Parses Teams chat Markdown files
- Generates embeddings and stores vectors

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Core Endpoints

- `POST /api/chat` - Send chat queries
- `POST /api/ingest` - Upload and process Teams chat files
- `GET /api/conversations` - List available conversations
- `GET /api/health` - Service health check

### Management Endpoints

- `DELETE /api/conversations/{id}` - Delete conversation
- `POST /api/optimize` - Optimize vector index
- `GET /api/stats` - Get database statistics

## Data Format

Teams chats should be exported as Markdown with the following structure:

```markdown
# Chat Title

**Chat Type:** Group
**Message Count:** 150
**Exported On:** 12/01/2023

## 12/01/2023

**User Name** - 10:30 AM
Message content here...

**Another User** - 10:35 AM
Reply content...
```

## Development

### Local Python Environment Setup

**For Data Ingestion Only:**
```bash
# Using conda (recommended)
conda create -n milvusImport310 python=3.10 -y
conda activate milvusImport310
pip install -r scripts/requirements-ingestion.txt
```

**For Full Backend Development:**
If you want to run the FastAPI backend locally for development (not just ingestion):
```bash
# Using conda
conda create -n teamsRAG python=3.10 -y
conda activate teamsRAG
pip install -r backend/requirements.txt

# Or using venv
python3.10 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### Backend Development

Run the backend locally (outside Docker) for development:

```bash
# Activate your environment first
conda activate teamsRAG  # Use teamsRAG for full backend dev

cd backend
python main.py
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Testing Data Ingestion

Always ensure your conda environment is activated:

```bash
# Activate environment
conda activate milvusImport310

# Test with sample file
python scripts/ingest_data.py sample_data/chat-IRIS-Dev-Integration-Testing.md

# Test with directory
python scripts/ingest_data.py sample_data/

# With verbose logging
python scripts/ingest_data.py --verbose sample_data/
```

**Architecture Note:**
```
┌─────────────────────────────────────┐
│   Local Machine (Your Conda Env)   │
│                                     │
│  python scripts/ingest_data.py      │ ← Runs locally
│         ↓                           │
│  Imports: backend/vector_store.py   │
│         ↓                           │
└─────────┼───────────────────────────┘
          │ Network connection
          ↓
┌─────────────────────────────────────┐
│     Docker Containers               │
│                                     │
│  - Milvus (Vector DB)               │ ← Stores vectors
│  - FastAPI Backend (Web App)        │
│  - React Frontend                   │
└─────────────────────────────────────┘
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VECTOR_DB_HOST` | Milvus host | `milvus-standalone` |
| `VECTOR_DB_PORT` | Milvus port | `19530` |
| `LLM_HOST_URL` | LLM service URL | `http://host.docker.internal:11434` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `GRAPH_DB_URI` | Neo4j connection URI | `bolt://neo4j:7687` |

### RAG Configuration

The RAG engine can be configured via `RAGConfig` in the backend:

- **Embedding Model**: `all-MiniLM-L6-v2`
- **Chunk Size**: 1000 characters
- **Retrieval Strategy**: Hybrid with re-ranking
- **LLM**: OpenAI GPT-3.5-turbo with Ollama fallback

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError when running ingestion script**
   
   This means you haven't installed the dependencies in your local Python environment:
   ```bash
   conda activate milvusImport310
   pip install -r backend/requirements.txt
   ```

2. **Milvus Connection Failed**
   
   Check if Docker containers are running:
   ```bash
   docker-compose ps
   docker-compose logs milvus-standalone
   ```

3. **Frontend Not Loading**
   ```bash
   cd frontend && npm install && npm start
   ```

4. **Data Ingestion Errors**
   
   Run with verbose logging to see detailed error messages:
   ```bash
   conda activate milvusImport310
   python scripts/ingest_data.py --verbose your_file.md
   ```

5. **Python Version Issues**
   
   Ensure you're using Python 3.10:
   ```bash
   python --version  # Should show Python 3.10.x
   
   # If wrong version, recreate conda environment
   conda create -n milvusImport310 python=3.10 -y
   conda activate milvusImport310
   ```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f milvus-standalone
docker-compose logs -f app
```

## Production Deployment

### Using Docker Compose

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Environment Setup

1. Set production environment variables
2. Configure proper CORS origins
3. Set up SSL/TLS certificates
4. Configure reverse proxy (nginx)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 1: Foundation (MVP) ✅
- [x] Milvus setup with Docker
- [x] Teams data parser
- [x] Embedding pipeline
- [x] Basic retrieval
- [x] Minimal UI

### Phase 2: RAG Enhancement
- [ ] Context-aware chunking
- [ ] Re-ranking integration
- [ ] Agentic logic
- [ ] LLM integration
- [ ] Prompt engineering

### Phase 3: Production Features
- [ ] Query expansion
- [ ] Conversation memory
- [ ] Batch processing
- [ ] Error handling
- [ ] Performance optimization

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API documentation at `/docs`