# PRD: Interactive Chat/Channel Finder

## Overview
Add an interactive menu to the main application that allows users to discover and select Teams chats/channels before generating RAG documents, eliminating the need for a separate bash script.

## Goals
- Provide a user-friendly way to find chat/channel IDs without manually inspecting URLs
- Integrate chat discovery into the existing Node.js application
- Reuse existing authentication flow (no duplicate auth logic)
- Keep the current `generate` command working as-is for automation/scripting

## Non-Goals
- Building a GUI or web interface
- Supporting batch exports of multiple chats
- Advanced filtering or search capabilities

## User Experience

### New Command: `npm start` (or `npm start menu`)
When run without arguments, show an interactive menu:

```
🚀 Teams to RAG Generator

Please select an option:

1. Find and export a chat (1:1 or group)
2. Find and export a channel
3. Generate from current .env settings
4. Exit

Enter your choice [1-4]:
```

### Flow for Option 1 (Find Chat)
1. Authenticate user (reuse existing auth flow)
2. Fetch `/me/chats` from Graph API
3. Display numbered list:
   - For chats with topics: show topic
   - For 1:1 chats without topics: fetch and show other user's name
4. User enters number to select
5. Automatically run generation for selected chat
6. Save chat ID to `.env` for future use (optional enhancement)

### Flow for Option 2 (Find Channel)
1. Authenticate user
2. Fetch `/me/joinedTeams`
3. For each team, fetch channels
4. Display numbered list: "Team Name > Channel Name"
5. User enters number to select
6. Automatically run generation for selected channel
7. Save team/channel IDs to `.env` for future use (optional enhancement)

### Flow for Option 3 (Use .env)
1. Validate `.env` has required IDs
2. Run existing `generate` command logic
3. Same behavior as current `npm start generate`

## Technical Implementation

### File Structure
```
src/
  index.js           # Update to handle menu vs generate
  menu.js            # New: Interactive menu logic
  chatFinder.js      # New: Chat/channel discovery
  auth.js            # Existing: Reuse as-is
  teamsClient.js     # Existing: Reuse existing functions
  ragGenerator.js    # Existing: Reuse as-is
```

### Key Components

#### 1. Update `src/index.js`
- Default command (no args) → show menu
- `generate` command → existing behavior (unchanged)
- `validate` command → existing behavior (unchanged)

#### 2. New `src/menu.js`
```javascript
// Responsibilities:
// - Display interactive menu
// - Handle user input
// - Route to appropriate action
// - Use readline for interactive prompts
```

#### 3. New `src/chatFinder.js`
```javascript
// Responsibilities:
// - fetchAndDisplayChats(accessToken)
//   - Call GET /me/chats
//   - Parse and format chat list
//   - Handle 1:1 chat name resolution
//   - Return selected chat ID
//
// - fetchAndDisplayChannels(accessToken)
//   - Call GET /me/joinedTeams
//   - For each team, call GET /teams/{id}/channels
//   - Format as "Team > Channel"
//   - Return selected team ID and channel ID
```

### API Calls Needed
All endpoints already used in `findChatIDs.sh`:
- `GET /me/chats` - List user's chats
- `GET /me/chats/{id}/members` - Get chat members (for 1:1 names)
- `GET /users/{id}` - Get user display name
- `GET /me/joinedTeams` - List user's teams
- `GET /teams/{id}/channels` - List team's channels

### Authentication
- Reuse existing `getAccessToken()` from `auth.js`
- Single authentication per session
- Pass token to all subsequent API calls

### Error Handling
- Network timeouts (30-60 seconds per request)
- API errors (404, 403) with helpful messages
- Invalid user input (non-numeric, out of range)
- Empty results (no chats/channels found)

### User Feedback
- Progress indicators: "Fetching chats...", "✓ Found 15 chats"
- Clear error messages
- Confirmation of selection before generation

## Implementation Phases

### Phase 1: Core Menu (MVP)
- Add menu command to `index.js`
- Create `menu.js` with basic menu display
- Implement option 3 (use .env) - just call existing generate logic
- Add option 4 (exit)

### Phase 2: Chat Finder
- Create `chatFinder.js`
- Implement `fetchAndDisplayChats()`
- Handle 1:1 chat name resolution
- Integrate into menu option 1
- Auto-run generation after selection

### Phase 3: Channel Finder
- Implement `fetchAndDisplayChannels()` in `chatFinder.js`
- Integrate into menu option 2
- Auto-run generation after selection

### Phase 4: Polish (Optional)
- Save selected IDs to `.env` automatically
- Add "Recently used" option
- Better formatting/colors (reuse chalk)

## Success Criteria
- User can discover and export any chat without knowing the chat ID
- No duplicate authentication logic
- Existing `npm start generate` command unchanged
- Error messages are clear and actionable
- Works with both delegated and application auth modes

## Out of Scope
- Editing `.env` file programmatically (Phase 4 enhancement)
- Search/filter functionality
- Exporting multiple chats at once
- Scheduling or automation features
- Web UI or REST API

## Dependencies
- Existing: `axios`, `chalk`, `ora`, `commander`, `dotenv`
- New: `readline` (built-in Node.js module for interactive prompts)

## Migration Path
- `findChatIDs.sh` can remain for users who prefer bash
- Document both approaches in README
- Eventually deprecate bash script once Node version is stable

## Testing Approach
- Manual testing with real Teams account
- Test both auth modes (delegated and application)
- Test edge cases: no chats, no channels, network errors
- Verify existing `generate` command still works
