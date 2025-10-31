import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';
import {
  isCacheValid,
  getChatsFromCache,
  saveChatsToCache,
  getTeamsFromCache,
  saveTeamsToCache,
  getChannelsFromCache,
  saveChannelsToCache,
  getAllChannelsFromCache,
} from './cache.js';

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

/**
 * Fetches and displays user's chats, returns selected chat ID
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<string|null>} Selected chat ID or null if cancelled
 */
export async function fetchAndDisplayChats(accessToken, forceRefresh = false) {
  let chats = [];
  
  // Check if we can use cached data
  if (!forceRefresh && isCacheValid('chats')) {
    const spinner = ora('Loading chats from cache...').start();
    chats = getChatsFromCache();
    spinner.succeed(`Loaded ${chats.length} chat(s) from cache`);
    console.log(chalk.gray('  (Cache is less than 24 hours old)\n'));
  } else {
    // Fetch from API
    const spinner = ora('Fetching your chats from Microsoft Graph API...').start();

    try {
      // Fetch chats with pagination and expand members to get user names
      let allChats = [];
      let url = `${GRAPH_API_BASE}/me/chats?$expand=members`;
      
      while (url) {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 60000,
        });

        const fetchedChats = response.data.value || [];
        allChats = allChats.concat(fetchedChats);
        
        // Check for next page
        url = response.data['@odata.nextLink'] || null;
        
        if (url) {
          spinner.text = `Fetching chats... (${allChats.length} so far)`;
        }
      }

      chats = allChats;
      spinner.succeed(`Fetched ${chats.length} chat(s) from API`);
      
      // Save to cache
      const cacheSpinner = ora('Saving to cache...').start();
      saveChatsToCache(chats);
      cacheSpinner.succeed('Chats cached for 24 hours');
    } catch (error) {
      throw error;
    }
  }

  try {

    if (chats.length === 0) {
      console.log(chalk.yellow('\n⚠️  No chats found.\n'));
      return null;
    }

    console.log(chalk.cyan('\nProcessing chat details...\n'));

    // Process and display chats
    const chatList = [];
    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      let displayName = chat.topic || '';

      // For 1:1 chats without topics, use the expanded members data
      if (!displayName && chat.chatType === 'oneOnOne') {
        try {
          const members = chat.members || [];
          
          // Find the other user (not the current user)
          // The current user typically has roles including 'owner'
          // Try to find a member with a displayName
          const otherMember = members.find((m) => m.displayName && m.displayName.trim() !== '');
          
          if (otherMember && otherMember.displayName) {
            displayName = `[1:1] ${otherMember.displayName}`;
          } else if (members.length > 0) {
            // Fallback: try to get email or userId
            const fallbackMember = members.find((m) => m.email || m.userId);
            if (fallbackMember) {
              displayName = `[1:1] ${fallbackMember.email || fallbackMember.userId || 'Unknown User'}`;
            } else {
              displayName = '[1:1 Chat]';
            }
          } else {
            displayName = '[1:1 Chat]';
          }
        } catch (error) {
          displayName = '[1:1 Chat]';
        }
      } else if (!displayName) {
        displayName = `[Unnamed ${chat.chatType || 'chat'}]`;
      }

      chatList.push({
        id: chat.id,
        displayName,
        chatType: chat.chatType,
      });

      console.log(chalk.green(`${i + 1}.`) + chalk.bold(` ${displayName}`));
      console.log(chalk.gray(`   ID: ${chat.id}\n`));
    }

    // Get user selection
    console.log(chalk.bold('\nEnter the number of the chat you want to export (or 0 to cancel): '));
    
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('', (answer) => {
        rl.close();
        
        const selection = parseInt(answer, 10);
        
        if (selection === 0) {
          console.log(chalk.yellow('\nCancelled.\n'));
          resolve(null);
          return;
        }

        if (isNaN(selection) || selection < 1 || selection > chatList.length) {
          console.log(chalk.red(`\nInvalid selection. Please enter a number between 1 and ${chatList.length}.\n`));
          resolve(null);
          return;
        }

        const selectedChat = chatList[selection - 1];
        console.log(chalk.green(`\n✓ Selected: ${selectedChat.displayName}`));
        console.log(chalk.cyan(`Chat ID: ${selectedChat.id}\n`));
        
        resolve(selectedChat.id);
      });
    });
  } catch (error) {
    spinner.fail('Failed to fetch chats');
    
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        console.error(chalk.red('\nPermission denied. Ensure you have Chat.Read permission.\n'));
      } else {
        console.error(chalk.red(`\nAPI Error: ${error.response.data?.error?.message || error.message}\n`));
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error(chalk.red('\nRequest timed out. Please check your network connection.\n'));
    } else {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
    
    return null;
  }
}

/**
 * Fetches and displays user's teams and channels, returns selected team and channel IDs
 * @param {string} accessToken - OAuth2 access token
 * @returns {Promise<{teamId: string, channelId: string}|null>} Selected IDs or null if cancelled
 */
export async function fetchAndDisplayChannels(accessToken, forceRefresh = false) {
  let teams = [];
  let channelList = [];
  
  // Check if we can use cached data
  if (!forceRefresh && isCacheValid('teams')) {
    const spinner = ora('Loading teams and channels from cache...').start();
    teams = getTeamsFromCache();
    channelList = getAllChannelsFromCache();
    spinner.succeed(`Loaded ${teams.length} team(s) and ${channelList.length} channel(s) from cache`);
    console.log(chalk.gray('  (Cache is less than 24 hours old)\n'));
  } else {
    // Fetch from API
    const spinner = ora('Fetching your teams from Microsoft Graph API...').start();

    try {
      // Fetch teams with pagination
      let allTeams = [];
      let url = `${GRAPH_API_BASE}/me/joinedTeams`;
      
      while (url) {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 60000,
        });

        const fetchedTeams = response.data.value || [];
        allTeams = allTeams.concat(fetchedTeams);
        
        // Check for next page
        url = response.data['@odata.nextLink'] || null;
        
        if (url) {
          spinner.text = `Fetching teams... (${allTeams.length} so far)`;
        }
      }

      teams = allTeams;
      spinner.succeed(`Fetched ${teams.length} team(s) from API`);
      
      // Save teams to cache
      const cacheSpinner = ora('Saving teams to cache...').start();
      saveTeamsToCache(teams);
      cacheSpinner.succeed('Teams cached');
    } catch (error) {
      throw error;
    }
  }

  try {

    if (teams.length === 0) {
      console.log(chalk.yellow('\n⚠️  No teams found.\n'));
      return null;
    }

    // Only fetch channels if not using cache
    if (forceRefresh || !isCacheValid('teams')) {
      console.log(chalk.cyan('\nFetching channels for each team...\n'));
      
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const teamName = team.displayName || 'Unknown Team';
        
        process.stdout.write(chalk.cyan(`Processing team ${i + 1} of ${teams.length}: ${teamName}...`));

        try {
          // Fetch channels with pagination
          let allChannels = [];
          let channelUrl = `${GRAPH_API_BASE}/teams/${team.id}/channels`;
          
          while (channelUrl) {
            const channelsResponse = await axios.get(channelUrl, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              timeout: 30000,
            });

            const channels = channelsResponse.data.value || [];
            allChannels = allChannels.concat(channels);
            
            // Check for next page
            channelUrl = channelsResponse.data['@odata.nextLink'] || null;
          }

          console.log(chalk.green(` ✓ (${allChannels.length} channels)`));

          // Save channels to cache
          saveChannelsToCache(team.id, allChannels);

          for (const channel of allChannels) {
            channelList.push({
              teamId: team.id,
              channelId: channel.id,
              teamName,
              channelName: channel.displayName || 'Unknown Channel',
            });
          }
        } catch (error) {
          console.log(chalk.yellow(` ⚠ Failed to fetch channels`));
        }
      }
    }

    if (channelList.length === 0) {
      console.log(chalk.yellow('\n⚠️  No channels found.\n'));
      return null;
    }

    console.log(chalk.green(`\n✓ Found ${channelList.length} channel(s) total\n`));

    // Display channels
    for (let i = 0; i < channelList.length; i++) {
      const item = channelList[i];
      console.log(chalk.green(`${i + 1}.`) + chalk.bold(` ${item.teamName} > ${item.channelName}`));
      console.log(chalk.gray(`   Team ID: ${item.teamId}`));
      console.log(chalk.gray(`   Channel ID: ${item.channelId}\n`));
    }

    // Get user selection
    console.log(chalk.bold('\nEnter the number of the channel you want to export (or 0 to cancel): '));
    
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('', (answer) => {
        rl.close();
        
        const selection = parseInt(answer, 10);
        
        if (selection === 0) {
          console.log(chalk.yellow('\nCancelled.\n'));
          resolve(null);
          return;
        }

        if (isNaN(selection) || selection < 1 || selection > channelList.length) {
          console.log(chalk.red(`\nInvalid selection. Please enter a number between 1 and ${channelList.length}.\n`));
          resolve(null);
          return;
        }

        const selected = channelList[selection - 1];
        console.log(chalk.green(`\n✓ Selected: ${selected.teamName} > ${selected.channelName}`));
        console.log(chalk.cyan(`Team ID: ${selected.teamId}`));
        console.log(chalk.cyan(`Channel ID: ${selected.channelId}\n`));
        
        resolve({
          teamId: selected.teamId,
          channelId: selected.channelId,
        });
      });
    });
  } catch (error) {
    spinner.fail('Failed to fetch teams');
    
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        console.error(chalk.red('\nPermission denied. Ensure you have Team.ReadBasic.All permission.\n'));
      } else {
        console.error(chalk.red(`\nAPI Error: ${error.response.data?.error?.message || error.message}\n`));
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error(chalk.red('\nRequest timed out. Please check your network connection.\n'));
    } else {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
    
    return null;
  }
}
