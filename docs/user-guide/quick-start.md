# Quick Start Guide

Get started with Teams to RAG in just a few minutes!

## Overview

Teams to RAG provides **two tools** that work together or independently:

1. **CLI Export Tool**: Export Microsoft Teams chats/channels to markdown files
2. **RAG Knowledge Base** (optional): Docker-based vector database + graph database + LLM for intelligent search

This guide will help you set up both tools.

---

## Prerequisites

### Required for Both Tools
- **Node.js 18+** installed ([download](https://nodejs.org/))
- **Azure AD Application** registered with appropriate permissions
  - [Guide: Register an Azure AD app](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
  - Required permissions:
    - **Delegated mode**: `ChatMessage.Read`, `Chat.Read`, `ChannelMessage.Read.All`
    - **Application mode**: `Chat.Read.All`, `ChannelMessage.Read.All` (requires admin consent)

### Additional for RAG Knowledge Base
- **Docker and Docker Compose** installed ([download](https://docs.docker.com/get-docker/))
- **16GB RAM minimum**
- **20GB free disk space**

### Optional for RAG Optimization
- **Anthropic API key** for Claude AI optimization ([get key](https://console.anthropic.com/))

---

## Option 1: CLI Export Tool (Fastest)

Get started exporting Teams chats in under 5 minutes.

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd teamsToRAG
npm install
```

### Step 2: Configure Environment

Copy the sample environment file:

```bash
cp .env.sample .env
```

Edit `.env` with your Azure AD settings:

```env
# Microsoft Azure AD
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
AUTH_MODE=delegated

# Output directory (optional)
OUTPUT_DIR=./output

# Claude AI (optional - for RAG optimization)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Step 3: Run the Interactive Menu

```bash
npm start
```

You'll see an interactive menu:

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
6. Build/Update Knowledge Base (Vectors & Graph)
7. Search Knowledge Base (Agentic RAG)
8. Exit
```

### Step 4: Export Your First Chat

1. Select **option 1** (Find and export a chat)
2. Authenticate with Microsoft (device code flow)
3. Browse your chats and select one to export
4. Chat is exported to `./output/` as a markdown file

**That's it!** You now have a RAG-optimized markdown file ready for use.

### Next Steps

- [Learn CLI Usage](cli-usage.md) - Detailed guide on using the export tool
- [Configure Settings](configuration.md) - Customize environment variables
- [Optimize for RAG](cli-usage.md#step-3-optimize-for-rag-with-claude-ai) - Use Claude AI to enhance exports

---

## Option 2: Docker RAG Knowledge Base

Deploy a full RAG system with vector search and knowledge graph.

### Step 1: Clone and Configure

```bash
git clone <repository-url>
cd teamsToRAG

# Copy environment template
cp .env.sample .env
```

### Step 2: Set Required Environment Variables

Edit `.env` and set:

```env
# IMPORTANT: Change from default!
NEO4J_PASSWORD=your-secure-password

# Azure AD (same as CLI tool)
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
AUTH_MODE=delegated

# LLM Connection (choose based on your Ollama setup)
LLM_HOST_URL=http://host.docker.internal:11434  # For external Ollama (default)
# LLM_HOST_URL=http://ollama:11434              # For bundled Ollama
```

### Step 3: Choose Your Ollama Setup

You have two options:

#### Option A: Use External Ollama (Recommended)

If you already have Ollama running on your machine:

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Start services WITHOUT bundled Ollama
docker compose up --build
```

#### Option B: Use Bundled Ollama

If you want this stack to include Ollama:

```bash
# Edit .env:
LLM_HOST_URL=http://ollama:11434

# Start services WITH ollama (using profile)
docker compose --profile with-ollama up --build

# First run: Download LLM model (~4.7GB, takes 5-10 minutes)
docker compose exec ollama ollama pull llama3.1
```

### Step 4: Verify Services Started

```bash
docker compose ps
```

You should see:
- `app` - Running (Node.js CLI)
- `chromadb` - Running (Vector database)
- `neo4j` - Running (Graph database)
- `ollama` - Running (only if using bundled)

### Step 5: Use the Application

Once services are running, the interactive menu is available. Connect to the app container:

```bash
# The app container runs the same interactive menu
docker compose logs -f app
```

Or use the CLI directly:

```bash
# Export chats, which will be available in ./output/
docker compose exec app npm start
```

### Step 6: Build Knowledge Base (Coming Soon)

Features 6 and 7 in the menu (Build Knowledge Base, Search Knowledge Base) are under development.

### Next Steps

- [Docker Deployment Guide](docker-deployment.md) - Detailed Docker setup and management
- [Configuration Reference](configuration.md) - All environment variables explained
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

---

## Verification

### Verify CLI Tool Works

```bash
# Validate configuration
npm start validate

# You should see:
# ✓ Environment variables loaded
# ✓ Authentication successful
# ✓ Microsoft Graph API accessible
```

### Verify Docker Services Work

```bash
# Check service health
docker compose ps

# All services should show "healthy" or "running"

# Test Neo4j connection
docker compose exec neo4j cypher-shell -u neo4j -p YOUR_PASSWORD "RETURN 1;"

# Should return: 1
```

---

## First Export Example

### Export a Teams Chat

```bash
# Start interactive menu
npm start

# Select option 1: Find and export a chat
# Browse your chats and select one
# Wait for export to complete

# Output file appears in ./output/
ls -lh output/
```

### Optimize for RAG (Optional)

```bash
# Optimize the exported file with Claude AI
npm run optimize -- "output/chat-Your-Chat-Name.md"

# RAG-optimized documents created in output/rag/
ls -lh output/rag/
```

---

## Common First-Time Issues

### "Permission denied" errors

**Cause**: Missing or incorrectly configured Azure AD permissions

**Solution**:
1. Check your Azure AD app has the required permissions
2. For delegated mode: Ensure permissions are granted for your user
3. For application mode: Ensure admin has consented to app permissions

### "Device code expired"

**Cause**: User didn't complete authentication within 15 minutes

**Solution**: Run the command again and complete authentication promptly

### "Cannot connect to database" (Docker)

**Cause**: Services not fully started or incorrect password

**Solution**:
```bash
# Check service status
docker compose ps

# Check logs for errors
docker compose logs neo4j
docker compose logs chromadb

# Ensure NEO4J_PASSWORD is set in .env
```

### "Out of memory" (Docker)

**Cause**: Insufficient Docker memory allocation

**Solution**:
- Increase Docker Desktop memory limit to **8GB minimum**
- Close other applications to free up RAM

---

## What's Next?

Now that you're set up, explore these guides:

- **[CLI Usage Guide](cli-usage.md)** - Learn all CLI features (interactive menu, commands, incremental updates)
- **[Docker Deployment](docker-deployment.md)** - Managing services, data persistence, scaling
- **[Configuration](configuration.md)** - Complete environment variable reference
- **[Troubleshooting](troubleshooting.md)** - Solutions to common problems

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Review [Configuration Reference](configuration.md) to ensure settings are correct
3. Search [GitHub Issues](https://github.com/your-org/teamsToRAG/issues)
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, Docker version)
