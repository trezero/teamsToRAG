# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Teams to RAG is a CLI application that exports Microsoft Teams chat conversations (1:1, group, and channels) and converts them into RAG-optimized markdown documents. The tool supports two authentication modes (delegated and application), includes smart incremental updates with client-side filtering, local SQLite caching, and optional Claude AI optimization for better RAG retrieval.

## Core Architecture

### Authentication Layer (src/auth.js)
- **Two authentication modes**:
  - `delegated`: Device code flow (OAuth 2.0) - no client secret required, user-based permissions
  - `application`: Client credentials flow - requires client secret, app-based permissions
- Device code flow polls Microsoft's token endpoint with configurable intervals
- Implements helpful error messages for common Azure AD configuration issues (e.g., public client flows not enabled)

### Microsoft Graph API Client (src/teamsClient.js)
- All API calls go through `GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'`
- **Important limitation**: Channel messages API does NOT support `$filter` on `createdDateTime` - only `$top` and `$expand` are supported
- Chat messages use client-side filtering for incremental updates (fetches newest first, stops when old messages found)
- Channel messages always fetch ALL messages (no incremental support due to API limitations)
- Implements pagination for all list operations (chats, channels, messages)

### Caching System (src/cache.js)
- Uses better-sqlite3 for local caching in `.cache/teams-cache.db`
- Three main tables: `chats`, `teams`, `channels`, plus `cache_metadata` for tracking sync times
- **24-hour cache validity period** - cache is considered stale after 24 hours
- Caching significantly improves interactive menu performance (no need to re-fetch hundreds of chats/channels)
- Database initialization creates tables and indexes automatically
- All database operations use transactions for better performance

### Interactive Menu System (src/menu.js + src/chatFinder.js)
- `menu.js`: Main interactive CLI menu with 6 options
- `chatFinder.js`: Handles fetching and displaying chats/channels with caching
- Resolves 1:1 chat names by expanding members during fetch (`$expand=members`)
- Displays cache status (age, validity) to users at menu startup
- Supports force refresh and cache clearing

### RAG Document Generation (src/ragGenerator.js)
- **Incremental update support**: Detects existing exports by parsing file headers
- Parses `Last Run` timestamp from existing files to determine since date
- Groups messages by date (configurable)
- Cleans HTML content (removes tags, converts entities)
- Generates consistent filenames based on chat/channel name or ID
- `appendMessagesToExport()`: Updates header stats and appends new messages to existing file
- Message format: sender name, optional timestamp, content, attachments, reactions

### Main CLI (src/index.js)
- Uses Commander.js for CLI parsing
- Three commands: `menu` (default), `generate`, `validate`
- Environment variables override-able by CLI flags
- Determines if operation is chat vs channel based on provided IDs
- Output path generation: sanitizes chat/channel names for valid filenames

## Common Development Commands

### Run the application
```bash
npm start                    # Runs interactive menu (default command)
npm start menu              # Explicitly run interactive menu
npm start generate          # Generate from .env settings
npm start validate          # Validate configuration and test auth
```

### Generate with CLI options
```bash
# For chats
npm start generate -- --chat-id "19:abc123..."

# For channels
npm start generate -- --team-id "TEAM-ID" --channel-id "CHANNEL-ID"

# With options
npm start generate -- --chat-id "19:abc123..." --output ./custom/path.md --max-messages 100 --stats
```

### RAG Optimization with Claude AI
```bash
npm run optimize -- output/chat-Project-Discussion.md
npm run optimize -- output/chat-Project-Discussion.md --format structured --output ./custom/rag
```

### Development mode (with auto-reload)
```bash
npm run dev
```

## Key Configuration (.env)

### Required for all modes
- `TENANT_ID`: Azure AD tenant ID
- `CLIENT_ID`: Azure AD application (client) ID
- `AUTH_MODE`: Either `delegated` or `application`

### Additional for application mode
- `CLIENT_SECRET`: Client secret from Azure AD

### Source identifiers (choose one)
- `TEAMS_CHAT_ID`: For 1:1 or group chats
- `TEAMS_TEAM_ID` + `TEAMS_CHANNEL_ID`: For channel messages

### Optional
- `OUTPUT_DIR`: Output directory (default: `./output`)
- `MAX_MESSAGES`: Limit number of messages (empty = all)
- `INCLUDE_METADATA`: Include timestamps and metadata (default: `true`)
- `GROUP_BY_DATE`: Group messages by date (default: `true`)
- `ANTHROPIC_API_KEY`: For RAG optimization with Claude AI

## Important Implementation Details

### Incremental Updates with Client-Side Filtering
- **Chat messages**: API returns newest first. Client filters by `createdDateTime > lastRun` and stops pagination early when old messages found
- **Channel messages**: No incremental support due to API limitations - always fetches all messages
- Incremental logic is in `fetchChatMessages()` and `fetchChannelMessages()` in teamsClient.js
- Export files track `Last Run` timestamp in ISO format in header for reliable parsing

### Filename Sanitization
- Chat/channel names sanitized to valid filenames: removes `:<>"\/\|?*`, replaces spaces with `-`
- Format: `chat-{name}.md` or `channel-{name}.md`
- Consistent naming enables incremental updates (same chat = same filename)

### Member Resolution
- For chats: Uses `$expand=members` to get member details during initial fetch
- Creates `memberMap` (userId -> displayName) for message formatting
- 1:1 chats without topics show as `[1:1] {OtherUserName}`

### Cache Database Schema
```sql
chats (id, chat_type, topic, display_name, members, created_at, last_updated, fetched_at)
teams (id, display_name, description, fetched_at)
channels (id, team_id, display_name, description, fetched_at)
cache_metadata (key, last_full_sync)
```

### Error Handling Patterns
- Microsoft Graph API errors include helpful context (404 = not found, 403 = permission denied)
- Device code flow errors provide Azure AD configuration instructions
- All spinners use ora for consistent UX

## Code Organization

```
src/
├── index.js          # Main CLI entry point (Commander.js)
├── menu.js           # Interactive menu UI
├── auth.js           # OAuth2 authentication (delegated + application)
├── teamsClient.js    # Microsoft Graph API client
├── chatFinder.js     # Chat/channel discovery with caching
├── cache.js          # SQLite caching layer
├── ragGenerator.js   # Markdown document generation
├── ragOptimizer.js   # Claude AI RAG optimization
└── optimizeRag.js    # RAG optimizer CLI
```

## Testing Approach

- Validate configuration: `npm start validate`
- Test with a small chat first to verify permissions
- Use `--max-messages` for testing to avoid rate limits
- Check cache validity in interactive menu before forcing refresh

## Common Issues

### "Permission denied" errors
- **Delegated auth**: Ensure `ChatMessage.Read`, `Chat.Read`, `ChannelMessage.Read.All` delegated permissions
- **Application auth**: Ensure `Chat.Read.All`, `ChannelMessage.Read.All` application permissions with admin consent
- Verify user is member of chat/channel for delegated auth

### "Device code expired"
- Device code expires after 15 minutes (configurable in Azure AD)
- User must complete authentication within this window

### Channel incremental updates not working
- This is expected behavior - Microsoft Graph API does not support `$filter` on channel messages
- Channels always fetch all messages

### Cache not refreshing
- Cache validity is 24 hours by default (see `CACHE_VALIDITY_MS` in cache.js)
- Use menu option 4 to force refresh
- Use menu option 5 to clear cache entirely
