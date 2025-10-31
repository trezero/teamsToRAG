import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import readline from 'readline';
import { getAccessToken } from './auth.js';
import { fetchAndDisplayChats, fetchAndDisplayChannels } from './chatFinder.js';
import { getCacheStats, clearCache } from './cache.js';
import {
  fetchChatMessages,
  fetchChannelMessages,
  fetchChatMetadata,
  fetchChatMembers,
  fetchChannelMetadata,
} from './teamsClient.js';
import {
  generateRAGDocument,
  saveRAGDocument,
  exportFileExists,
  parseExistingExport,
  appendMessagesToExport,
} from './ragGenerator.js';
import path from 'path';

dotenv.config();

/**
 * Displays the main menu
 */
function displayMenu() {
  console.log(chalk.blue.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║   Teams to RAG Generator               ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════╝\n'));
  
  // Show cache status
  const stats = getCacheStats();
  if (stats.chats.count > 0 || stats.teams.count > 0) {
    console.log(chalk.gray('Cache Status:'));
    if (stats.chats.count > 0) {
      const cacheAge = stats.chats.lastSync ? `${Math.round((Date.now() - stats.chats.lastSync.getTime()) / (1000 * 60 * 60))}h ago` : 'unknown';
      const status = stats.chats.isValid ? chalk.green('✓ valid') : chalk.yellow('⚠ expired');
      console.log(chalk.gray(`  Chats: ${stats.chats.count} cached (${cacheAge}) ${status}`));
    }
    if (stats.teams.count > 0) {
      const cacheAge = stats.teams.lastSync ? `${Math.round((Date.now() - stats.teams.lastSync.getTime()) / (1000 * 60 * 60))}h ago` : 'unknown';
      const status = stats.teams.isValid ? chalk.green('✓ valid') : chalk.yellow('⚠ expired');
      console.log(chalk.gray(`  Teams: ${stats.teams.count} cached, ${stats.channels.count} channels (${cacheAge}) ${status}`));
    }
    console.log('');
  }
  
  console.log(chalk.bold('Please select an option:\n'));
  console.log(chalk.green('1.') + ' Find and export a chat (1:1 or group)');
  console.log(chalk.green('2.') + ' Find and export a channel');
  console.log(chalk.green('3.') + ' Generate from current .env settings');
  console.log(chalk.yellow('4.') + ' Refresh cache (force re-fetch from API)');
  console.log(chalk.yellow('5.') + ' Clear cache');
  console.log(chalk.red('6.') + ' Exit\n');
}

/**
 * Gets user menu choice
 * @returns {Promise<number>} User's choice (1-4)
 */
function getUserChoice() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.bold('Enter your choice [1-6]: '), (answer) => {
      rl.close();
      const choice = parseInt(answer, 10);
      resolve(choice);
    });
  });
}

/**
 * Authenticates and returns access token
 * @returns {Promise<string>} Access token
 */
async function authenticate() {
  const authMode = process.env.AUTH_MODE || 'delegated';
  console.log(chalk.gray(`\nAuth mode: ${authMode}\n`));

  let authSpinner;
  let accessToken;

  if (authMode === 'delegated') {
    authSpinner = ora('Requesting device code...').start();
    try {
      accessToken = await getAccessToken((deviceCodeInfo) => {
        authSpinner.stop();
        console.log(chalk.yellow.bold('\n🔐 User Authentication Required\n'));
        console.log(chalk.white(`1. Open your browser to: ${chalk.cyan(deviceCodeInfo.verificationUrl)}`));
        console.log(chalk.white(`2. Enter this code: ${chalk.green.bold(deviceCodeInfo.userCode)}\n`));
        authSpinner = ora('Waiting for authentication...').start();
      });
      authSpinner.succeed('Authentication successful');
      return accessToken;
    } catch (error) {
      authSpinner.fail('Failed to authenticate');
      throw error;
    }
  } else {
    authSpinner = ora('Acquiring access token...').start();
    try {
      accessToken = await getAccessToken();
      authSpinner.succeed('Access token acquired');
      return accessToken;
    } catch (error) {
      authSpinner.fail('Failed to acquire access token');
      throw error;
    }
  }
}

/**
 * Generates RAG document for a chat
 * @param {string} accessToken - OAuth2 access token
 * @param {string} chatId - Teams chat ID
 */
async function generateForChat(accessToken, chatId) {
  const maxMessages = process.env.MAX_MESSAGES ? parseInt(process.env.MAX_MESSAGES) : null;
  const outputDir = process.env.OUTPUT_DIR || './output';
  const includeMetadata = process.env.INCLUDE_METADATA !== 'false';
  const groupByDate = process.env.GROUP_BY_DATE !== 'false';

  // Fetch metadata
  let metadata = {};
  let members = [];
  let sourceName = null;

  const metadataSpinner = ora('Fetching chat metadata...').start();
  try {
    [metadata, members] = await Promise.all([
      fetchChatMetadata(accessToken, chatId),
      fetchChatMembers(accessToken, chatId),
    ]);
    metadataSpinner.succeed(`Chat metadata fetched (${members.length} members)`);
    sourceName = metadata.topic || null;
  } catch (error) {
    metadataSpinner.warn('Could not fetch complete metadata');
  }

  // Determine output path
  let outputPath;
  const sanitizeForFilename = (str) => {
    return str
      .replace(/[:<>"\/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  let filename;
  if (sourceName) {
    const nameSafe = sanitizeForFilename(sourceName);
    filename = `chat-${nameSafe}.md`;
  } else {
    const chatSafe = sanitizeForFilename(chatId.substring(0, 8));
    filename = `chat-${chatSafe}.md`;
  }
  outputPath = path.join(outputDir, filename);

  console.log(chalk.gray(`Output: ${outputPath}\n`));

  // Check for existing export
  let existingExport = null;
  let sinceDate = null;
  let isIncremental = false;

  if (exportFileExists(outputPath)) {
    existingExport = parseExistingExport(outputPath);
    if (existingExport && existingExport.lastRun) {
      isIncremental = true;
      sinceDate = existingExport.lastRun;
      console.log(chalk.cyan(`📄 Found existing export from ${existingExport.lastRun.toLocaleString()}`));
      console.log(chalk.cyan(`   Fetching new messages...\n`));
    }
  }

  // Fetch messages
  const messagesSpinner = ora(`Fetching ${isIncremental ? 'new' : 'all'} chat messages...`).start();
  let messages;
  try {
    messages = await fetchChatMessages(accessToken, chatId, maxMessages, sinceDate);
    messagesSpinner.succeed(`Fetched ${messages.length} ${isIncremental ? 'new' : 'all'} messages`);
  } catch (error) {
    messagesSpinner.fail('Failed to fetch messages');
    throw error;
  }

  if (messages.length === 0 && !isIncremental) {
    console.log(chalk.yellow('\n⚠️  No messages found in this chat.\n'));
    return;
  }

  if (messages.length === 0 && isIncremental) {
    console.log(chalk.green('\n✅ No new messages since last run. Export is up to date!\n'));
    return;
  }

  // Generate or update document
  const generateSpinner = ora(isIncremental ? 'Appending new messages...' : 'Generating RAG document...').start();
  try {
    const memberMap = {};
    members.forEach((member) => {
      if (member.userId) {
        memberMap[member.userId] = member.displayName || 'Unknown User';
      }
    });

    if (isIncremental) {
      const appendedCount = appendMessagesToExport(
        outputPath,
        messages,
        memberMap,
        includeMetadata,
        groupByDate
      );
      generateSpinner.succeed(`Appended ${appendedCount} new messages`);
    } else {
      const document = generateRAGDocument(messages, metadata, members, {
        includeMetadata,
        groupByDate,
        format: 'markdown',
        chatId,
      });
      saveRAGDocument(document, outputPath);
      generateSpinner.succeed('RAG document generated');
    }
  } catch (error) {
    generateSpinner.fail(isIncremental ? 'Failed to append messages' : 'Failed to generate document');
    throw error;
  }

  // Success
  console.log(chalk.green.bold('\n✅ Success!\n'));
  if (isIncremental) {
    console.log(chalk.white(`Updated existing export: ${chalk.cyan(outputPath)}`));
    console.log(chalk.white(`Added ${chalk.green(messages.length)} new messages\n`));
  } else {
    console.log(chalk.white(`Created new export: ${chalk.cyan(outputPath)}`));
    console.log(chalk.white(`Total messages: ${chalk.green(messages.length)}\n`));
  }
}

/**
 * Generates RAG document for a channel
 * @param {string} accessToken - OAuth2 access token
 * @param {string} teamId - Teams team ID
 * @param {string} channelId - Teams channel ID
 */
async function generateForChannel(accessToken, teamId, channelId) {
  const maxMessages = process.env.MAX_MESSAGES ? parseInt(process.env.MAX_MESSAGES) : null;
  const outputDir = process.env.OUTPUT_DIR || './output';
  const includeMetadata = process.env.INCLUDE_METADATA !== 'false';
  const groupByDate = process.env.GROUP_BY_DATE !== 'false';

  // Fetch metadata
  let sourceName = null;
  const metadataSpinner = ora('Fetching channel metadata...').start();
  try {
    const channelMetadata = await fetchChannelMetadata(accessToken, teamId, channelId);
    metadataSpinner.succeed('Channel metadata fetched');
    sourceName = channelMetadata.displayName || null;
  } catch (error) {
    metadataSpinner.warn('Could not fetch channel metadata');
  }

  // Determine output path
  const sanitizeForFilename = (str) => {
    return str
      .replace(/[:<>"\/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  let filename;
  if (sourceName) {
    const nameSafe = sanitizeForFilename(sourceName);
    filename = `channel-${nameSafe}.md`;
  } else {
    const teamSafe = sanitizeForFilename(teamId.substring(0, 8));
    const channelSafe = sanitizeForFilename(channelId.substring(0, 8));
    filename = `channel-${teamSafe}-${channelSafe}.md`;
  }
  const outputPath = path.join(outputDir, filename);

  console.log(chalk.gray(`Output: ${outputPath}\n`));

  // Fetch messages
  const messagesSpinner = ora('Fetching channel messages...').start();
  let messages;
  try {
    messages = await fetchChannelMessages(accessToken, teamId, channelId, maxMessages);
    messagesSpinner.succeed(`Fetched ${messages.length} messages`);
  } catch (error) {
    messagesSpinner.fail('Failed to fetch messages');
    throw error;
  }

  if (messages.length === 0) {
    console.log(chalk.yellow('\n⚠️  No messages found in this channel.\n'));
    return;
  }

  // Generate document
  const generateSpinner = ora('Generating RAG document...').start();
  try {
    const document = generateRAGDocument(messages, {}, [], {
      includeMetadata,
      groupByDate,
      format: 'markdown',
      teamId,
      channelId,
    });
    saveRAGDocument(document, outputPath);
    generateSpinner.succeed('RAG document generated');
  } catch (error) {
    generateSpinner.fail('Failed to generate document');
    throw error;
  }

  // Success
  console.log(chalk.green.bold('\n✅ Success!\n'));
  console.log(chalk.white(`Created new export: ${chalk.cyan(outputPath)}`));
  console.log(chalk.white(`Total messages: ${chalk.green(messages.length)}\n`));
}

/**
 * Generates from current .env settings
 */
async function generateFromEnv(accessToken) {
  const chatId = process.env.TEAMS_CHAT_ID;
  const teamId = process.env.TEAMS_TEAM_ID;
  const channelId = process.env.TEAMS_CHANNEL_ID;

  const isChannel = !!(teamId && channelId);
  const isChat = !!chatId;

  if (!isChannel && !isChat) {
    console.error(chalk.red('\nError: Either TEAMS_CHAT_ID or (TEAMS_TEAM_ID + TEAMS_CHANNEL_ID) must be set in .env\n'));
    return;
  }

  if (isChannel && !channelId) {
    console.error(chalk.red('\nError: Both TEAMS_TEAM_ID and TEAMS_CHANNEL_ID are required for channel messages.\n'));
    return;
  }

  if (isChannel && isChat) {
    console.error(chalk.red('\nError: Cannot specify both chat ID and team/channel IDs. Choose one.\n'));
    return;
  }

  if (isChat) {
    await generateForChat(accessToken, chatId);
  } else {
    await generateForChannel(accessToken, teamId, channelId);
  }
}

/**
 * Main menu loop
 */
export async function runInteractiveMenu() {
  try {
    displayMenu();
    const choice = await getUserChoice();

    switch (choice) {
      case 1: {
        // Find and export a chat
        console.log('');
        const accessToken = await authenticate();
        const chatId = await fetchAndDisplayChats(accessToken);
        
        if (chatId) {
          console.log(chalk.cyan.bold('Starting chat export...\n'));
          console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
          await generateForChat(accessToken, chatId);
        }
        break;
      }

      case 2: {
        // Find and export a channel
        console.log('');
        const accessToken = await authenticate();
        const result = await fetchAndDisplayChannels(accessToken);
        
        if (result) {
          console.log(chalk.cyan.bold('Starting channel export...\n'));
          console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
          await generateForChannel(accessToken, result.teamId, result.channelId);
        }
        break;
      }

      case 3: {
        // Generate from .env
        console.log('');
        const accessToken = await authenticate();
        await generateFromEnv(accessToken);
        break;
      }

      case 4: {
        // Refresh cache
        console.log('');
        const accessToken = await authenticate();
        console.log(chalk.cyan('\nRefreshing cache from API...\n'));
        
        // Ask which cache to refresh
        console.log(chalk.bold('What would you like to refresh?\n'));
        console.log(chalk.green('1.') + ' Chats only');
        console.log(chalk.green('2.') + ' Teams and channels only');
        console.log(chalk.green('3.') + ' Both\n');
        
        const refreshChoice = await getUserChoice();
        
        if (refreshChoice === 1 || refreshChoice === 3) {
          await fetchAndDisplayChats(accessToken, true);
        }
        if (refreshChoice === 2 || refreshChoice === 3) {
          await fetchAndDisplayChannels(accessToken, true);
        }
        
        console.log(chalk.green('\n✓ Cache refreshed!\n'));
        break;
      }

      case 5: {
        // Clear cache
        console.log('');
        const stats = getCacheStats();
        console.log(chalk.yellow('\n⚠️  This will clear all cached data:\n'));
        console.log(chalk.white(`  - ${stats.chats.count} chats`));
        console.log(chalk.white(`  - ${stats.teams.count} teams`));
        console.log(chalk.white(`  - ${stats.channels.count} channels\n`));
        console.log(chalk.bold('Are you sure? (y/N): '));
        
        const confirm = await new Promise((resolve) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question('', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
          });
        });
        
        if (confirm) {
          clearCache();
          console.log(chalk.green('\n✓ Cache cleared!\n'));
        } else {
          console.log(chalk.yellow('\nCancelled.\n'));
        }
        break;
      }

      case 6: {
        // Exit
        console.log(chalk.yellow('\nExiting...\n'));
        process.exit(0);
      }

      default: {
        console.log(chalk.red('\nInvalid choice. Please select 1-6.\n'));
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}
