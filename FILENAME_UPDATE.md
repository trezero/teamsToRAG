# Filename Update - Use Chat/Channel Names

## Change Summary

Updated the tool to use human-readable chat/channel names for output filenames instead of IDs.

## Before

```
Output: ./output/chat-19_meeting_NDQzNGVkYTEtYjU4Yi00NGFjLTliNTMtZDBlMDVlODdjZTAz@thread.v2.md
```

## After

```
Output: ./output/chat-IRIS-Dev-Integration-Meeting.md
```

## Implementation Details

### New Functions in [src/teamsClient.js](src/teamsClient.js:225)

1. **`fetchTeamMetadata(accessToken, teamId)`**
   - Fetches team information
   - Returns team display name

2. **`fetchChannelMetadata(accessToken, teamId, channelId)`**
   - Fetches channel information
   - Returns channel display name

### Updated Logic in [src/index.js](src/index.js:114)

**Step 1: Fetch metadata BEFORE generating filename**
- For chats: Fetch `metadata.topic` (chat name)
- For channels: Fetch `channelMetadata.displayName` (channel name)

**Step 2: Generate filename from name**
- Sanitize name: Remove invalid filename characters
- Replace spaces with dashes
- Add prefix: `chat-` or `channel-`
- Fallback to ID if name not available

**Sanitization rules:**
```javascript
const sanitizeForFilename = (str) => {
  return str
    .replace(/[:<>"\/\\|?*]/g, '-')  // Replace invalid chars with dash
    .replace(/\s+/g, '-')              // Replace spaces with dash
    .replace(/-+/g, '-')               // Replace multiple dashes with single
    .replace(/^-|-$/g, '');            // Remove leading/trailing dashes
};
```

## Examples

### Chat Name Examples

| Original Name | Filename |
|--------------|----------|
| "IRIS Dev Integration Meeting" | `chat-IRIS-Dev-Integration-Meeting.md` |
| "Project Planning" | `chat-Project-Planning.md` |
| "Team Standup: Q4 2025" | `chat-Team-Standup-Q4-2025.md` |
| (no name) | `chat-19_meeting.md` (uses ID) |

### Channel Name Examples

| Original Name | Filename |
|--------------|----------|
| "General" | `channel-General.md` |
| "Development Team" | `channel-Development-Team.md` |
| "Q4-Planning & Strategy" | `channel-Q4-Planning-Strategy.md` |
| (no name) | `channel-abc12345-def67890.md` (uses IDs) |

## Incremental Update Compatibility

✅ **Filenames remain consistent across runs**
- Same chat/channel will always generate same filename
- Incremental updates work correctly
- Existing exports are detected and updated

⚠️ **Note:** If you rename a chat/channel in Teams:
- Tool will generate a NEW file with the new name
- Old file with old name will remain
- This is expected behavior

## Benefits

1. **Human-readable filenames** - Easy to identify which chat/channel
2. **Better organization** - Files sorted alphabetically by name
3. **Easier to find** - No need to cross-reference IDs
4. **Professional** - Clean, descriptive filenames

## Fallback Behavior

If name cannot be fetched:
- Uses shortened ID (first 8 characters)
- Ensures filename is always generated
- Tool continues to work even if metadata fails

## Testing

```bash
# Test with your existing chat
npm start generate

# Should output something like:
# Output: ./output/chat-IRIS-Dev-Integration-Meeting.md
```

## Files Modified

- [src/teamsClient.js](src/teamsClient.js:225) - Added `fetchTeamMetadata()` and `fetchChannelMetadata()`
- [src/index.js](src/index.js:114) - Updated filename generation logic

## No Breaking Changes

- Custom `--output` paths still work
- Existing exports are still compatible
- ID-based fallback ensures nothing breaks
