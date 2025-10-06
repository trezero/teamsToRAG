# Teams to RAG

A CLI application that generates high-quality RAG (Retrieval-Augmented Generation) documents from Microsoft Teams chat conversations.

## Features

- 🔐 **Dual authentication modes**: Application (service) or Delegated (user) authentication
- 💬 Fetch complete chat history from Teams chats and channels
- 📝 Generate clean, formatted markdown documents optimized for RAG
- 🔄 **Incremental updates**: Automatically detects existing exports and only fetches new messages
- ⏰ Chronological ordering: Messages sorted from oldest to newest
- 📊 Optional chat statistics (message counts, participants, date ranges)
- ⚙️ Configurable via `.env` file or CLI arguments
- 🎯 Support for grouping messages by date
- 👥 Automatic member name resolution
- 🔑 Device code flow for user authentication (no secret needed)

## Prerequisites

1. **Azure AD App Registration** - Choose one authentication mode:

   **Option A: Delegated Authentication (Recommended for individual users)**
   - Application (client) ID
   - Tenant ID
   - **API Permissions** (Delegated permissions):
     - `ChatMessage.Read` - Read user chat messages
     - `Chat.Read` - Read user's chats
     - `ChannelMessage.Read.All` - Read user's channel messages
     - `User.Read` - Sign in and read user profile
   - No client secret required
   - User must be a member of the chat/channel

   **Option B: Application Authentication (For service/daemon apps)**
   - Application (client) ID
   - Client secret
   - Tenant ID
   - **API Permissions** (Application permissions):
     - `Chat.Read.All` or `Chat.ReadWrite.All` (for chats)
     - `ChannelMessage.Read.All` (for channels)
     - Admin consent granted

2. **Node.js** version 18 or higher

## Installation

1. Clone or download this repository:
```bash
git clone <repository-url>
cd teamsToRAG
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the sample:
```bash
cp .env.sample .env
```

4. Edit `.env` and configure based on your chosen authentication mode:

**For Delegated Authentication (user-based):**
```env
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
AUTH_MODE=delegated
TEAMS_CHAT_ID=your-chat-id-here
```

**For Application Authentication (service-based):**
```env
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here
AUTH_MODE=application
TEAMS_CHAT_ID=your-chat-id-here
```

## Azure AD Setup

Follow these steps to set up your Azure AD application:

### 1. Register an Application

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Set a name (e.g., `TeamsToRAG`)
4. Choose **Accounts in this organizational directory only**
5. For **Redirect URI**:
   - Delegated auth: Select "Public client/native (mobile & desktop)" and enter `http://localhost`
   - Application auth: Leave blank
6. Click **Register**

### 2. Configure API Permissions

**For Delegated Authentication (user-based):**
1. Go to your app's **API permissions** blade
2. Click **Add a permission** → **Microsoft Graph**
3. Choose **Delegated permissions**
4. Add these permissions:
   - `ChatMessage.Read` - Read user chat messages
   - `Chat.Read` - Read user's chats
   - `ChannelMessage.Read.All` - Read user's channel messages
   - `User.Read` - Sign in and read user profile
5. Admin consent is **not required** for these delegated permissions (except ChannelMessage.Read.All may require admin consent in some orgs)
6. In **Authentication** blade:
   - Under "Advanced settings" → "Allow public client flows" → Set to **Yes**

**For Application Authentication (service-based):**
1. Go to your app's **API permissions** blade
2. Click **Add a permission** → **Microsoft Graph**
3. Choose **Application permissions**
4. Add these permissions:
   - `Chat.Read.All` (for reading chat messages)
   - `ChannelMessage.Read.All` (for reading channel messages)
   - Or `Chat.ReadWrite.All` / `ChannelMessage.ReadWrite.All` (if you need write access)
5. Click **Grant admin consent** for your organization ⚠️ (Required)

### 3. Create Client Secret (Application Auth Only)

**Skip this step if using delegated authentication.**

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and set expiry
4. Click **Add**
5. **Copy the secret value immediately** (it won't be shown again!)

### 4. Get Your IDs

From the app's **Overview** page, copy:
- **Directory (tenant) ID** → `TENANT_ID` in `.env`
- **Application (client) ID** → `CLIENT_ID` in `.env`
- Client secret value (if using application auth) → `CLIENT_SECRET` in `.env`

## Finding IDs

### Chat ID (for 1-on-1 or group chats)

**Method 1: From Teams Web URL**
1. Open Teams in a web browser
2. Navigate to the chat
3. The URL will contain the chat ID:
   ```
   https://teams.microsoft.com/_#/conversations/{CHAT_ID}?...
   ```

**Method 2: Using Graph Explorer**
1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in and run: `GET https://graph.microsoft.com/v1.0/me/chats`
3. Find your chat and copy its `id` field

### Team ID and Channel ID (for Teams channels)

**Method 1: From Teams Web URL**
1. Open Teams in a web browser
2. Navigate to the channel
3. Click on the "..." menu next to the channel name
4. Select "Get link to channel"
5. The URL will contain both IDs:
   ```
   https://teams.microsoft.com/l/channel/{CHANNEL_ID}/...?groupId={TEAM_ID}&...
   ```
   - `groupId` = Team ID
   - First path segment after `/channel/` = Channel ID (URL encoded)

**Method 2: Using Graph Explorer**
1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in and run: `GET https://graph.microsoft.com/v1.0/me/joinedTeams`
3. Find your team and copy its `id` (this is the Team ID)
4. Run: `GET https://graph.microsoft.com/v1.0/teams/{TEAM_ID}/channels`
5. Find your channel and copy its `id` (this is the Channel ID)

**Note:** Channel IDs from URLs are usually encoded. Use the Graph API method for the exact format needed.

## Usage

### Validate Configuration

Before generating documents, validate your setup:

```bash
npm start validate
```

This checks that:
- All required environment variables are set
- Authentication works correctly

**Note for Delegated Auth:** When validating or generating, you'll be prompted to:
1. Visit `https://microsoft.com/devicelogin`
2. Enter the code displayed in your terminal
3. Sign in with your Microsoft account

### Generate RAG Document

**For Chats (1-on-1 or group):**

Basic usage (uses `TEAMS_CHAT_ID` from `.env`):
```bash
npm start generate
```

With custom chat ID:
```bash
npm start generate --chat-id "19:abc123..."
```

**For Channels:**

Using `.env` configuration (set `TEAMS_TEAM_ID` and `TEAMS_CHANNEL_ID`):
```bash
npm start generate
```

With command-line arguments:
```bash
npm start generate --team-id "YOUR-TEAM-ID" --channel-id "YOUR-CHANNEL-ID"
```

**Additional Options:**

Custom output path:
```bash
npm start generate --output ./my-docs/chat-export.md
```

Limit number of messages:
```bash
npm start generate --max-messages 100
```

Show statistics:
```bash
npm start generate --stats
```

Exclude metadata header:
```bash
npm start generate --no-metadata
```

Don't group by date:
```bash
npm start generate --no-group-by-date
```

**Note for Delegated Auth:** The tool will display a device code for you to authenticate with.

### Incremental Updates

The tool automatically supports incremental updates! When you run the same command twice:

**First run** (creates new export):
```bash
npm start generate --team-id "abc..." --channel-id "def..."
# Creates: ./output/channel-abc...-def....md
# Fetches ALL messages
```

**Second run** (updates existing export):
```bash
npm start generate --team-id "abc..." --channel-id "def..."
# Updates: ./output/channel-abc...-def....md
# Only fetches NEW messages since last run
# Appends them to the existing file
# Updates the "Last Run" timestamp
```

**How it works:**
1. The tool generates consistent filenames based on chat/channel IDs
2. On subsequent runs, it detects the existing export file
3. Reads the "Last Run" timestamp from the file header
4. Uses Graph API `$filter` to fetch only messages created after that timestamp
5. Appends new messages to the end of the file (chronological order)
6. Updates the header with new message count and timestamp

**Benefits:**
- ⚡ Much faster when checking for updates
- 💾 Preserves existing content
- 🔄 Always up-to-date with latest messages
- 📊 Maintains accurate total message counts

**To force a full re-export:**
- Delete the existing output file, or
- Use a different `--output` path

### All Options

```
Usage: teams-to-rag generate [options]

Options:
  -c, --chat-id <chatId>           Teams chat ID (for 1-on-1 or group chats)
  -t, --team-id <teamId>           Teams team ID (for channel messages)
  -ch, --channel-id <channelId>    Teams channel ID (for channel messages)
  -o, --output <path>              Output file path
  -m, --max-messages <number>      Maximum messages to fetch
  --no-metadata                    Exclude metadata from document
  --no-group-by-date               Do not group messages by date
  --stats                          Display chat statistics
  -h, --help                       Display help
```

## Configuration

### Environment Variables

All configuration can be set in `.env`:

```env
# Required
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
AUTH_MODE=delegated  # or 'application'

# Client Secret (only for application auth)
CLIENT_SECRET=your-client-secret

# Source Configuration (choose one)
# For chats:
TEAMS_CHAT_ID=your-chat-id
# For channels:
# TEAMS_TEAM_ID=your-team-id
# TEAMS_CHANNEL_ID=your-channel-id

# Optional
OUTPUT_DIR=./output
OUTPUT_FORMAT=markdown
MAX_MESSAGES=
INCLUDE_METADATA=true
GROUP_BY_DATE=true
```

### CLI Options Override Environment Variables

CLI arguments take precedence over `.env` settings.

## Output Format

The generated RAG document includes:

### Header (if `INCLUDE_METADATA=true`)
- Chat topic
- Chat type
- Total message count
- Creation date
- Export timestamp

### Messages
- Sender name
- Timestamp (optional)
- Message content (cleaned HTML)
- Attachments (if any)
- Reactions (if any)

### Example Output

```markdown
# Teams Chat Export for RAG

**Topic:** Project Planning
**Chat Type:** group
**Total Messages:** 156
**Created:** 1/15/2025, 9:30:00 AM
**Exported:** 1/20/2025, 2:45:00 PM

---

## 1/15/2025

**John Doe** - 9:32:15 AM
Let's discuss the Q1 roadmap today.

**Jane Smith** - 9:35:42 AM
Sounds good! I have some ideas for the new feature.

**John Doe** - 9:40:18 AM
Great! Can you share the mockups?

*Attachments:*
- mockup-v1.png

...
```

## Troubleshooting

### "Permission denied" error

**For Application Authentication:**
- Ensure your app has `Chat.Read.All` or `Chat.ReadWrite.All` permission
- Admin consent must be granted
- Verify you're using **Application permissions**, not Delegated

**For Delegated Authentication:**
- Ensure your app has `ChatMessage.Read` and `Chat.Read` delegated permissions
- Verify the signed-in user is a member of the chat
- Check that "Allow public client flows" is enabled in Azure AD app settings

### "Chat not found" error

Verify:
1. The chat ID is correct
2. For delegated auth: The authenticated user is a member of the chat
3. For application auth: The app has access to the chat

### "Failed to acquire token" error

**For Application Authentication:**
1. Check `TENANT_ID`, `CLIENT_ID`, and `CLIENT_SECRET` are correct
2. Verify client secret hasn't expired
3. Ensure no typos in `.env` file

**For Delegated Authentication:**
1. Check `TENANT_ID` and `CLIENT_ID` are correct
2. Verify "Allow public client flows" is enabled
3. Try signing in with a different browser if device code authentication fails

### Device code authentication times out

- The device code expires after 15 minutes
- Make sure to complete the authentication within this time
- Check your internet connection
- Verify the Azure AD app allows public client flows

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.