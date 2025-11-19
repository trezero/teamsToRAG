# Docker Setup - Configuration Notes

## Architecture Overview

This stack runs 3 core services in an isolated Docker network:
- **app**: Node.js CLI application
- **chromadb**: Vector database for semantic search
- **neo4j**: Graph database for relationship queries

## Port Configuration

**All ports are INTERNAL by default** to avoid conflicts with existing services.

### Why No External Ports?

The app container communicates with databases using Docker service names:
- `http://chromadb:8000` - ChromaDB API
- `bolt://neo4j:7687` - Neo4j Bolt protocol
- `http://neo4j:7474` - Neo4j HTTP API

External port exposure is **not required** for the app to function.

### When You Need External Access

If you want to access services from your host machine (for debugging):

1. Edit `docker-compose.yml`
2. Uncomment the `ports:` sections for the service you need
3. Restart: `docker compose up -d`

Example use cases:
- **Neo4j Browser** (`http://localhost:7474`): Query the graph database directly
- **ChromaDB API** (`http://localhost:8000`): Test vector operations

## External Service: Ollama

The app connects to your **existing Ollama instance** running on the host:
- Host: `http://host.docker.internal:11434`
- Configured via: `LLM_HOST_URL` in `.env`

The bundled Ollama service is commented out to avoid port conflicts.

## Configuration Summary

### .env Required Settings
```env
# External Ollama connection
LLM_HOST_URL=http://host.docker.internal:11434

# Neo4j authentication
NEO4J_PASSWORD=your-secure-password

# Teams authentication
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
AUTH_MODE=delegated
```

### Network Topology
```
Host Machine (127.0.0.1)
├── Your Ollama (port 11434)
└── Docker Network: teams-rag-network
    ├── app (connects to chromadb:8000, neo4j:7687, host.docker.internal:11434)
    ├── chromadb (port 8000 internal only)
    └── neo4j (ports 7474, 7687 internal only)
```

## Starting the Stack

```bash
# Standard startup (no port conflicts)
docker compose up --build

# View running services
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Accessing Services from Host

If you enabled external ports in docker-compose.yml:

### Neo4j Browser
```bash
# URL: http://localhost:7474
# Username: neo4j
# Password: [from NEO4J_PASSWORD in .env]
```

### ChromaDB API
```bash
# Test connection:
curl http://localhost:8000/api/v1/heartbeat

# List collections:
curl http://localhost:8000/api/v1/collections
```

### Ollama (External)
```bash
# Your existing ollama (not part of this stack):
curl http://localhost:11434/api/tags
```

## Data Persistence

All data is stored in named Docker volumes:
- `teams-rag-chroma-data`: Vector embeddings
- `teams-rag-neo4j-data`: Graph database
- `teams-rag-neo4j-logs`: Neo4j logs
- `teams-rag-neo4j-import`: Import directory
- `teams-rag-neo4j-plugins`: Neo4j plugins (APOC)

Plus bind mounts:
- `./.cache`: SQLite cache (accessible from host)
- `./output`: Exported markdown files (accessible from host)

To remove all data:
```bash
docker compose down -v
```

## Troubleshooting

### Neo4j Warnings (Safe to Ignore)

You may see this warning on first startup:
```
Warning: Folder mounted to "/plugins" is not writable from inside container.
Changing folder owner to neo4j.
```

**This is normal and handled automatically.** Neo4j changes the folder owner and continues. The warning won't appear on subsequent startups.

### Port Conflicts
**Default config avoids all port conflicts!** If you uncommented ports and see conflicts, either:
- Re-comment the ports (recommended)
- Stop the conflicting service
- Change port mapping (e.g., `"7475:7474"`)

### Cannot Connect to Ollama
Verify your external Ollama is running:
```bash
docker ps | grep ollama
curl http://localhost:11434/api/tags
```

### Cannot Connect to Neo4j/ChromaDB
These services should work without external ports. If the app can't connect:
```bash
# Check services are running:
docker compose ps

# Check logs:
docker compose logs chromadb
docker compose logs neo4j
```

### Permission Denied (.cache)
```bash
sudo chown -R $USER:$USER .cache
```

## Future: Bundled Ollama

If you want to switch to bundled Ollama (not recommended due to conflicts):

1. Uncomment the `ollama:` service in `docker-compose.yml`
2. Change `.env`: `LLM_HOST_URL=http://ollama:11434`
3. Start with: `docker compose up --build`
4. Download model: `docker compose exec ollama ollama pull llama3.1`

This will conflict with your existing Ollama on port 11434.
