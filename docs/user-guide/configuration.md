# Configuration Guide

This guide covers all configuration options for the Teams to RAG application through environment variables and settings files.

## Table of Contents

- [Configuration Methods](#configuration-methods)
- [Required Configuration](#required-configuration)
- [Authentication Modes](#authentication-modes)
- [Optional Settings](#optional-settings)
- [Database Configuration](#database-configuration)
- [RAG Settings](#rag-settings)
- [Configuration Examples](#configuration-examples)
- [Security Best Practices](#security-best-practices)

## Configuration Methods

The application can be configured through:

1. **Environment Variables** (.env file) - Primary method
2. **Command-line Flags** - Override .env settings for one-time operations
3. **Interactive Menu** - Runtime selection of chats/channels

### Priority Order

When the same setting is specified in multiple places:

```
Command-line flags > Environment variables > Default values
```

Example:
```bash
# .env has OUTPUT_DIR=./output
# Command overrides it:
npm start generate -- --output ./custom/path
```

## Required Configuration

### Minimum Required Variables

These variables must be set in `.env` for the application to function:

```env
# Azure AD Authentication
TENANT_ID=your-azure-ad-tenant-id
CLIENT_ID=your-azure-ad-app-client-id
AUTH_MODE=delegated
```

**How to obtain these values**:

1. **TENANT_ID**:
   - Azure Portal → Azure Active Directory → Properties → Tenant ID
   - Example: `12345678-1234-1234-1234-123456789abc`

2. **CLIENT_ID**:
   - Azure Portal → Azure Active Directory → App registrations → Your app → Application (client) ID
   - Example: `87654321-4321-4321-4321-cba987654321`

3. **AUTH_MODE**:
   - Choose `delegated` (user-based, device code flow) or `application` (app-based, client credentials)

### Additional for Docker Deployment

If running with Docker, also set:

```env
# Neo4j Authentication
NEO4J_PASSWORD=your-secure-password-here
```

**IMPORTANT**: Change from the default! Use a strong, unique password.

## Authentication Modes

The application supports two authentication modes with different permission requirements.

### Delegated Authentication (Default)

**Best for**: Individual users, interactive workflows

**Configuration**:
```env
AUTH_MODE=delegated
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
```

**How it works**:
1. User runs the application
2. Device code is displayed (e.g., "Visit https://microsoft.com/devicelogin and enter code: ABC123")
3. User authenticates in browser
4. Application receives user token

**Required Azure AD Permissions** (Delegated):
- `Chat.Read` - Read 1:1 and group chats
- `ChatMessage.Read` - Read chat messages
- `ChannelMessage.Read.All` - Read channel messages
- `User.Read` - Read user profile

**Advantages**:
- No client secret needed
- Works with personal accounts
- Easier to set up for individual use

**Limitations**:
- Requires interactive authentication
- User must be member of chats/channels to access
- Token expires after period of inactivity

### Application Authentication

**Best for**: Automation, scheduled jobs, service accounts

**Configuration**:
```env
AUTH_MODE=application
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

**How it works**:
1. Application authenticates using client credentials
2. Receives application token with broad permissions
3. Can access all chats/channels in tenant (with proper permissions)

**Required Azure AD Permissions** (Application):
- `Chat.Read.All` - Read all chats in tenant
- `ChannelMessage.Read.All` - Read all channel messages
- Admin consent required

**Advantages**:
- No user interaction needed
- Can access all organizational data
- Suitable for automation

**Limitations**:
- Requires client secret (security risk if exposed)
- Requires admin consent for permissions
- May have compliance implications

**Security Note**: Store `CLIENT_SECRET` securely. Never commit to version control!

## Optional Settings

### Output Configuration

Control where and how data is exported:

```env
# Output directory for exported markdown files
OUTPUT_DIR=./output
# Default: ./output

# Maximum number of messages to export (empty = all)
MAX_MESSAGES=
# Default: unlimited
# Example: MAX_MESSAGES=100 (export last 100 messages only)
```

### Message Formatting

Control the format and content of exported messages:

```env
# Include timestamps and metadata in exported files
INCLUDE_METADATA=true
# Default: true
# Set to false for cleaner, more compact output

# Group messages by date with headers
GROUP_BY_DATE=true
# Default: true
# When false, messages are listed continuously without date headers
```

**Example with `INCLUDE_METADATA=true`, `GROUP_BY_DATE=true`**:
```markdown
## 12/01/2023

**John Doe** - 10:30 AM
Hello team!

**Jane Smith** - 10:35 AM
Hi John!
```

**Example with `INCLUDE_METADATA=false`, `GROUP_BY_DATE=false`**:
```markdown
**John Doe**
Hello team!

**Jane Smith**
Hi John!
```

### Source Identifiers

Specify which chat or channel to export (alternative to interactive menu):

```env
# For 1:1 or group chats
TEAMS_CHAT_ID=19:abc123def456...

# For channels (both required)
TEAMS_TEAM_ID=12345678-1234-1234-1234-123456789abc
TEAMS_CHANNEL_ID=19:channel123abc...
```

**Usage**:
```bash
# With .env configured:
npm start generate

# Or override with CLI:
npm start generate -- --chat-id "19:abc123..."
```

### RAG Optimization

Enable Claude AI-powered optimization of exported markdown for better RAG retrieval:

```env
# Anthropic API key for RAG optimization
ANTHROPIC_API_KEY=sk-ant-api...
# Optional - only needed if using 'npm run optimize' command
```

**Usage**:
```bash
npm run optimize -- output/chat-Project-Discussion.md
```

## Database Configuration

### Vector Database (ChromaDB)

```env
# ChromaDB host (Docker service name or localhost)
VECTOR_DB_HOST=chromadb
# Default in Docker: chromadb
# Default locally: localhost

# ChromaDB port
VECTOR_DB_PORT=8000
# Default: 8000
```

### Graph Database (Neo4j)

```env
# Neo4j connection URI
GRAPH_DB_URI=bolt://neo4j:7687
# Default in Docker: bolt://neo4j:7687
# Default locally: bolt://localhost:7687

# Neo4j authentication
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-secure-password
# Required for Neo4j connection
```

### SQLite Cache

The SQLite cache database is stored at `./.cache/teams-cache.db` and does not require configuration.

**Cache behavior**:
- 24-hour validity period
- Stores Teams chats, channels, and metadata
- Significantly improves interactive menu performance
- Automatically created on first run

## RAG Settings

### LLM Configuration

```env
# Ollama service URL
LLM_HOST_URL=http://host.docker.internal:11434
# Docker (external Ollama): http://host.docker.internal:11434
# Docker (bundled Ollama): http://ollama:11434
# Local development: http://localhost:11434

# OpenAI API fallback (optional)
OPENAI_API_KEY=sk-...
# Used if Ollama is unavailable
```

### Embedding Configuration

Configured in code (backend/rag_engine.py):

```python
# Default embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Chunk size for text processing
CHUNK_SIZE = 1000

# Overlap between chunks
CHUNK_OVERLAP = 200
```

## Configuration Examples

### Example 1: Basic Development Setup

Minimal configuration for testing with delegated auth:

```env
# .env
TENANT_ID=12345678-1234-1234-1234-123456789abc
CLIENT_ID=87654321-4321-4321-4321-cba987654321
AUTH_MODE=delegated
OUTPUT_DIR=./output
```

### Example 2: Docker Deployment with External Ollama

Production setup using Docker with external Ollama:

```env
# .env
# Azure AD
TENANT_ID=12345678-1234-1234-1234-123456789abc
CLIENT_ID=87654321-4321-4321-4321-cba987654321
AUTH_MODE=delegated

# Neo4j
NEO4J_PASSWORD=a-very-secure-password-here

# Databases (Docker service names)
VECTOR_DB_HOST=chromadb
VECTOR_DB_PORT=8000
GRAPH_DB_URI=bolt://neo4j:7687

# External Ollama
LLM_HOST_URL=http://host.docker.internal:11434

# Output
OUTPUT_DIR=./output
INCLUDE_METADATA=true
GROUP_BY_DATE=true
```

### Example 3: Automated Export with Application Auth

Server-side automation using application authentication:

```env
# .env
# Azure AD (Application Auth)
AUTH_MODE=application
TENANT_ID=12345678-1234-1234-1234-123456789abc
CLIENT_ID=87654321-4321-4321-4321-cba987654321
CLIENT_SECRET=secretvalue~123abc

# Source (specific chat to export)
TEAMS_CHAT_ID=19:abc123def456789...

# Output settings
OUTPUT_DIR=/data/teams-exports
MAX_MESSAGES=1000
INCLUDE_METADATA=false
GROUP_BY_DATE=true

# Databases
VECTOR_DB_HOST=localhost
GRAPH_DB_URI=bolt://localhost:7687
NEO4J_PASSWORD=production-password
```

### Example 4: RAG Optimization with Claude AI

Configuration for using Claude AI to optimize exports:

```env
# .env
# Basic auth
TENANT_ID=12345678-1234-1234-1234-123456789abc
CLIENT_ID=87654321-4321-4321-4321-cba987654321
AUTH_MODE=delegated

# RAG optimization
ANTHROPIC_API_KEY=sk-ant-api03-...

# Output
OUTPUT_DIR=./output
INCLUDE_METADATA=true
GROUP_BY_DATE=true
```

## Security Best Practices

### 1. Protect Sensitive Credentials

**Never commit secrets to version control:**

```bash
# .gitignore should include:
.env
.env.local
.env.production
```

**Use environment-specific files:**
```bash
.env.development   # Development settings (safe to commit without secrets)
.env.production    # Production secrets (never commit)
.env.local         # Local overrides (never commit)
```

### 2. Secure Client Secrets

If using `application` auth mode:

**DO**:
- Store `CLIENT_SECRET` in secure vault (Azure Key Vault, AWS Secrets Manager)
- Rotate secrets regularly (every 90 days)
- Use separate credentials for dev/prod
- Restrict access to .env files (`chmod 600 .env`)

**DON'T**:
- Commit secrets to Git
- Share secrets via email/chat
- Use same secret across environments
- Log secrets in application logs

### 3. Minimize Permissions

Request only the permissions you need:

**For individual users**: Use `delegated` auth mode
- No client secret required
- User-scoped access only

**For service accounts**: Use `application` auth mode with least privilege
- Grant only necessary permissions
- Use dedicated service principal
- Enable MFA on admin accounts that grant consent

### 4. Neo4j Password Security

```env
# BAD - predictable password
NEO4J_PASSWORD=neo4j

# BAD - dictionary word
NEO4J_PASSWORD=password123

# GOOD - strong, unique password
NEO4J_PASSWORD=X9$mK2#pL8@qR5!nT3
```

**Generate secure passwords**:
```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 5. File Permissions

Restrict access to configuration files:

```bash
# Linux/Mac
chmod 600 .env
chmod 700 .cache

# Verify
ls -la .env
# Should show: -rw------- (owner read/write only)
```

### 6. Docker Secrets

For production Docker deployments, use Docker secrets instead of .env:

```yaml
# docker-compose.yml
services:
  app:
    secrets:
      - neo4j_password
      - client_secret

secrets:
  neo4j_password:
    file: ./secrets/neo4j_password.txt
  client_secret:
    file: ./secrets/client_secret.txt
```

### 7. Audit Configuration

Regularly review your configuration:

```bash
# Check what's in .env (be careful with output!)
cat .env | grep -v "PASSWORD\|SECRET\|KEY"

# Verify required variables are set
npm start validate
```

## Troubleshooting Configuration

### Configuration Not Loading

**Problem**: Changes to .env don't take effect

**Solution**:
```bash
# 1. Verify .env is in project root
ls -la .env

# 2. Restart application
npm start

# 3. For Docker, rebuild
docker compose down
docker compose up --build
```

### Authentication Errors

**Problem**: "Invalid client" or "Permission denied"

**Solution**:
```bash
# Validate configuration
npm start validate

# Check Azure AD settings:
# - Client ID matches app registration
# - Tenant ID is correct
# - Required permissions are granted
# - Admin consent provided (for application auth)
```

### Database Connection Errors

**Problem**: Cannot connect to Neo4j or ChromaDB

**Solution**:
```bash
# For Docker
docker compose ps  # Verify services are running
docker compose logs neo4j  # Check for errors

# Verify environment variables match service names
# Docker: GRAPH_DB_URI=bolt://neo4j:7687
# Local: GRAPH_DB_URI=bolt://localhost:7687
```

## Next Steps

- See [Quick Start Guide](./quick-start.md) for initial setup
- Review [Docker Deployment Guide](./docker-deployment.md) for containerized deployment
- Check [Troubleshooting Guide](./troubleshooting.md) for common issues

## Additional Resources

- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
