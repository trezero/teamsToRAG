# CLI Usage Guide

Complete guide to using the Teams to RAG CLI export tool.

## Overview

The CLI tool provides three ways to export Teams conversations:

1. **Interactive Menu** - Browse and select chats/channels (recommended)
2. **Command-Line Flags** - Direct export with specific parameters
3. **Environment Variables** - Configure `.env` for automated exports

---

## Table of Contents

- [Interactive Menu](#interactive-menu)
- [Command-Line Usage](#command-line-usage)
- [Exporting Chats](#exporting-chats)
- [Exporting Channels](#exporting-channels)
- [Incremental Updates](#incremental-updates)
- [RAG Optimization with Claude AI](#rag-optimization-with-claude-ai)
- [Common Workflows](#common-workflows)
- [Tips for Best Results](#tips-for-best-results)

---

## Interactive Menu

The interactive menu is the easiest way to export Teams conversations.

### Starting the Menu

```bash
npm start         # Default command
npm start menu    # Explicit
```

### Menu Options

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

### Option 1: Find and Export a Chat

Exports a 1:1 or group chat.

**Workflow**:
1. Select option 1
2. Authenticate (if not already authenticated)
3. Tool fetches all your chats (may take a moment)
4. Browse list of chats with type indicators:
   - `[1:1]` - One-on-one chat
   - `[Group]` - Group chat
   - `[Meeting]` - Meeting chat
5. Select a chat
6. Export completes - file saved to `./output/`

**Example Output**:
```
✓ Authenticated successfully
✓ Loading chats (using cache from 2 hours ago)...
✓ Found 127 chats

Select a chat:
  [1:1] John Doe
  [Group] Q1 Planning Team
  [Meeting] IRIS Dev Integration Testing
  [Group] Engineering Standup
  ...

✓ Chat metadata retrieved
✓ Fetching messages...
✓ Retrieved 1616 messages
✓ RAG document generated successfully

Output: output/chat-IRIS-Dev-Integration-Testing.md
```

### Option 2: Find and Export a Channel

Exports a Teams channel.

**Workflow**:
1. Select option 2
2. Authenticate (if not already authenticated)
3. Tool fetches your teams
4. Select a team
5. Tool fetches channels in that team
6. Select a channel
7. Export completes - file saved to `./output/`

**Note**: Channel messages always export ALL messages (no incremental support due to Microsoft Graph API limitations).

### Option 3: Generate from .env Settings

Uses chat/channel ID from `.env` file.

**When to use**:
- Automated exports (cron jobs, CI/CD)
- Repeated exports of the same conversation
- Scripting scenarios

**Setup**:
```env
# In .env file
TEAMS_CHAT_ID=19:meeting_abc123...@thread.v2

# OR for channels:
TEAMS_TEAM_ID=team-id-here
TEAMS_CHANNEL_ID=channel-id-here
```

Then run:
```bash
npm start generate
```

### Option 4: Refresh Cache

Forces a refresh of the cached chat/channel list.

**When to use**:
- You created a new chat/channel recently
- Cache is older than 24 hours
- You want the most up-to-date list

**What it does**:
- Re-fetches all chats/channels from Microsoft Graph API
- Updates SQLite cache with fresh data
- Shows cache age before and after refresh

### Option 5: Clear Cache

Completely clears the local cache.

**When to use**:
- Troubleshooting authentication issues
- Switching Azure AD accounts
- Cache appears corrupted

**Warning**: This will remove all cached data. Next fetch will be slower.

---

## Command-Line Usage

Run exports directly from the command line.

### Basic Commands

```bash
# Interactive menu (default)
npm start

# Explicit menu
npm start menu

# Generate from .env
npm start generate

# Validate configuration
npm start validate
```

### Export with Flags

```bash
# Export a specific chat
npm start generate -- --chat-id "19:abc123..."

# Export a channel
npm start generate -- --team-id "TEAM-ID" --channel-id "CHANNEL-ID"

# Custom output path
npm start generate -- --chat-id "19:abc123..." --output ./custom/path.md

# Limit number of messages
npm start generate -- --chat-id "19:abc123..." --max-messages 100

# Show statistics
npm start generate -- --chat-id "19:abc123..." --stats
```

### Available Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--chat-id` | Export specific chat by ID | `--chat-id "19:abc..."` |
| `--team-id` | Team ID (for channels) | `--team-id "team123"` |
| `--channel-id` | Channel ID (for channels) | `--channel-id "channel456"` |
| `--output` | Custom output file path | `--output ./exports/my-chat.md` |
| `--max-messages` | Limit message count | `--max-messages 500` |
| `--stats` | Show export statistics | `--stats` |

---

## Exporting Chats

### Chat Types

The tool supports three types of chats:

1. **One-on-one (1:1)**: Direct conversation between two people
2. **Group**: Multi-person chat
3. **Meeting**: Associated with a Teams meeting

All types are exported the same way through the interactive menu.

### Finding Chat IDs

**Option A: Interactive Menu** (Recommended)
```bash
npm start
# Select option 1, browse and select chat
# Chat ID is shown in output
```

**Option B: Microsoft Teams**
1. Open chat in Teams
2. Click chat name → "Get link to chat"
3. Extract ID from URL: `19:meeting_abc123...@thread.v2`

### Export Format

Exported chats use this structure:

```markdown
# Teams Chat Export for RAG

**Topic:** IRIS Dev Integration Testing
**Chat Type:** meeting
**Total Messages:** 1616
**Created:** 6/24/2025, 9:52:38 AM
**Last Run:** 2025-01-20T14:23:00Z

---

## 6/24/2025

**Jez Tucker** - 10:06:56 AM
fsuuid:inode:inodegen -> encode -> md5sum "like"

**Gareth Tucker** - 6:11:14 AM
Sounds good! Let me check the implementation.

## 6/30/2025

**Orlando Richards** - 9:32:00 AM
Updated the feature branch with latest changes.
```

### Filename Sanitization

Chat names are automatically sanitized for valid filenames:

- Removes: `: < > " / \ | ? *`
- Replaces spaces with `-`
- Example: `"Project: Q1 Planning"` → `chat-Project-Q1-Planning.md`

---

## Exporting Channels

### Finding Teams and Channels

**Option A: Interactive Menu** (Recommended)
```bash
npm start
# Select option 2
# Browse teams, then channels
```

**Option B: Microsoft Teams**
1. Navigate to channel
2. Click "..." → "Get link to channel"
3. Extract IDs from URL

### Channel Export Notes

**Important**: Channel exports **always fetch ALL messages** because:
- Microsoft Graph API doesn't support `$filter` on channel messages
- Only `$top` and `$expand` are supported
- No incremental update capability for channels

**Workaround**: Use `--max-messages` to limit size:
```bash
npm start generate -- --team-id "TEAM-ID" --channel-id "CHANNEL-ID" --max-messages 1000
```

---

## Incremental Updates

The tool supports smart incremental updates for **chats** (not channels).

### How It Works

1. **First export**: Fetches all messages, saves to file
2. **Subsequent exports**:
   - Reads `Last Run` timestamp from existing file
   - Fetches only messages newer than `Last Run`
   - Appends new messages to existing file
   - Updates header statistics

### Example Workflow

**Initial Export**:
```bash
npm start
# Select chat "Q1 Planning"
# Output: 500 messages → chat-Q1-Planning.md
```

**Later (after new messages)**:
```bash
npm start
# Select same chat "Q1 Planning"
# Detected existing export from 2025-01-15
# Fetching messages since 2025-01-15...
# Found 23 new messages
# Appending to existing file...
# ✓ Updated: chat-Q1-Planning.md
```

### File Header Updates

The header tracks export metadata:

```markdown
**Total Messages:** 523        ← Updated from 500
**Last Run:** 2025-01-20T10:15:00Z  ← Updated timestamp
```

### Benefits

- **Faster**: Only fetches new messages
- **Efficient**: Reduces API calls
- **Preserves history**: Maintains complete conversation timeline

### Forcing Full Re-export

To start fresh:

```bash
# Delete or rename existing export file
rm output/chat-Q1-Planning.md

# Then export again (will fetch all messages)
npm start
```

---

## RAG Optimization with Claude AI

Enhance exports for better RAG retrieval using Claude AI.

### Prerequisites

Set your Anthropic API key:

```env
# In .env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Basic Usage

```bash
# Optimize an exported file
npm run optimize -- "output/chat-Q1-Planning.md"
```

### Output Formats

#### Structured Format (Default)

Creates separate files for different document types:

```bash
npm run optimize -- "output/chat-Q1-Planning.md" --format structured
```

**Generated Files**:
- `{name}_summary.md` - Executive summary
- `{name}_topics.md` - Extracted topics list
- `{name}_decisions.md` - Decision log
- `{name}_action_items.md` - Action items list
- `{name}_rag_structured.md` - Main structured document

**Use case**: Targeted retrieval (e.g., "show me decisions", "list action items")

#### Semantic Format

Creates semantic chunks suitable for vector embeddings:

```bash
npm run optimize -- "output/chat-Q1-Planning.md" --format semantic
```

**Generated Files**:
- `{name}_rag_semantic.jsonl` - JSONL with semantic chunks

**Use case**: Vector database ingestion, semantic search

### Advanced Options

```bash
# Custom chunk size (for large chats)
npm run optimize -- "output/chat-*.md" --chunk-size 50000

# Exclude certain extractions
npm run optimize -- "output/chat-*.md" \
  --no-action-items \
  --no-summary

# Use different Claude model
npm run optimize -- "output/chat-*.md" \
  --model claude-3-opus-20240229

# Custom output directory
npm run optimize -- "output/chat-*.md" \
  --output ./my-rag-documents
```

### Example Output Structure

**Summary File** (`iris_dev_integration_testing_summary.md`):
```markdown
# Summary: IRIS Dev Integration Testing

The conversation centers around integration testing for IRIS Dev, with focus on
finalizing the inode etag format and Hub integration...

**Metadata:**
- Total Messages: 1616
- Participants: Jez Tucker, Gareth Tucker, Orlando Richards
- Topics: inode etag format, Hub integration, deployment
```

**Decisions File** (`iris_dev_integration_testing_decisions.md`):
```markdown
# Decisions: IRIS Dev Integration Testing

## Decision 1

**Summary:** Standardized inode etag format to `:fsid:ino:igen`

**Details:** The team agreed to use this format for consistency with
the ngrecall command...

**Participants:** Orlando Richards, Jez Tucker
```

### Cost Estimation

For a typical chat (1616 messages, ~350KB):

- **Input**: ~100,000 tokens @ $3/million = $0.30
- **Output**: ~5,000 tokens @ $15/million = $0.075
- **Total**: ~$0.38 per optimization

For regular workload (10 chats/month): ~$3.80/month

---

## Common Workflows

### Workflow 1: Export and Optimize

Complete export-to-RAG pipeline:

```bash
# Step 1: Export chat
npm start
# Select chat from menu

# Step 2: Optimize for RAG
npm run optimize -- "output/chat-Your-Chat-Name.md"

# Step 3: Use optimized documents
# Files are in output/rag/
```

### Workflow 2: Bulk Export Multiple Chats

Export several chats at once:

```bash
# Create a script file: bulk-export.sh
#!/bin/bash

# Chat IDs to export
CHATS=(
  "19:abc123...@thread.v2"
  "19:def456...@thread.v2"
  "19:ghi789...@thread.v2"
)

for CHAT_ID in "${CHATS[@]}"; do
  echo "Exporting $CHAT_ID..."
  TEAMS_CHAT_ID=$CHAT_ID npm start generate
done

echo "All exports complete!"
```

```bash
chmod +x bulk-export.sh
./bulk-export.sh
```

### Workflow 3: Scheduled Incremental Updates

Keep exports up-to-date with cron:

```bash
# Add to crontab (export every day at 2 AM)
0 2 * * * cd /path/to/teamsToRAG && TEAMS_CHAT_ID="19:abc..." npm start generate
```

### Workflow 4: Export → Optimize → Vector DB

Complete pipeline to vector database:

```bash
# 1. Export
npm start generate -- --chat-id "19:abc..."

# 2. Optimize with semantic format
npm run optimize -- "output/chat-*.md" --format semantic

# 3. Load into vector DB (example with your DB)
python scripts/load_to_vectordb.py output/rag/*_semantic.jsonl
```

---

## Tips for Best Results

### Exporting

1. **Start with small chats** to verify permissions and configuration
2. **Use incremental updates** for frequently-updated chats
3. **Use `--max-messages`** for testing to avoid rate limits
4. **Refresh cache periodically** (option 4) to see new chats

### RAG Optimization

1. **Clean exports first**: Run export separately to verify data quality
2. **Use structured format** for specific document types (decisions, actions)
3. **Use semantic format** for general-purpose RAG with vector search
4. **Combine both formats** for maximum flexibility
5. **Re-optimize periodically** when chat has significant new content
6. **Review extracted data** before using in production

### Performance

1. **Cache is your friend**: Don't clear unnecessarily
2. **Incremental > Full**: Use incremental updates when possible
3. **Batch optimization**: Optimize multiple files together
4. **Monitor API usage**: Both Microsoft Graph and Anthropic have rate limits

### Authentication

1. **Delegated mode** for user-based access (no client secret needed)
2. **Application mode** for automated/scheduled exports (requires client secret)
3. **Keep credentials secure**: Never commit `.env` to version control

---

## Next Steps

- **[Configuration Guide](configuration.md)** - Complete environment variable reference
- **[Troubleshooting](troubleshooting.md)** - Solutions to common issues
- **[Docker Deployment](docker-deployment.md)** - Deploy RAG knowledge base

---

## Getting Help

For issues or questions:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Review [Configuration Reference](configuration.md)
3. Search [GitHub Issues](https://github.com/your-org/teamsToRAG/issues)
4. Create a new issue with detailed error information
