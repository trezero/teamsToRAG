# Troubleshooting Guide

This guide covers common issues and their solutions when using the Teams to RAG application.

## Table of Contents

- [Authentication Errors](#authentication-errors)
- [API Errors](#api-errors)
- [Database Connection Errors](#database-connection-errors)
- [Docker Errors](#docker-errors)
- [Performance Issues](#performance-issues)
- [Data Ingestion Errors](#data-ingestion-errors)
- [Cache Issues](#cache-issues)
- [Diagnostic Commands](#diagnostic-commands)

## Authentication Errors

### "Permission denied" or 403 Forbidden

**Symptoms**:
- API returns 403 Forbidden
- Error message: "Access denied" or "Insufficient permissions"

**Causes & Solutions**:

#### For Delegated Authentication:
```bash
# Check Azure AD app permissions
# Required delegated permissions:
# - Chat.Read
# - ChatMessage.Read
# - ChannelMessage.Read.All
# - User.Read
```

**Steps to fix**:
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Select your app → API permissions
3. Add missing permissions under "Delegated permissions"
4. Click "Grant admin consent" (admin may need to do this)
5. Verify user is a member of the chat/channel you're trying to access

#### For Application Authentication:
```bash
# Required application permissions:
# - Chat.Read.All
# - ChannelMessage.Read.All
# - (Admin consent REQUIRED)
```

**Steps to fix**:
1. Azure Portal → Azure Active Directory → App registrations
2. Select your app → API permissions
3. Add permissions under "Application permissions"
4. Click "Grant admin consent for [Tenant]" (admin only)
5. Ensure `CLIENT_SECRET` is correctly set in `.env`

### "Device code expired"

**Symptoms**:
- Error during device code authentication
- Message: "The code has expired"

**Cause**: Device code expires after 15 minutes (default Azure AD setting)

**Solution**:
```bash
# Restart authentication and complete it faster
npm start validate

# Visit the provided URL immediately
# Enter the code shown
# Complete authentication within 15 minutes
```

**Prevention**:
- Keep browser ready before running command
- Don't wait to enter code
- Contact Azure AD admin to extend timeout (if needed)

### "Public client flows not enabled"

**Symptoms**:
- Error: "AADSTS7000218: The request body must contain the following parameter: 'client_assertion' or 'client_secret'"
- Occurs with delegated auth mode

**Cause**: Azure AD app registration doesn't allow device code flow

**Solution**:
1. Azure Portal → Azure Active Directory → App registrations
2. Select your app → Authentication
3. Under "Advanced settings" → "Allow public client flows": **YES**
4. Click "Save"
5. Retry: `npm start validate`

### "Invalid client" or "Client not found"

**Symptoms**:
- Error: "AADSTS700016: Application with identifier 'xxx' was not found"

**Cause**: Incorrect `CLIENT_ID` or `TENANT_ID` in `.env`

**Solution**:
```bash
# Verify configuration
cat .env | grep -E "CLIENT_ID|TENANT_ID"

# Get correct values from Azure Portal:
# - Azure AD → App registrations → Your app
# - Copy "Application (client) ID" → CLIENT_ID
# - Copy "Directory (tenant) ID" → TENANT_ID

# Update .env and retry
npm start validate
```

## API Errors

### "404 Not Found" - Chat or Channel

**Symptoms**:
- Error: "Resource not found"
- HTTP 404 when fetching chat/channel

**Causes & Solutions**:

1. **Incorrect ID format**:
```bash
# Chat IDs start with "19:" or "19%3A" (URL encoded)
TEAMS_CHAT_ID=19:abc123def456...

# Channel IDs also start with "19:"
TEAMS_CHANNEL_ID=19:channel789...

# Team IDs are GUIDs
TEAMS_TEAM_ID=12345678-1234-1234-1234-123456789abc
```

2. **User not a member**:
   - With delegated auth, user must be a member of the chat/channel
   - Solution: Have admin add user, or use application auth

3. **Chat/channel deleted**:
   - Verify it still exists in Teams
   - Check cache is not stale: Use menu option 4 to refresh

### "Rate limit exceeded" (429 Too Many Requests)

**Symptoms**:
- Error: "Rate limit is exceeded. Try again in X seconds"
- HTTP 429 status code

**Cause**: Microsoft Graph API throttling (too many requests)

**Solutions**:
```bash
# 1. Use MAX_MESSAGES to limit data fetched
MAX_MESSAGES=100
npm start generate

# 2. Wait before retrying (API provides retry-after header)
# Application automatically handles this

# 3. Enable caching to reduce API calls
# (Caching is enabled by default)

# 4. Stagger exports if processing many chats
# Don't run multiple exports simultaneously
```

**Graph API Limits**:
- Per-user: 2,000 requests/minute
- Per-app: 4,000 requests/10 seconds
- Individual calls have additional limits

### "Channel incremental updates not working"

**Symptoms**:
- Channel export always fetches all messages
- No "incremental" behavior for channels

**Cause**: This is **expected behavior** - Microsoft Graph API limitation

**Explanation**:
```bash
# Chat messages API: Supports $filter (allows incremental updates)
GET /chats/{id}/messages?$filter=createdDateTime gt 2024-01-01

# Channel messages API: Does NOT support $filter
GET /teams/{id}/channels/{id}/messages
# Only supports $top and $expand, not $filter
```

**Workaround**: None - this is an API limitation. Channels always fetch all messages.

**Mitigation**:
- Use `MAX_MESSAGES` to limit fetching
- Export channels less frequently
- Use caching to reduce API calls for other operations

## Database Connection Errors

### "Cannot connect to Neo4j"

**Symptoms**:
- Error: "Failed to connect to Neo4j"
- Connection timeout or refused

**Diagnostic steps**:
```bash
# Check if Neo4j is running
docker compose ps neo4j

# Check Neo4j logs
docker compose logs neo4j

# Test connection manually
docker compose exec neo4j cypher-shell -u neo4j -p your-password
# Should connect to neo4j prompt
```

**Solutions**:

1. **Neo4j not running**:
```bash
docker compose up -d neo4j
docker compose ps neo4j  # Verify status
```

2. **Wrong password**:
```bash
# Check .env
cat .env | grep NEO4J_PASSWORD

# Verify it matches what's in docker-compose.yml
# Update if needed and restart:
docker compose down
docker compose up -d
```

3. **Wrong connection URL**:
```bash
# Docker deployment
GRAPH_DB_URI=bolt://neo4j:7687

# Local development
GRAPH_DB_URI=bolt://localhost:7687

# Test connectivity
curl http://localhost:7474  # Neo4j Browser (if port exposed)
```

### "Cannot connect to ChromaDB"

**Symptoms**:
- Error: "Failed to connect to vector database"
- HTTP connection errors

**Diagnostic steps**:
```bash
# Check if ChromaDB is running
docker compose ps chromadb

# Check logs
docker compose logs chromadb

# Test API endpoint
curl http://localhost:8000/api/v1/heartbeat
# Should return: {}
```

**Solutions**:

1. **ChromaDB not running**:
```bash
docker compose up -d chromadb
```

2. **Wrong host/port**:
```bash
# Docker deployment
VECTOR_DB_HOST=chromadb
VECTOR_DB_PORT=8000

# Local development
VECTOR_DB_HOST=localhost
VECTOR_DB_PORT=8000
```

3. **Port conflict** (if exposing ports):
```bash
# Check what's using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Solution: Stop conflicting service or change port in docker-compose.yml
```

### "ModuleNotFoundError" (Python ingestion script)

**Symptoms**:
- Error: "ModuleNotFoundError: No module named 'pymilvus'" (or other modules)
- Occurs when running `python scripts/ingest_data.py`

**Cause**: Python dependencies not installed in local environment

**Solution**:
```bash
# 1. Create and activate conda environment
conda create -n milvusImport310 python=3.10 -y
conda activate milvusImport310

# 2. Install dependencies
pip install -r scripts/requirements-ingestion.txt

# 3. Verify installation
python -c "import pymilvus; print('OK')"

# 4. Run ingestion
python scripts/ingest_data.py sample_data/
```

**Note**: The ingestion script runs **locally** (not in Docker), so you need local Python dependencies.

## Docker Errors

### "Cannot connect to Docker daemon"

**Symptoms**:
- Error: "Cannot connect to the Docker daemon at unix:///var/run/docker.sock"

**Solutions**:

**Mac/Windows**:
```bash
# Start Docker Desktop
# Check status in system tray/menu bar

# Verify
docker ps
```

**Linux**:
```bash
# Start Docker service
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker

# Add user to docker group (to avoid sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

### "Port already in use"

**Symptoms**:
- Error: "Bind for 0.0.0.0:7474 failed: port is already allocated"

**Cause**: Another service using the port (or Docker config exposes ports unnecessarily)

**Solution**:

**Recommended**: Don't expose ports (default config avoids this):
```yaml
# docker-compose.yml
services:
  neo4j:
    # ports:  # Keep commented unless you need external access
    #   - "7474:7474"
```

**If you need external access**:
```bash
# Option 1: Stop conflicting service
docker ps  # Find conflicting container
docker stop <container-name>

# Option 2: Change port mapping
# Edit docker-compose.yml:
ports:
  - "7475:7474"  # Map to different host port
```

### "Out of memory" or performance issues

**Symptoms**:
- Services crashing
- Slow performance
- Docker Desktop showing high memory usage

**Solutions**:

1. **Increase Docker memory limit**:
   - Docker Desktop → Settings → Resources → Memory
   - Increase to 8GB minimum (16GB recommended)
   - Click "Apply & Restart"

2. **Optimize service memory**:
```yaml
# docker-compose.override.yml
services:
  neo4j:
    environment:
      - NEO4J_dbms_memory_heap_initial__size=512m
      - NEO4J_dbms_memory_heap_max__size=2g
```

3. **Clean up unused resources**:
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (WARNING: deletes data!)
docker volume prune
```

### "Permission denied" accessing mounted volumes

**Symptoms**:
- Error: "Permission denied" when writing to `.cache` or `output`
- Occurs on Linux hosts

**Cause**: Docker container UID doesn't match host UID

**Solutions**:

```bash
# Fix ownership of bind mounts
sudo chown -R $USER:$USER .cache output

# Verify permissions
ls -la .cache output

# Should show your user as owner
```

**Persistent fix** (Linux):
```bash
# Run containers with your UID/GID
# Create docker-compose.override.yml:
services:
  app:
    user: "${UID}:${GID}"

# Export your IDs
export UID=$(id -u)
export GID=$(id -g)

# Restart
docker compose up -d
```

### "Cannot connect to Ollama"

**Symptoms**:
- Error: "Failed to connect to LLM service"
- Timeout connecting to Ollama

**For external Ollama**:
```bash
# 1. Verify Ollama is running
docker ps | grep ollama
# OR
curl http://localhost:11434/api/tags

# 2. Check .env configuration
LLM_HOST_URL=http://host.docker.internal:11434

# 3. Test from app container
docker compose exec app curl http://host.docker.internal:11434/api/tags
```

**For bundled Ollama**:
```bash
# 1. Verify started with profile
docker compose --profile with-ollama ps

# 2. Check Ollama container logs
docker compose logs ollama

# 3. Verify model downloaded
docker compose exec ollama ollama list

# 4. Check .env configuration
LLM_HOST_URL=http://ollama:11434
```

## Performance Issues

### Slow export of large chats

**Symptoms**:
- Export takes minutes for chats with 1000+ messages
- High CPU usage

**Solutions**:

```bash
# 1. Use MAX_MESSAGES to limit export
MAX_MESSAGES=500
npm start generate

# 2. Disable metadata if not needed
INCLUDE_METADATA=false

# 3. Use incremental updates (chats only)
# Re-run export - only new messages fetched

# 4. Export during off-peak hours
# Microsoft Graph API is faster when less loaded
```

### Cache performance degradation

**Symptoms**:
- Interactive menu slow to load
- Database locks or timeouts

**Solutions**:

```bash
# 1. Clear stale cache
npm start menu
# Select option 5: Clear cache

# 2. Check cache size
du -h .cache/teams-cache.db

# If >100MB, rebuild:
rm .cache/teams-cache.db
npm start menu  # Will rebuild cache

# 3. Verify SQLite integrity
sqlite3 .cache/teams-cache.db "PRAGMA integrity_check;"
# Should return: ok
```

### Vector database query slowness

**Symptoms**:
- RAG queries take >5 seconds
- High ChromaDB CPU usage

**Solutions**:

```bash
# 1. Optimize vector index
# In application code or API:
POST /api/optimize

# 2. Reduce chunk size (less data to process)
# Edit backend/rag_engine.py:
CHUNK_SIZE = 500  # Down from 1000

# 3. Limit retrieval results
# Edit backend/rag_engine.py:
top_k = 5  # Down from 10

# 4. Restart ChromaDB to clear memory
docker compose restart chromadb
```

## Data Ingestion Errors

### "Invalid markdown format"

**Symptoms**:
- Ingestion script fails to parse markdown file
- Error: "Could not parse chat metadata"

**Cause**: Markdown file doesn't match expected format

**Expected format**:
```markdown
# Chat Title

**Chat Type:** Group
**Message Count:** 150
**Exported On:** 12/01/2023
**Last Run:** 2024-01-15T10:30:00Z

## 12/01/2023

**User Name** - 10:30 AM
Message content...
```

**Solution**:
```bash
# Use the Teams export tool from this project
npm start menu
# Select option 1 or 2 to export properly formatted files

# Then ingest:
python scripts/ingest_data.py output/
```

### "Embedding generation failed"

**Symptoms**:
- Error during ingestion: "Failed to generate embeddings"
- CUDA or torch errors

**Solutions**:

```bash
# 1. Check embedding model is available
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# 2. If CUDA errors, force CPU mode
# Edit scripts/ingest_data.py or backend/vector_store.py:
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# 3. Verify Python version
python --version  # Should be 3.10.x

# 4. Reinstall dependencies
pip install --upgrade sentence-transformers torch
```

## Cache Issues

### "Cache not refreshing"

**Symptoms**:
- New chats/channels don't appear in menu
- Displayed data is outdated

**Cause**: Cache is valid (less than 24 hours old) and not auto-refreshing

**Solutions**:

```bash
# Option 1: Force refresh from menu
npm start menu
# Select option 4: Refresh cache

# Option 2: Clear cache entirely
npm start menu
# Select option 5: Clear cache

# Option 3: Delete cache manually
rm .cache/teams-cache.db
npm start menu  # Rebuilds cache

# Option 4: Adjust cache validity period
# Edit src/cache.js:
const CACHE_VALIDITY_MS = 12 * 60 * 60 * 1000; // 12 hours instead of 24
```

### "SQLite database is locked"

**Symptoms**:
- Error: "database is locked"
- Occurs when multiple processes access cache

**Cause**: Another process has the database open

**Solutions**:

```bash
# 1. Check for other running instances
ps aux | grep node
# Kill any duplicate processes

# 2. Close database connections
# The app should handle this automatically
# If persists, restart:
docker compose restart app

# 3. Remove lock file if exists
rm .cache/teams-cache.db-wal
rm .cache/teams-cache.db-shm

# 4. Rebuild cache if corrupted
rm .cache/teams-cache.db
npm start menu
```

## Diagnostic Commands

### Validate configuration

```bash
# Test authentication and configuration
npm start validate

# Expected output:
# ✓ Configuration loaded
# ✓ Authentication successful
# ✓ API test successful
```

### Check service health

```bash
# All Docker services
docker compose ps
docker compose logs --tail=50

# Specific service
docker compose logs --tail=100 neo4j
docker compose logs --tail=100 chromadb

# Resource usage
docker stats --no-stream

# Network connectivity
docker compose exec app ping neo4j
docker compose exec app ping chromadb
```

### Test API connectivity

```bash
# Microsoft Graph API
curl -H "Authorization: Bearer $TOKEN" https://graph.microsoft.com/v1.0/me

# Neo4j (if port exposed)
curl http://localhost:7474

# ChromaDB (if port exposed)
curl http://localhost:8000/api/v1/heartbeat

# Ollama
curl http://localhost:11434/api/tags
```

### Inspect database

```bash
# SQLite cache
sqlite3 .cache/teams-cache.db ".tables"
sqlite3 .cache/teams-cache.db "SELECT COUNT(*) FROM chats;"

# Neo4j (via cypher-shell)
docker compose exec neo4j cypher-shell -u neo4j -p $NEO4J_PASSWORD
# Then run: MATCH (n) RETURN count(n);

# ChromaDB collections
curl http://localhost:8000/api/v1/collections
```

### Check application logs

```bash
# Application container
docker compose logs -f app

# Filter for errors
docker compose logs app | grep -i error

# Export logs to file
docker compose logs app > app-logs-$(date +%Y%m%d).txt
```

### Reset everything

When all else fails, complete reset:

```bash
# Stop all services
docker compose down

# Remove all volumes (WARNING: deletes all data!)
docker compose down -v

# Remove cache
rm -rf .cache

# Remove output
rm -rf output/*

# Rebuild and restart
docker compose up --build -d

# Verify
docker compose ps
```

## Getting Further Help

If you're still experiencing issues:

1. **Check logs**: `docker compose logs -f` often reveals the root cause
2. **Search issues**: Check GitHub issues for similar problems
3. **Create an issue**: Include:
   - Error message (full stack trace)
   - Steps to reproduce
   - Configuration (sanitized, no secrets!)
   - Environment (OS, Docker version, etc.)
   - Logs from relevant services

## Additional Resources

- [Configuration Guide](./configuration.md) - Review all configuration options
- [Docker Deployment Guide](./docker-deployment.md) - Docker-specific setup
- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/api/overview) - API reference
- [Neo4j Documentation](https://neo4j.com/docs/) - Database troubleshooting
- [Docker Compose Docs](https://docs.docker.com/compose/) - Container management
