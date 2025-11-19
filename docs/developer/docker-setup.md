# Docker Setup - Deep Dive

This document provides comprehensive technical documentation for the Docker-based deployment architecture of the Teams to RAG application.

## Architecture Overview

This stack runs 3 core services in an isolated Docker network:
- **app**: Node.js CLI application
- **chromadb**: Vector database for semantic search
- **neo4j**: Graph database for relationship queries

## Network Topology

### Internal-Only Architecture

**All ports are INTERNAL by default** to avoid conflicts with existing services running on the host machine.

```
Host Machine (127.0.0.1)
├── Your Ollama (port 11434)
└── Docker Network: teams-rag-network
    ├── app (connects to chromadb:8000, neo4j:7687, host.docker.internal:11434)
    ├── chromadb (port 8000 internal only)
    └── neo4j (ports 7474, 7687 internal only)
```

### Why No External Ports?

The app container communicates with databases using Docker service names:
- `http://chromadb:8000` - ChromaDB API
- `bolt://neo4j:7687` - Neo4j Bolt protocol
- `http://neo4j:7474` - Neo4j HTTP API

**External port exposure is NOT required** for the application to function properly. This design:
- Avoids port conflicts with existing services
- Improves security (no exposed database ports)
- Simplifies deployment (works anywhere without port conflicts)

### When You Need External Access

For debugging or direct database access from your host machine:

1. Edit `docker-compose.yml`
2. Uncomment the `ports:` sections for the service you need
3. Restart: `docker compose up -d`

Example use cases:
- **Neo4j Browser** (`http://localhost:7474`): Query the graph database directly using Cypher
- **ChromaDB API** (`http://localhost:8000`): Test vector operations with curl/Postman

## Port Configuration

### Neo4j Ports

**Internal (always available)**:
- `7474`: HTTP web interface
- `7687`: Bolt protocol (used by app)

**External (commented out by default)**:
```yaml
# Uncomment in docker-compose.yml to enable
ports:
  - "7474:7474"  # Neo4j Browser
  - "7687:7687"  # Bolt protocol
```

### ChromaDB Ports

**Internal (always available)**:
- `8000`: ChromaDB API

**External (commented out by default)**:
```yaml
# Uncomment in docker-compose.yml to enable
ports:
  - "8000:8000"  # ChromaDB API
```

### Avoiding Port Conflicts

If you uncomment ports and encounter conflicts:

**Option 1: Re-comment the ports (recommended)**
```yaml
# Comment out the ports section
# ports:
#   - "7474:7474"
```

**Option 2: Change port mapping**
```yaml
# Map to different host port
ports:
  - "7475:7474"  # Access on localhost:7475 instead
```

**Option 3: Stop conflicting service**
```bash
# Find process using port 7474
lsof -i :7474

# Stop the process
kill -9 <PID>
```

## External Service Integration

### Ollama Connection

The app connects to your **existing Ollama instance** running on the host machine:

**Host Access**:
- Host URL: `http://host.docker.internal:11434`
- Configured via: `LLM_HOST_URL` environment variable in `.env`

**Why `host.docker.internal`?**

Docker provides this special DNS name to access the host machine from inside containers:
- On Docker Desktop (Mac/Windows): Works automatically
- On Linux: May require `--add-host=host.docker.internal:host-gateway` in docker-compose.yml

**Bundled Ollama (Commented Out)**

The docker-compose.yml includes a commented-out Ollama service. We don't use it by default because:
- Avoids port conflict with existing Ollama on port 11434
- Allows using your existing models without re-downloading
- Reduces container startup time

**To Use Bundled Ollama** (not recommended):

1. Uncomment the `ollama:` service in `docker-compose.yml`
2. Change `.env`: `LLM_HOST_URL=http://ollama:11434`
3. Start: `docker compose up --build`
4. Download model: `docker compose exec ollama ollama pull llama3.1`

**Note**: This will conflict with your existing Ollama on port 11434.

## Configuration Summary

### Required Environment Variables (.env)

```env
# External Ollama connection
LLM_HOST_URL=http://host.docker.internal:11434

# Neo4j authentication
NEO4J_PASSWORD=your-secure-password

# Teams authentication
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
AUTH_MODE=delegated

# Optional: For application auth mode
CLIENT_SECRET=your-client-secret
```

### Docker Compose Environment Variables

The docker-compose.yml passes environment variables to containers:

```yaml
services:
  app:
    environment:
      # Vector DB connection
      - VECTOR_DB_HOST=chromadb
      - VECTOR_DB_PORT=8000

      # Graph DB connection
      - GRAPH_DB_URI=bolt://neo4j:7687
      - NEO4J_PASSWORD=${NEO4J_PASSWORD}

      # LLM connection
      - LLM_HOST_URL=${LLM_HOST_URL}

      # Teams auth (from .env)
      - TENANT_ID=${TENANT_ID}
      - CLIENT_ID=${CLIENT_ID}
      - AUTH_MODE=${AUTH_MODE}
      - CLIENT_SECRET=${CLIENT_SECRET:-}
```

## Data Persistence

### Named Docker Volumes

Persistent data stored in Docker-managed volumes:

```yaml
volumes:
  teams-rag-chroma-data:      # ChromaDB vector embeddings
  teams-rag-neo4j-data:       # Neo4j graph database
  teams-rag-neo4j-logs:       # Neo4j application logs
  teams-rag-neo4j-import:     # Neo4j import directory
  teams-rag-neo4j-plugins:    # Neo4j plugins (APOC)
```

**Volume Locations**:
- Linux: `/var/lib/docker/volumes/`
- Docker Desktop (Mac): `~/Library/Containers/com.docker.docker/Data/vms/0/`
- Docker Desktop (Windows): `\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\`

**Inspect Volumes**:
```bash
# List all volumes
docker volume ls

# Inspect specific volume
docker volume inspect teams-rag-neo4j-data

# View volume size
docker system df -v
```

### Bind Mounts

Host directories mounted into containers:

```yaml
volumes:
  - ./.cache:/app/.cache              # SQLite cache (CLI tool)
  - ./output:/app/output              # Exported markdown files
  - ./sample_data:/app/sample_data    # Sample Teams exports
```

**Benefits of Bind Mounts**:
- Direct access from host machine
- Easy to edit and view files
- Survives container recreation
- No need for `docker cp` commands

**Permissions**:

If you encounter permission errors:
```bash
# Fix ownership
sudo chown -R $USER:$USER .cache output

# Or set permissions
chmod -R 755 .cache output
```

### Data Cleanup

**Remove all data and start fresh**:
```bash
# Stop containers and remove volumes
docker compose down -v

# This deletes:
# - All vector embeddings
# - All graph data
# - All logs
# - Plugin installations
```

**Remove only named volumes**:
```bash
# Stop containers
docker compose down

# Remove specific volume
docker volume rm teams-rag-neo4j-data

# Restart
docker compose up -d
```

**Keep volumes, recreate containers**:
```bash
# Rebuild and recreate containers
docker compose up -d --force-recreate --build
```

## Starting the Stack

### Standard Startup

```bash
# Start all services in background
docker compose up -d

# Start with logs visible
docker compose up

# Start and rebuild images
docker compose up --build

# Start specific service
docker compose up -d neo4j
```

### Verify Services

```bash
# View running services
docker compose ps

# Expected output:
# NAME                    STATUS    PORTS
# teamstorag-app-1       Up
# teamstorag-chromadb-1  Up
# teamstorag-neo4j-1     Up
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f neo4j
docker compose logs -f chromadb

# Last 100 lines
docker compose logs --tail=100 app

# Since specific time
docker compose logs --since 2025-01-20T10:00:00 app
```

### Stop Services

```bash
# Stop containers (keep data)
docker compose down

# Stop and remove volumes
docker compose down -v

# Stop and remove images
docker compose down --rmi all
```

## Accessing Services from Host

### Neo4j Browser

If external ports are enabled in docker-compose.yml:

```bash
# URL: http://localhost:7474
# Username: neo4j
# Password: [value from NEO4J_PASSWORD in .env]
```

**Useful Cypher Queries**:
```cypher
// Count all nodes
MATCH (n) RETURN count(n)

// Count all relationships
MATCH ()-[r]->() RETURN count(r)

// Show schema
CALL db.schema.visualization()

// Find all people
MATCH (p:Person) RETURN p LIMIT 10

// Find all chats
MATCH (c:Chat) RETURN c.topic, c.chatType, c.messageCount
```

### ChromaDB API

If external ports are enabled:

```bash
# Test connection
curl http://localhost:8000/api/v1/heartbeat

# List collections
curl http://localhost:8000/api/v1/collections

# Get collection info
curl http://localhost:8000/api/v1/collections/teams_messages

# Query collection (example)
curl -X POST http://localhost:8000/api/v1/collections/teams_messages/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_texts": ["project planning"],
    "n_results": 5
  }'
```

### Ollama (External)

Your existing Ollama instance (not part of this Docker stack):

```bash
# Test connection
curl http://localhost:11434/api/tags

# List models
curl http://localhost:11434/api/tags | jq '.models[].name'

# Generate completion
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1",
    "prompt": "Hello!"
  }'
```

## Troubleshooting

### Neo4j Warnings (Safe to Ignore)

You may see this warning on first startup:

```
Warning: Folder mounted to "/plugins" is not writable from inside container.
Changing folder owner to neo4j.
```

**This is normal and handled automatically.** Neo4j changes the folder owner and continues. The warning won't appear on subsequent startups.

### Cannot Connect to Ollama

**Verify Ollama is running**:
```bash
# Check process
ps aux | grep ollama

# Or check Docker container (if using Docker Desktop Ollama)
docker ps | grep ollama

# Test connection
curl http://localhost:11434/api/tags
```

**Check Docker host networking**:
```bash
# From inside app container
docker compose exec app curl http://host.docker.internal:11434/api/tags

# If this fails, your Docker doesn't support host.docker.internal
# Solution: Add to docker-compose.yml:
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### Cannot Connect to Neo4j/ChromaDB

**Check services are running**:
```bash
docker compose ps

# Should show all services as "Up"
# If not, check logs:
docker compose logs neo4j
docker compose logs chromadb
```

**Check network connectivity from app**:
```bash
# From inside app container
docker compose exec app curl http://chromadb:8000/api/v1/heartbeat
docker compose exec app curl http://neo4j:7474

# If these fail, network is misconfigured
# Solution: Recreate network
docker compose down
docker network rm teams-rag-network
docker compose up -d
```

### Port Conflicts

**If you uncommented ports and see conflicts**:

```
Error: Bind for 0.0.0.0:7474 failed: port is already allocated
```

**Find what's using the port**:
```bash
# Linux/Mac
lsof -i :7474

# Windows
netstat -ano | findstr :7474
```

**Solutions**:
1. Re-comment the ports (recommended)
2. Stop the conflicting service
3. Change port mapping (e.g., `"7475:7474"`)

### Permission Denied on Bind Mounts

**Symptom**:
```
Error: EACCES: permission denied, open '/app/.cache/teams-cache.db'
```

**Solution**:
```bash
# Fix ownership
sudo chown -R $USER:$USER .cache output

# Or set broader permissions
chmod -R 777 .cache output
```

### Container Keeps Restarting

**Check logs for errors**:
```bash
docker compose logs app

# Common issues:
# - Missing environment variables
# - Cannot connect to dependencies
# - Application crash on startup
```

**Verify environment variables**:
```bash
# Check .env file exists
cat .env

# Check variables are passed to container
docker compose exec app env | grep NEO4J_PASSWORD
```

### Out of Disk Space

**Check Docker disk usage**:
```bash
docker system df

# Clean up
docker system prune -a --volumes

# Remove specific volumes
docker volume rm teams-rag-chroma-data
```

## Performance Tuning

### Neo4j Memory Configuration

Edit `docker-compose.yml` to increase Neo4j memory:

```yaml
services:
  neo4j:
    environment:
      - NEO4J_server_memory_heap_initial__size=1G
      - NEO4J_server_memory_heap_max__size=2G
      - NEO4J_server_memory_pagecache_size=1G
```

**Guidelines**:
- Heap size: 1/4 to 1/2 of available RAM
- Page cache: As much as possible for large datasets
- Total: heap + page cache should not exceed 80% of RAM

### ChromaDB Performance

**Index Optimization**:
```python
# In backend/vector_store.py
collection_config = {
    "hnsw:space": "cosine",
    "hnsw:construction_ef": 200,  # Higher = better quality, slower build
    "hnsw:M": 16,                 # Connections per node
    "hnsw:search_ef": 100         # Search quality
}
```

**Batch Inserts**:
```python
# Insert in batches for better performance
batch_size = 100
for i in range(0, len(documents), batch_size):
    batch = documents[i:i+batch_size]
    collection.add(
        ids=[d['id'] for d in batch],
        documents=[d['content'] for d in batch],
        metadatas=[d['metadata'] for d in batch]
    )
```

### Resource Limits

Add resource limits to prevent containers from consuming all host resources:

```yaml
services:
  neo4j:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          memory: 2G
```

## Customization Options

### Using Different Vector Database

Replace ChromaDB with Milvus:

1. Update `docker-compose.yml`:
```yaml
services:
  milvus:
    image: milvusdb/milvus:latest
    ports:
      - "19530:19530"
    volumes:
      - milvus-data:/var/lib/milvus
```

2. Update `backend/vector_store.py` to use Milvus client
3. Update `.env`: `VECTOR_DB_HOST=milvus`

### Adding Redis for Caching

```yaml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

### Adding Monitoring

Add Prometheus and Grafana for monitoring:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
```

## Docker Compose Reference

### Service Dependencies

```yaml
services:
  app:
    depends_on:
      - chromadb
      - neo4j
```

This ensures:
- ChromaDB starts before app
- Neo4j starts before app
- App waits for dependencies to be "running"

**Note**: `depends_on` only waits for container start, not readiness. For production, add health checks:

```yaml
services:
  neo4j:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:7474"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      neo4j:
        condition: service_healthy
```

### Environment Variable Substitution

```yaml
environment:
  - NEO4J_PASSWORD=${NEO4J_PASSWORD}           # Required
  - CLIENT_SECRET=${CLIENT_SECRET:-}           # Optional with empty default
  - LOG_LEVEL=${LOG_LEVEL:-info}               # Optional with default value
```

### Build Context

```yaml
build:
  context: .                      # Build from current directory
  dockerfile: Dockerfile          # Use this Dockerfile
  args:
    - NODE_VERSION=18             # Build argument
```

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Neo4j Docker Documentation](https://neo4j.com/docs/operations-manual/current/docker/)
- [ChromaDB Docker Guide](https://docs.trychroma.com/deployment)
- [Ollama Documentation](https://github.com/ollama/ollama)
