# Docker Quick Start Guide

This guide helps you run the Teams to RAG application using Docker.

## Prerequisites

- Docker Desktop installed (or Docker Engine + Docker Compose)
- 16GB RAM minimum
- 20GB free disk space

## Quick Start

### 1. Clone and Configure

```bash
git clone <repository-url>
cd teamsToRAG

# Copy environment template
cp .env.sample .env

# Edit .env and set required variables:
# - NEO4J_PASSWORD (IMPORTANT: Change from default!)
# - TENANT_ID (your Azure AD tenant)
# - CLIENT_ID (your Azure AD app)
```

### 2. Choose Your Ollama Setup

You have two options:

#### Option A: Use External Ollama (Already Running)

If you already have Ollama running (e.g., in another Docker stack):

```bash
# .env should have (this is the default):
LLM_HOST_URL=http://host.docker.internal:11434

# Start services WITHOUT ollama:
docker compose up --build
```

The app will connect to your existing Ollama instance at `127.0.0.1:11434` on your host machine.

#### Option B: Use Bundled Ollama

If you want this stack to run its own Ollama:

```bash
# Edit .env:
LLM_HOST_URL=http://ollama:11434

# Start services WITH ollama (using profile):
docker compose --profile with-ollama up --build
```

**First run setup for bundled Ollama:**
```bash
# Download LLM model (~4.7GB, takes 5-10 minutes):
docker compose exec ollama ollama pull llama3.1
```

### 3. Verify Services Started

```bash
docker compose ps
```

You should see `app`, `chromadb`, and `neo4j` running (and `ollama` if using bundled).

### 4. Using the Application

Once all services are running, you'll see the interactive menu:

```
╔════════════════════════════════════════╗
║   Teams to RAG Generator               ║
╚════════════════════════════════════════╝

Please select an option:

1. Find and export a chat (1:1 or group)
2. Find and export a channel
3. Generate from current .env settings
4. Refresh cache
5. Clear cache
6. Build/Update Knowledge Base (Vectors & Graph)  [Coming Soon]
7. Search Knowledge Base (Agentic RAG)           [Coming Soon]
8. Exit
```

## Managing Services

### Stop Services (preserves data)
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f neo4j
```

### Restart Services
```bash
docker-compose restart
```

## Data Persistence

Data is stored in named Docker volumes:
- `teams-rag-chroma-data` - Vector embeddings
- `teams-rag-neo4j-data` - Graph database
- `teams-rag-ollama-data` - LLM models
- `./.cache/` - SQLite cache (bind mount)
- `./output/` - Exported markdown files (bind mount)

## Troubleshooting

### "Cannot connect to database"
- Check services are running: `docker-compose ps`
- Check logs: `docker-compose logs`
- Ensure NEO4J_PASSWORD is set in .env

### "Out of memory"
- Increase Docker Desktop memory limit to 8GB minimum
- Close other applications

### "Port already in use"
**By default, NO ports are exposed to avoid conflicts!**

If you uncommented ports and get conflicts:
- Neo4j ports (7474, 7687): Check for other Neo4j instances
- ChromaDB port (8000): Check for other ChromaDB/web services
- Ollama port (11434): Use your external Ollama (already configured)

Solutions:
- Don't expose ports (use default config) - app works fine without them
- Or stop conflicting services
- Or change port mappings in docker-compose.yml (e.g., `"7475:7474"`)

### "Permission denied" accessing .cache
```bash
# Fix cache directory permissions
sudo chown -R $USER:$USER .cache
```

### "Cannot connect to Ollama"
If using external Ollama:
```bash
# 1. Verify your ollama is running:
docker ps | grep ollama

# 2. Test connectivity from host:
curl http://localhost:11434/api/tags

# 3. Check your .env has correct URL:
LLM_HOST_URL=http://host.docker.internal:11434
```

If using bundled Ollama:
```bash
# 1. Start with the profile:
docker compose --profile with-ollama up

# 2. Check ollama is running:
docker compose ps ollama
```

## Service URLs

**Note:** Ports are NOT exposed to host by default to avoid conflicts. Services communicate via internal Docker network.

If you need external access to services (e.g., Neo4j Browser for debugging):
1. Uncomment the `ports:` sections in `docker-compose.yml`
2. Restart: `docker compose up -d`

Then access:
- Neo4j Browser: http://localhost:7474 (uncomment ports first)
- ChromaDB API: http://localhost:8000 (uncomment ports first)
- Ollama API: http://localhost:11434 (your external ollama)

## Development

To run the application locally (without Docker):

1. Install dependencies: `npm install`
2. Install Neo4j, ChromaDB, Ollama locally
3. Update .env with localhost URLs
4. Run: `npm start`

See `docs/DEVELOPMENT.md` for detailed local setup instructions.
