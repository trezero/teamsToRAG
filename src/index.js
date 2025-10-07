#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import path from 'path';
import { getAccessToken } from './auth.js';
import {
  fetchChatMessages,
  fetchChannelMessages,
  fetchChatMetadata,
  fetchChatMembers,
  fetchTeamMetadata,
  fetchChannelMetadata,
} from './teamsClient.js';
import {
  generateRAGDocument,
  saveRAGDocument,
  generateStatistics,
  exportFileExists,
  parseExistingExport,
  appendMessagesToExport,
} from './ragGenerator.js';

dotenv.config();

const program = new Command();

program
  .name('teams-to-rag')
  .description('Generate high-quality RAG documents from Microsoft Teams chats')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate RAG document from a Teams chat or channel')
  .option('-c, --chat-id <chatId>', 'Teams chat ID (for 1-on-1 or group chats)')
  .option('-t, --team-id <teamId>', 'Teams team ID (for channel messages)')
  .option('-ch, --channel-id <channelId>', 'Teams channel ID (for channel messages)')
  .option('-o, --output <path>', 'Output file path')
  .option('-m, --max-messages <number>', 'Maximum messages to fetch', parseInt)
  .option('--no-metadata', 'Exclude metadata from document')
  .option('--no-group-by-date', 'Do not group messages by date')
  .option('--stats', 'Display chat statistics')
  .action(async (options) => {
    try {
      // Get configuration
      const chatId = options.chatId || process.env.TEAMS_CHAT_ID;
      const teamId = options.teamId || process.env.TEAMS_TEAM_ID;
      const channelId = options.channelId || process.env.TEAMS_CHANNEL_ID;
      const maxMessages = options.maxMessages || (process.env.MAX_MESSAGES ? parseInt(process.env.MAX_MESSAGES) : null);
      const outputDir = process.env.OUTPUT_DIR || './output';
      const includeMetadata = options.metadata !== false && process.env.INCLUDE_METADATA !== 'false';
      const groupByDate = options.groupByDate !== false && process.env.GROUP_BY_DATE !== 'false';

      // Determine if we're fetching from chat or channel
      const isChannel = !!(teamId && channelId);
      const isChat = !!chatId;

      if (!isChannel && !isChat) {
        console.error(chalk.red('Error: Either chat ID or (team ID + channel ID) is required.\n'));
        console.error(chalk.white('For chats: --chat-id or TEAMS_CHAT_ID in .env'));
        console.error(chalk.white('For channels: --team-id and --channel-id or TEAMS_TEAM_ID and TEAMS_CHANNEL_ID in .env\n'));
        process.exit(1);
      }

      if (isChannel && !channelId) {
        console.error(chalk.red('Error: Both team ID and channel ID are required for channel messages.\n'));
        process.exit(1);
      }

      if (isChannel && isChat) {
        console.error(chalk.red('Error: Cannot specify both chat ID and team/channel IDs. Choose one.\n'));
        process.exit(1);
      }

      const authMode = process.env.AUTH_MODE || 'application';
      console.log(chalk.blue.bold('\n🚀 Teams to RAG Generator\n'));
      console.log(chalk.gray(`Auth mode: ${authMode}\n`));

      // Step 1: Authenticate
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
        } catch (error) {
          authSpinner.fail('Failed to authenticate');
          console.error(chalk.red(`\n${error.message}\n`));
          process.exit(1);
        }
      } else {
        authSpinner = ora('Acquiring access token...').start();
        try {
          accessToken = await getAccessToken();
          authSpinner.succeed('Access token acquired');
        } catch (error) {
          authSpinner.fail('Failed to acquire access token');
          console.error(chalk.red(`\n${error.message}\n`));
          process.exit(1);
        }
      }

      // Step 2: Fetch metadata to get chat/channel name for filename
      let metadata = {};
      let members = [];
      let sourceName = null;

      if (isChat) {
        const metadataSpinner = ora('Fetching chat metadata...').start();
        try {
          [metadata, members] = await Promise.all([
            fetchChatMetadata(accessToken, chatId),
            fetchChatMembers(accessToken, chatId),
          ]);
          metadataSpinner.succeed(`Chat metadata fetched (${members.length} members)`);

          // Extract chat name from metadata
          sourceName = metadata.topic || null;
        } catch (error) {
          metadataSpinner.warn('Could not fetch complete metadata');
          metadata = {};
          members = [];
        }
      } else if (isChannel) {
        const metadataSpinner = ora('Fetching channel metadata...').start();
        try {
          const channelMetadata = await fetchChannelMetadata(accessToken, teamId, channelId);
          metadataSpinner.succeed('Channel metadata fetched');

          // Extract channel name from metadata
          sourceName = channelMetadata.displayName || null;
        } catch (error) {
          metadataSpinner.warn('Could not fetch channel metadata');
        }
      }

      // Step 3: Determine output path with consistent naming for incremental updates
      let outputPath;
      if (options.output) {
        outputPath = options.output;
      } else {
        // Sanitize name to remove invalid filename characters (: < > " / \ | ? *)
        const sanitizeForFilename = (str) => {
          return str
            .replace(/[:<>"\/\\|?*]/g, '-')  // Replace invalid chars with dash
            .replace(/\s+/g, '-')              // Replace spaces with dash
            .replace(/-+/g, '-')               // Replace multiple dashes with single
            .replace(/^-|-$/g, '');            // Remove leading/trailing dashes
        };

        let filename;
        if (sourceName) {
          // Use the chat/channel name if available
          const nameSafe = sanitizeForFilename(sourceName);
          const prefix = isChannel ? 'channel' : 'chat';
          filename = `${prefix}-${nameSafe}.md`;
        } else {
          // Fallback to using IDs if name not available
          if (isChannel) {
            const teamSafe = sanitizeForFilename(teamId.substring(0, 8));
            const channelSafe = sanitizeForFilename(channelId.substring(0, 8));
            filename = `channel-${teamSafe}-${channelSafe}.md`;
          } else {
            const chatSafe = sanitizeForFilename(chatId.substring(0, 8));
            filename = `chat-${chatSafe}.md`;
          }
        }
        outputPath = path.join(outputDir, filename);
      }

      console.log(chalk.gray(`Output: ${outputPath}\n`));

      // Step 4: Check for existing export (incremental mode)
      let existingExport = null;
      let sinceDate = null;
      let isIncremental = false;

      if (exportFileExists(outputPath)) {
        existingExport = parseExistingExport(outputPath);
        if (existingExport && existingExport.lastRun) {
          isIncremental = true;
          sinceDate = existingExport.lastRun;
          console.log(chalk.cyan(`📄 Found existing export from ${existingExport.lastRun.toLocaleString()}`));
          console.log(chalk.cyan(`   Fetching new messages (client-side filtering)...\n`));
        }
      }

      // Step 4: Fetch messages
      let messages;
      const fetchType = isIncremental ? 'new' : 'all';

      if (isChannel) {
        const messagesSpinner = ora(`Fetching ${fetchType} channel messages...`).start();
        try {
          messages = await fetchChannelMessages(accessToken, teamId, channelId, maxMessages, sinceDate);
          messagesSpinner.succeed(`Fetched ${messages.length} ${fetchType} messages`);
        } catch (error) {
          messagesSpinner.fail('Failed to fetch messages');
          console.error(chalk.red(`\n${error.message}\n`));
          process.exit(1);
        }
      } else {
        const messagesSpinner = ora(`Fetching ${fetchType} chat messages...`).start();
        try {
          messages = await fetchChatMessages(accessToken, chatId, maxMessages, sinceDate);
          messagesSpinner.succeed(`Fetched ${messages.length} ${fetchType} messages`);
        } catch (error) {
          messagesSpinner.fail('Failed to fetch messages');
          console.error(chalk.red(`\n${error.message}\n`));
          process.exit(1);
        }
      }

      if (messages.length === 0 && !isIncremental) {
        console.log(chalk.yellow(`\n⚠️  No messages found in this ${isChannel ? 'channel' : 'chat'}.\n`));
        process.exit(0);
      }

      if (messages.length === 0 && isIncremental) {
        console.log(chalk.green(`\n✅ No new messages since last run. Export is up to date!\n`));
        process.exit(0);
      }

      // Step 5: Generate or update RAG document
      const generateSpinner = ora(isIncremental ? 'Appending new messages...' : 'Generating RAG document...').start();
      try {
        // Create member lookup for appending
        const memberMap = {};
        members.forEach((member) => {
          if (member.userId) {
            memberMap[member.userId] = member.displayName || 'Unknown User';
          }
        });

        if (isIncremental) {
          // Append to existing file (both chats and channels)
          const appendedCount = appendMessagesToExport(
            outputPath,
            messages,
            memberMap,
            includeMetadata,
            groupByDate
          );
          generateSpinner.succeed(`Appended ${appendedCount} new messages`);
        } else {
          // Generate new document
          const document = generateRAGDocument(messages, metadata, members, {
            includeMetadata,
            groupByDate,
            format: 'markdown',
            chatId,
            teamId,
            channelId,
          });

          saveRAGDocument(document, outputPath);
          generateSpinner.succeed('RAG document generated');
        }
      } catch (error) {
        generateSpinner.fail(isIncremental ? 'Failed to append messages' : 'Failed to generate document');
        console.error(chalk.red(`\n${error.message}\n`));
        process.exit(1);
      }

      // Step 5: Display statistics (if requested)
      if (options.stats) {
        console.log(chalk.blue.bold('\n📊 Chat Statistics\n'));
        const stats = generateStatistics(messages, members);

        console.log(chalk.white(`Total Messages: ${stats.totalMessages}`));
        console.log(chalk.white(`Participants: ${stats.totalParticipants}`));
        console.log(
          chalk.white(
            `Date Range: ${stats.dateRange.start?.toLocaleDateString()} - ${stats.dateRange.end?.toLocaleDateString()}`
          )
        );

        console.log(chalk.blue('\nMessages by User:'));
        Object.entries(stats.messagesByUser)
          .sort((a, b) => b[1] - a[1])
          .forEach(([user, count]) => {
            console.log(chalk.white(`  ${user}: ${count}`));
          });
      }

      // Success
      console.log(chalk.green.bold(`\n✅ Success!\n`));
      if (isIncremental) {
        console.log(chalk.white(`Updated existing export: ${chalk.cyan(outputPath)}`));
        console.log(chalk.white(`Added ${chalk.green(messages.length)} new messages\n`));
      } else {
        console.log(chalk.white(`Created new export: ${chalk.cyan(outputPath)}`));
        console.log(chalk.white(`Total messages: ${chalk.green(messages.length)}\n`));
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Unexpected error: ${error.message}\n`));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate configuration and authentication')
  .action(async () => {
    console.log(chalk.blue.bold('\n🔍 Validating Configuration\n'));

    const authMode = process.env.AUTH_MODE || 'application';
    console.log(chalk.gray(`Auth mode: ${authMode}\n`));

    // Check environment variables based on auth mode
    let requiredVars = ['TENANT_ID', 'CLIENT_ID'];
    if (authMode === 'application') {
      requiredVars.push('CLIENT_SECRET');
    }

    const missing = requiredVars.filter((v) => !process.env[v]);

    if (missing.length > 0) {
      console.log(chalk.red(`❌ Missing environment variables: ${missing.join(', ')}\n`));
      process.exit(1);
    }

    console.log(chalk.green('✅ All required environment variables present'));

    // Test authentication
    let authSpinner;

    if (authMode === 'delegated') {
      authSpinner = ora('Requesting device code...').start();
      try {
        await getAccessToken((deviceCodeInfo) => {
          authSpinner.stop();
          console.log(chalk.yellow.bold('\n🔐 User Authentication Required\n'));
          console.log(chalk.white(`1. Open your browser to: ${chalk.cyan(deviceCodeInfo.verificationUrl)}`));
          console.log(chalk.white(`2. Enter this code: ${chalk.green.bold(deviceCodeInfo.userCode)}\n`));
          authSpinner = ora('Waiting for authentication...').start();
        });
        authSpinner.succeed('Authentication successful');
        console.log(chalk.green.bold('\n✅ Configuration is valid!\n'));
      } catch (error) {
        authSpinner.fail('Authentication failed');
        console.error(chalk.red(`\n${error.message}\n`));
        process.exit(1);
      }
    } else {
      authSpinner = ora('Testing authentication...').start();
      try {
        await getAccessToken();
        authSpinner.succeed('Authentication successful');
        console.log(chalk.green.bold('\n✅ Configuration is valid!\n'));
      } catch (error) {
        authSpinner.fail('Authentication failed');
        console.error(chalk.red(`\n${error.message}\n`));
        process.exit(1);
      }
    }
  });

program.parse();
