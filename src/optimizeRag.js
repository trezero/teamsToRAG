#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import { runCLI } from './ragOptimizer.js';
import path from 'path';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('optimize-rag')
  .description('Optimize Teams chat exports for RAG using Claude AI')
  .version('1.0.0')
  .argument('<input>', 'Path to the Teams export markdown file')
  .option('-o, --output <dir>', 'Output directory', './output/rag')
  .option('-k, --api-key <key>', 'Anthropic API key (or set ANTHROPIC_API_KEY env var)')
  .option('-m, --model <model>', 'Claude model to use', 'claude-3-5-sonnet-20241022')
  .option('-f, --format <format>', 'Output format: structured or semantic', 'structured')
  .option('--no-topics', 'Exclude topics extraction')
  .option('--no-decisions', 'Exclude decisions extraction')
  .option('--no-action-items', 'Exclude action items extraction')
  .option('--no-summary', 'Exclude summary generation')
  .option('-c, --chunk-size <size>', 'Maximum chunk size in characters', '100000')
  .action(async (input, options) => {
    const spinner = ora('Initializing RAG optimizer...').start();

    try {
      // Validate API key
      const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        spinner.fail();
        console.error(chalk.red('\n✗ Error: ANTHROPIC_API_KEY is required'));
        console.log(chalk.yellow('\nSet it via environment variable or use --api-key flag'));
        console.log(chalk.gray('\nExample:'));
        console.log(chalk.gray('  export ANTHROPIC_API_KEY=your-key-here'));
        console.log(chalk.gray('  npm run optimize -- input.md'));
        process.exit(1);
      }

      spinner.text = 'Processing with Claude AI...';

      const optimizeOptions = {
        apiKey,
        model: options.model,
        chunkSize: parseInt(options.chunkSize),
        outputFormat: options.format,
        includeTopics: options.topics !== false,
        includeDecisions: options.decisions !== false,
        includeActionItems: options.actionItems !== false,
        includeSummary: options.summary !== false,
      };

      // Resolve paths
      const inputPath = path.resolve(input);
      const outputDir = path.resolve(options.output);

      spinner.stop();

      console.log(chalk.blue('\n📊 RAG Optimization Configuration:'));
      console.log(chalk.gray('  Input:'), inputPath);
      console.log(chalk.gray('  Output:'), outputDir);
      console.log(chalk.gray('  Model:'), options.model);
      console.log(chalk.gray('  Format:'), options.format);
      console.log(chalk.gray('  Topics:'), optimizeOptions.includeTopics ? '✓' : '✗');
      console.log(chalk.gray('  Decisions:'), optimizeOptions.includeDecisions ? '✓' : '✗');
      console.log(chalk.gray('  Action Items:'), optimizeOptions.includeActionItems ? '✓' : '✗');
      console.log(chalk.gray('  Summary:'), optimizeOptions.includeSummary ? '✓' : '✗');
      console.log();

      const result = await runCLI(inputPath, outputDir, optimizeOptions);

      console.log(chalk.green('\n✓ Success! RAG optimization complete.'));
      console.log(chalk.blue('\n📁 Generated Files:'));
      Object.entries(result.outputFiles).forEach(([key, file]) => {
        console.log(chalk.gray(`  ${key}:`), chalk.cyan(file));
      });

      console.log(chalk.blue('\n📈 Statistics:'));
      console.log(chalk.gray('  Original messages:'), result.metadata.totalMessages);
      console.log(chalk.gray('  Chunks processed:'), result.chunksProcessed);

      if (result.metadata.topic) {
        console.log(chalk.gray('  Topic:'), result.metadata.topic);
      }

      console.log(chalk.green('\n✨ RAG-optimized documents are ready for embedding and retrieval!'));

    } catch (error) {
      spinner.fail();
      console.error(chalk.red('\n✗ Error:'), error.message);

      if (error.response?.data) {
        console.error(chalk.gray('\nAPI Response:'), error.response.data);
      }

      process.exit(1);
    }
  });

// Parse arguments
program.parse();
