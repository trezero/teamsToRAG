# Docker Deployment Guide

This guide covers deploying the Teams to RAG application using Docker for containerized, production-ready operation.

## Table of Contents

- [Why Docker?](#why-docker)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Deployment Steps](#deployment-steps)
- [Ollama Configuration Options](#ollama-configuration-options)
- [Service Management](#service-management)
- [Data Persistence](#data-persistence)
- [Scaling Considerations](#scaling-considerations)
- [Network Configuration](#network-configuration)

## Why Docker?

Docker deployment offers several advantages for the Teams to RAG application:

- **Consistent Environment**: Same behavior across development, testing, and production
- **Isolated Dependencies**: No conflicts with other applications on your system
- **Easy Scaling**: Scale services independently based on load
- **Simplified Setup**: One command to start all services
- **Data Persistence**: Named volumes ensure data survives container restarts
- **Resource Management**: Control memory and CPU allocation per service

## Architecture Overview

The Docker stack consists of four main services:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                  (teams-rag-network)                    │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────┐  │
│  │     app     │───▶│   chromadb  │    │  neo4j   │  │
│  │  (Node.js)  │    │  (vectors)  │    │ (graph)  │  │
│  └──────┬──────┘    └─────────────┘    └──────────┘  │
│         │                                              │
│         │ connects to                                  │
│         ▼                                              │
│  ┌─────────────┐                                      │
│  │   ollama    │ (optional - see below)               │
│  │    (LLM)    │                                      │
│  └─────────────┘                                      │
└─────────────────────────────────────────────────────────┘
         │
         ▼
  Host Machine Ollama (127.0.0.1:11434)
```

### Service Roles

- **app**: Node.js CLI application for Teams data export and RAG operations
- **chromadb**: Vector database for semantic search and embeddings
- **neo4j**: Graph database for relationship queries (with APOC plugin)
- **ollama**: LLM service for AI-powered features (optional - can use external)

### Supporting Services

The stack also includes:
- **etcd**: Configuration management for Milvus (if using Milvus instead of ChromaDB)
- **minio**: Object storage for Milvus (if using Milvus instead of ChromaDB)

## Prerequisites

### System Requirements

- **Docker Desktop** (Windows/Mac) or **Docker Engine + Docker Compose** (Linux)
- **Minimum Resources**:
  - 8GB RAM (16GB recommended)
  - 20GB free disk space
  - 4 CPU cores
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (kernel 3.10+)

### Docker Installation

**Windows/Mac**: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

**Linux**:
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Verify Installation

```bash
docker --version
docker-compose --version
```

## Deployment Steps

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd teamsToRAG

# Copy environment template
cp .env.sample .env
```

### 2. Configure Environment Variables

Edit `.env` and set the required variables:

```env
# IMPORTANT: Change the default Neo4j password!
NEO4J_PASSWORD=your-secure-password-here

# Azure AD Authentication
TENANT_ID=your-azure-ad-tenant-id
CLIENT_ID=your-azure-ad-app-client-id
AUTH_MODE=delegated  # or 'application'

# Optional: For application auth mode
# CLIENT_SECRET=your-client-secret
```

See the [Configuration Guide](./configuration.md) for complete details on all available settings.

### 3. Choose Ollama Setup

You have two options for running Ollama (the LLM service):

#### Option A: Use External Ollama (Recommended)

If you already have Ollama running on your host machine or in another Docker stack:

```bash
# Ensure .env has (this is the default):
LLM_HOST_URL=http://host.docker.internal:11434

# Start services WITHOUT bundled ollama:
docker compose up --build
```

The app will connect to your existing Ollama instance at `127.0.0.1:11434`.

**Advantages**:
- No port conflicts
- Share Ollama models across multiple projects
- Simpler resource management

#### Option B: Use Bundled Ollama

If you want this stack to run its own dedicated Ollama instance:

```bash
# Edit .env and change:
LLM_HOST_URL=http://ollama:11434

# Start services WITH bundled ollama (using Docker profile):
docker compose --profile with-ollama up --build
```

**First-time setup**: Download the LLM model (this will take 5-10 minutes):
```bash
docker compose exec ollama ollama pull llama3.1
```

**Note**: This will create a port conflict if you already have Ollama running on port 11434.

### 4. Verify Services

Check that all services started successfully:

```bash
docker compose ps
```

Expected output:
```
NAME                STATUS              PORTS
teamstorag-app-1       running
teamstorag-chromadb-1  running
teamstorag-neo4j-1     running
teamstorag-ollama-1    running (if using bundled)
```

### 5. Test the Application

The CLI will be running in the `app` container:

```bash
# View the interactive menu (if container stays running)
docker compose logs app

# Or execute commands directly
docker compose exec app npm start menu
```

## Ollama Configuration Options

### External Ollama (Default Configuration)

**When to use**:
- You already have Ollama installed locally
- You want to share models across multiple projects
- You want to avoid port conflicts

**Configuration**:
```env
# .env
LLM_HOST_URL=http://host.docker.internal:11434
```

**Docker Compose**:
```bash
# Standard startup
docker compose up --build
```

**Testing connectivity**:
```bash
# From host machine
curl http://localhost:11434/api/tags

# From inside app container
docker compose exec app curl http://host.docker.internal:11434/api/tags
```

### Bundled Ollama

**When to use**:
- You want a fully self-contained stack
- You want to deploy to a remote server without Ollama
- You need version isolation for Ollama

**Configuration**:
```env
# .env
LLM_HOST_URL=http://ollama:11434
```

**Docker Compose**:
```bash
# Start with ollama profile
docker compose --profile with-ollama up --build

# Download model (one-time setup, ~4.7GB)
docker compose exec ollama ollama pull llama3.1

# Verify model is downloaded
docker compose exec ollama ollama list
```

**Resource considerations**:
- Ollama requires 4-8GB RAM depending on model size
- Models are stored in a Docker volume (`teams-rag-ollama-data`)

## Service Management

### Starting Services

```bash
# Start all services (detached mode)
docker compose up -d

# Start with build
docker compose up --build -d

# Start with bundled Ollama
docker compose --profile with-ollama up -d

# View startup logs
docker compose logs -f
```

### Stopping Services

```bash
# Stop services (preserves data)
docker compose down

# Stop and remove all data volumes
docker compose down -v

# Stop a specific service
docker compose stop app
```

### Restarting Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart neo4j

# Restart with rebuild
docker compose up --build -d
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f neo4j
docker compose logs -f chromadb

# Last 100 lines
docker compose logs --tail=100 app

# Since timestamp
docker compose logs --since 2024-01-01T10:00:00 app
```

### Service Status

```bash
# View running containers
docker compose ps

# View resource usage
docker stats

# Inspect a service
docker compose exec app node --version
docker compose exec neo4j cypher-shell --version
```

## Data Persistence

All application data is stored in Docker volumes and bind mounts, ensuring data survives container restarts and rebuilds.

### Named Volumes

These volumes are managed by Docker:

```bash
# List all volumes
docker volume ls | grep teams-rag

# Inspect a volume
docker volume inspect teams-rag-chroma-data
```

**Volume Breakdown**:

- `teams-rag-chroma-data` (500MB-10GB): Vector embeddings and indexes
- `teams-rag-neo4j-data` (100MB-5GB): Graph database storage
- `teams-rag-neo4j-logs` (10MB-100MB): Neo4j logs
- `teams-rag-neo4j-import` (variable): CSV/import files
- `teams-rag-neo4j-plugins` (50MB): APOC and other plugins
- `teams-rag-ollama-data` (5GB-50GB): LLM models (if using bundled Ollama)

### Bind Mounts

These directories are mounted from your host filesystem:

- `./.cache/` - SQLite cache database (24-hour validity)
- `./output/` - Exported Teams chat markdown files

**Advantages**:
- Easy access from host machine
- Can be edited/backed up directly
- Survives complete Docker cleanup

### Backup Strategy

**Backup volumes**:
```bash
# Create backup directory
mkdir -p backups

# Backup Neo4j data
docker run --rm \
  -v teams-rag-neo4j-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/neo4j-backup-$(date +%Y%m%d).tar.gz -C /data .

# Backup ChromaDB data
docker run --rm \
  -v teams-rag-chroma-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/chroma-backup-$(date +%Y%m%d).tar.gz -C /data .
```

**Restore from backup**:
```bash
# Stop services first
docker compose down

# Restore Neo4j
docker run --rm \
  -v teams-rag-neo4j-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/neo4j-backup-20240115.tar.gz -C /data

# Start services
docker compose up -d
```

**Backup bind mounts** (simpler):
```bash
# Cache and output directories
tar czf backups/cache-output-$(date +%Y%m%d).tar.gz .cache output
```

## Scaling Considerations

### Horizontal Scaling

The application is designed for single-instance deployment but can be adapted for scaling:

**Read-only replicas** (for query-heavy workloads):
```yaml
# docker-compose.override.yml
services:
  app:
    deploy:
      replicas: 3
```

**Database replication**:
- Neo4j: Use Neo4j Enterprise with clustering
- ChromaDB: Deploy multiple instances with shared storage

### Vertical Scaling

Increase resources for specific services:

```yaml
# docker-compose.override.yml
services:
  neo4j:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

### Resource Allocation Tips

**Development environment**:
- Neo4j: 2GB RAM
- ChromaDB: 1GB RAM
- App: 512MB RAM
- Ollama: 4GB RAM (if bundled)

**Production environment**:
- Neo4j: 4-8GB RAM
- ChromaDB: 2-4GB RAM
- App: 1GB RAM
- Ollama: 8GB RAM (if bundled)

## Network Configuration

### Internal Network

By default, all services communicate through an internal Docker network (`teams-rag-network`). **No ports are exposed to the host** to avoid conflicts.

Services communicate using Docker DNS:
- `http://chromadb:8000` - ChromaDB API
- `bolt://neo4j:7687` - Neo4j Bolt protocol
- `http://neo4j:7474` - Neo4j HTTP API
- `http://ollama:11434` - Ollama API (if bundled)

### Exposing Ports for Development

If you need to access services from your host machine (e.g., for debugging with Neo4j Browser):

1. Edit `docker-compose.yml`
2. Uncomment the `ports:` sections:

```yaml
services:
  neo4j:
    ports:
      - "7474:7474"  # Neo4j Browser
      - "7687:7687"  # Bolt protocol

  chromadb:
    ports:
      - "8000:8000"  # ChromaDB API
```

3. Restart services:
```bash
docker compose up -d
```

**Access URLs**:
- Neo4j Browser: http://localhost:7474
  - Username: `neo4j`
  - Password: (from `NEO4J_PASSWORD` in `.env`)
- ChromaDB API: http://localhost:8000/api/v1/heartbeat

### Host Connectivity

The app container can reach services on your host machine using the special hostname `host.docker.internal` (Docker Desktop) or `172.17.0.1` (Linux).

This is used for external Ollama:
```env
LLM_HOST_URL=http://host.docker.internal:11434
```

**Linux alternative**:
```env
LLM_HOST_URL=http://172.17.0.1:11434
```

## Next Steps

- Review [Configuration Guide](./configuration.md) for detailed environment variable documentation
- See [CLI Usage Guide](./cli-usage.md) for operating the application
- Check [Troubleshooting Guide](./troubleshooting.md) if you encounter issues

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Neo4j Docker Guide](https://neo4j.com/developer/docker/)
- [Ollama Documentation](https://ollama.ai/docs)
