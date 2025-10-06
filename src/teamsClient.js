import axios from 'axios';

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

/**
 * Fetches all messages from a Teams chat
 * @param {string} accessToken - OAuth2 access token
 * @param {string} chatId - Teams chat ID
 * @param {number|null} maxMessages - Maximum number of messages to fetch (null for all)
 * @param {Date|null} sinceDate - Only fetch messages created after this date
 * @returns {Promise<Array>} Array of chat messages
 */
export async function fetchChatMessages(accessToken, chatId, maxMessages = null, sinceDate = null) {
  const messages = [];
  let url = `${GRAPH_API_BASE}/chats/${chatId}/messages?$top=50`;

  // Add date filter if provided
  if (sinceDate) {
    const filterDate = sinceDate.toISOString();
    url += `&$filter=createdDateTime gt ${filterDate}`;
  }

  let fetchedCount = 0;

  try {
    while (url) {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const batch = response.data.value;
      messages.push(...batch);
      fetchedCount += batch.length;

      // Check if we've reached the maximum
      if (maxMessages && fetchedCount >= maxMessages) {
        break;
      }

      // Check for next page
      url = response.data['@odata.nextLink'] || null;
    }

    // Reverse to get chronological order (API returns newest first)
    messages.reverse();

    // Trim to max if specified
    if (maxMessages && messages.length > maxMessages) {
      return messages.slice(-maxMessages);
    }

    return messages;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 404) {
        throw new Error(`Chat not found: ${chatId}. Verify the chat ID is correct.`);
      } else if (status === 403) {
        throw new Error(
          'Permission denied. For application auth, ensure Chat.Read.All permission with admin consent. For delegated auth, ensure ChatMessage.Read permission and user is a member of the chat.'
        );
      } else {
        throw new Error(
          `Graph API error: ${errorData.error?.message || error.message}`
        );
      }
    }
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
}

/**
 * Fetches all messages from a Teams channel
 * @param {string} accessToken - OAuth2 access token
 * @param {string} teamId - Teams team ID
 * @param {string} channelId - Teams channel ID
 * @param {number|null} maxMessages - Maximum number of messages to fetch (null for all)
 * @param {Date|null} sinceDate - Only fetch messages created after this date
 * @returns {Promise<Array>} Array of channel messages
 */
export async function fetchChannelMessages(accessToken, teamId, channelId, maxMessages = null, sinceDate = null) {
  const messages = [];
  let url = `${GRAPH_API_BASE}/teams/${teamId}/channels/${channelId}/messages?$top=50`;

  // Add date filter if provided
  if (sinceDate) {
    const filterDate = sinceDate.toISOString();
    url += `&$filter=createdDateTime gt ${filterDate}`;
  }

  let fetchedCount = 0;
  let pageCount = 0;

  try {
    while (url) {
      pageCount++;
      console.log(`  Fetching page ${pageCount}...`);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const batch = response.data.value;
      messages.push(...batch);
      fetchedCount += batch.length;

      console.log(`  Retrieved ${batch.length} messages (total: ${fetchedCount})`);

      // Check if we've reached the maximum
      if (maxMessages && fetchedCount >= maxMessages) {
        break;
      }

      // Check for next page
      url = response.data['@odata.nextLink'] || null;
    }

    // Reverse to get chronological order (API returns newest first)
    messages.reverse();

    // Trim to max if specified
    if (maxMessages && messages.length > maxMessages) {
      return messages.slice(-maxMessages);
    }

    return messages;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 404) {
        throw new Error(
          `Channel not found. Verify the team ID (${teamId}) and channel ID (${channelId}) are correct.`
        );
      } else if (status === 403) {
        throw new Error(
          'Permission denied. For application auth, ensure ChannelMessage.Read.All permission with admin consent. For delegated auth, ensure ChannelMessage.Read permission and user is a member of the team.'
        );
      } else {
        throw new Error(
          `Graph API error: ${errorData.error?.message || error.message}`
        );
      }
    }
    throw new Error(`Failed to fetch channel messages: ${error.message}`);
  }
}

/**
 * Fetches chat metadata (members, topic, etc.)
 * @param {string} accessToken - OAuth2 access token
 * @param {string} chatId - Teams chat ID
 * @returns {Promise<Object>} Chat metadata
 */
export async function fetchChatMetadata(accessToken, chatId) {
  try {
    const response = await axios.get(`${GRAPH_API_BASE}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    // Non-critical, return empty metadata
    console.warn('Could not fetch chat metadata:', error.message);
    return {};
  }
}

/**
 * Fetches chat members
 * @param {string} accessToken - OAuth2 access token
 * @param {string} chatId - Teams chat ID
 * @returns {Promise<Array>} Array of chat members
 */
export async function fetchChatMembers(accessToken, chatId) {
  try {
    const response = await axios.get(`${GRAPH_API_BASE}/chats/${chatId}/members`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.value;
  } catch (error) {
    console.warn('Could not fetch chat members:', error.message);
    return [];
  }
}
