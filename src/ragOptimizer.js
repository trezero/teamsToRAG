import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * RAG Optimizer - Uses Claude AI to transform Teams chat exports into RAG-optimized documents
 */

const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const MAX_CHUNK_SIZE = 100000; // Characters per chunk to send to Claude

/**
 * Main function to optimize a Teams export for RAG
 * @param {string} inputPath - Path to the Teams export markdown file
 * @param {string} outputDir - Directory to save RAG-optimized output
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Results of the optimization
 */
export async function optimizeForRAG(inputPath, outputDir, options = {}) {
  const {
    apiKey = process.env.ANTHROPIC_API_KEY,
    model = DEFAULT_MODEL,
    chunkSize = MAX_CHUNK_SIZE,
    outputFormat = 'structured', // 'structured' or 'semantic'
    includeTopics = true,
    includeDecisions = true,
    includeActionItems = true,
    includeSummary = true,
  } = options;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // Read the input file
  const content = fs.readFileSync(inputPath, 'utf8');

  // Extract metadata from the file
  const metadata = extractMetadata(content);

  // Split content into processable chunks
  const chunks = splitIntoChunks(content, chunkSize);

  // Process each chunk with Claude
  const processedChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
    const processed = await processChunkWithClaude(
      chunks[i],
      apiKey,
      model,
      {
        chunkIndex: i,
        totalChunks: chunks.length,
        metadata,
        includeTopics,
        includeDecisions,
        includeActionItems,
      }
    );
    processedChunks.push(processed);
  }

  // Generate final output
  const outputFiles = {};

  if (includeSummary) {
    const summary = await generateSummary(processedChunks, metadata, apiKey, model);
    outputFiles.summary = path.join(outputDir, `${metadata.fileBaseName}_summary.md`);
    saveFile(outputFiles.summary, summary);
  }

  if (outputFormat === 'structured') {
    // Create structured output with separate sections
    const structured = generateStructuredOutput(processedChunks, metadata);
    outputFiles.main = path.join(outputDir, `${metadata.fileBaseName}_rag_structured.md`);
    saveFile(outputFiles.main, structured.main);

    if (includeTopics && structured.topics) {
      outputFiles.topics = path.join(outputDir, `${metadata.fileBaseName}_topics.md`);
      saveFile(outputFiles.topics, structured.topics);
    }

    if (includeDecisions && structured.decisions) {
      outputFiles.decisions = path.join(outputDir, `${metadata.fileBaseName}_decisions.md`);
      saveFile(outputFiles.decisions, structured.decisions);
    }

    if (includeActionItems && structured.actionItems) {
      outputFiles.actionItems = path.join(outputDir, `${metadata.fileBaseName}_action_items.md`);
      saveFile(outputFiles.actionItems, structured.actionItems);
    }
  } else {
    // Create semantic chunks for RAG embedding
    const semantic = generateSemanticChunks(processedChunks, metadata);
    outputFiles.main = path.join(outputDir, `${metadata.fileBaseName}_rag_semantic.jsonl`);
    saveFile(outputFiles.main, semantic);
  }

  return {
    inputFile: inputPath,
    outputFiles,
    metadata,
    chunksProcessed: chunks.length,
  };
}

/**
 * Extract metadata from the Teams export file
 */
function extractMetadata(content) {
  const lines = content.split('\n');
  const metadata = {
    topic: null,
    chatType: null,
    source: null,
    totalMessages: 0,
    created: null,
    lastRun: null,
    fileBaseName: 'chat',
  };

  for (const line of lines) {
    const topicMatch = line.match(/\*\*Topic:\*\*\s+(.+)/);
    if (topicMatch) metadata.topic = topicMatch[1].trim();

    const chatTypeMatch = line.match(/\*\*Chat Type:\*\*\s+(.+)/);
    if (chatTypeMatch) metadata.chatType = chatTypeMatch[1].trim();

    const sourceMatch = line.match(/\*\*Source:\*\*\s+(.+)/);
    if (sourceMatch) metadata.source = sourceMatch[1].trim();

    const messagesMatch = line.match(/\*\*Total Messages:\*\*\s+(\d+)/);
    if (messagesMatch) metadata.totalMessages = parseInt(messagesMatch[1]);

    const createdMatch = line.match(/\*\*Created:\*\*\s+(.+)/);
    if (createdMatch) metadata.created = createdMatch[1].trim();

    const lastRunMatch = line.match(/\*\*Last Run:\*\*\s+(.+)/);
    if (lastRunMatch) metadata.lastRun = lastRunMatch[1].trim();

    if (line.trim() === '---') break;
  }

  if (metadata.topic) {
    metadata.fileBaseName = metadata.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  return metadata;
}

/**
 * Split content into manageable chunks for Claude processing
 */
function splitIntoChunks(content, maxChunkSize) {
  // Split by date sections to maintain context
  const dateSectionRegex = /^## \d+\/\d+\/\d+$/gm;
  const sections = [];
  let currentPos = 0;
  let match;

  const regex = new RegExp(dateSectionRegex);
  const matches = [];

  while ((match = regex.exec(content)) !== null) {
    matches.push({ index: match.index, text: match[0] });
  }

  // Extract sections
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
    sections.push(content.substring(start, end));
  }

  // Combine sections into chunks that don't exceed maxChunkSize
  const chunks = [];
  let currentChunk = '';

  for (const section of sections) {
    if (currentChunk.length + section.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = section;
    } else {
      currentChunk += section;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [content];
}

/**
 * Process a chunk with Claude AI
 */
async function processChunkWithClaude(chunk, apiKey, model, context) {
  const prompt = buildProcessingPrompt(chunk, context);

  try {
    const response = await axios.post(
      CLAUDE_API_ENDPOINT,
      {
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const result = response.data.content[0].text;
    return parseClaudeResponse(result, context);
  } catch (error) {
    console.error('Error processing with Claude:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Build the prompt for Claude to process the chunk
 */
function buildProcessingPrompt(chunk, context) {
  return `You are analyzing a Microsoft Teams chat export to optimize it for Retrieval-Augmented Generation (RAG) systems.

Your task is to process this chat segment and extract structured information that will be useful for semantic search and retrieval.

${context.metadata.topic ? `Chat Topic: ${context.metadata.topic}` : ''}
${context.totalChunks > 1 ? `Processing chunk ${context.chunkIndex + 1} of ${context.totalChunks}` : ''}

Please analyze the following chat messages and provide:

1. **Key Topics**: Extract and list the main topics or themes discussed (as tags/keywords)
2. **Technical Decisions**: Identify any technical decisions, solutions, or conclusions
3. **Action Items**: Extract any tasks, TODOs, or action items mentioned
4. **Context Summaries**: For each major topic shift or conversation thread, provide a brief summary
5. **Important Code/Commands**: Extract any code snippets, commands, or technical details
6. **People & Roles**: Identify key participants and their roles in the discussion

Format your response as JSON with this structure:
\`\`\`json
{
  "topics": ["topic1", "topic2", ...],
  "decisions": [
    {
      "summary": "brief decision summary",
      "details": "fuller context",
      "participants": ["person1", "person2"]
    }
  ],
  "actionItems": [
    {
      "task": "what needs to be done",
      "owner": "person responsible (if mentioned)",
      "context": "surrounding context"
    }
  ],
  "contextSummaries": [
    {
      "timeframe": "date or time range",
      "topic": "main topic",
      "summary": "what was discussed",
      "keyPoints": ["point1", "point2"]
    }
  ],
  "technicalDetails": [
    {
      "type": "code|command|configuration|error",
      "content": "the actual technical content",
      "context": "what it relates to"
    }
  ],
  "participants": [
    {
      "name": "person name",
      "role": "their role or contribution (inferred from context)"
    }
  ]
}
\`\`\`

Here is the chat content to analyze:

${chunk}

Provide only the JSON response, no additional commentary.`;
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(response, context) {
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                    response.match(/```\s*([\s\S]*?)\s*```/);

  const jsonString = jsonMatch ? jsonMatch[1] : response;

  try {
    const parsed = JSON.parse(jsonString);
    return {
      ...parsed,
      chunkIndex: context.chunkIndex,
    };
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', error.message);
    console.error('Response:', response.substring(0, 500));
    throw new Error('Failed to parse Claude response');
  }
}

/**
 * Generate overall summary using Claude
 */
async function generateSummary(processedChunks, metadata, apiKey, model) {
  const combinedData = {
    topics: new Set(),
    decisions: [],
    actionItems: [],
    participants: new Set(),
  };

  // Combine all chunks
  processedChunks.forEach((chunk) => {
    chunk.topics?.forEach((t) => combinedData.topics.add(t));
    combinedData.decisions.push(...(chunk.decisions || []));
    combinedData.actionItems.push(...(chunk.actionItems || []));
    chunk.participants?.forEach((p) => combinedData.participants.add(p.name));
  });

  const summaryPrompt = `Create a high-level executive summary of this Teams chat conversation.

Chat: ${metadata.topic || 'Team Discussion'}
Total Messages: ${metadata.totalMessages}
Date Range: ${metadata.created} to ${metadata.lastRun}

Topics Discussed: ${Array.from(combinedData.topics).join(', ')}
Participants: ${Array.from(combinedData.participants).join(', ')}
Total Decisions Made: ${combinedData.decisions.length}
Total Action Items: ${combinedData.actionItems.length}

Provide a 2-3 paragraph summary that captures:
- The main purpose and outcomes of this conversation
- Key technical decisions or conclusions
- Current status and next steps

Use clear, professional language suitable for a technical audience.`;

  try {
    const response = await axios.post(
      CLAUDE_API_ENDPOINT,
      {
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: summaryPrompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const summary = response.data.content[0].text;

    return `# Summary: ${metadata.topic || 'Teams Chat'}

${summary}

---

**Metadata:**
- Total Messages: ${metadata.totalMessages}
- Created: ${metadata.created}
- Last Updated: ${metadata.lastRun}
- Participants: ${Array.from(combinedData.participants).join(', ')}
- Topics: ${Array.from(combinedData.topics).join(', ')}
`;
  } catch (error) {
    console.error('Error generating summary:', error.message);
    return '# Summary\n\nFailed to generate summary.';
  }
}

/**
 * Generate structured output from processed chunks
 */
function generateStructuredOutput(processedChunks, metadata) {
  const output = {
    main: '',
    topics: '',
    decisions: '',
    actionItems: '',
  };

  // Combine all topics
  const allTopics = new Set();
  processedChunks.forEach((chunk) => {
    chunk.topics?.forEach((t) => allTopics.add(t));
  });

  // Combine all decisions
  const allDecisions = [];
  processedChunks.forEach((chunk) => {
    allDecisions.push(...(chunk.decisions || []));
  });

  // Combine all action items
  const allActionItems = [];
  processedChunks.forEach((chunk) => {
    allActionItems.push(...(chunk.actionItems || []));
  });

  // Generate main document
  output.main = `# ${metadata.topic || 'Teams Chat'} - RAG Optimized

**Original Messages:** ${metadata.totalMessages}
**Topics:** ${Array.from(allTopics).join(', ')}
**Created:** ${metadata.created}
**Last Updated:** ${metadata.lastRun}

---

## Context Summaries

${processedChunks
  .flatMap((chunk) => chunk.contextSummaries || [])
  .map((ctx, i) => `### ${ctx.timeframe || `Context ${i + 1}`}: ${ctx.topic}

${ctx.summary}

**Key Points:**
${ctx.keyPoints?.map((p) => `- ${p}`).join('\n') || '- No key points'}
`)
  .join('\n')}

## Technical Details

${processedChunks
  .flatMap((chunk) => chunk.technicalDetails || [])
  .map((tech, i) => `### ${tech.type.toUpperCase()} ${i + 1}

**Context:** ${tech.context}

\`\`\`
${tech.content}
\`\`\`
`)
  .join('\n')}
`;

  // Generate topics document
  output.topics = `# Topics: ${metadata.topic || 'Teams Chat'}

${Array.from(allTopics)
  .map((topic) => `- ${topic}`)
  .join('\n')}
`;

  // Generate decisions document
  output.decisions = `# Decisions: ${metadata.topic || 'Teams Chat'}

${allDecisions
  .map((decision, i) => `## Decision ${i + 1}

**Summary:** ${decision.summary}

**Details:** ${decision.details}

**Participants:** ${decision.participants?.join(', ') || 'Unknown'}
`)
  .join('\n---\n\n')}
`;

  // Generate action items document
  output.actionItems = `# Action Items: ${metadata.topic || 'Teams Chat'}

${allActionItems
  .map((item, i) => `## Action ${i + 1}

**Task:** ${item.task}

**Owner:** ${item.owner || 'Unassigned'}

**Context:** ${item.context}
`)
  .join('\n---\n\n')}
`;

  return output;
}

/**
 * Generate semantic chunks for vector embeddings
 */
function generateSemanticChunks(processedChunks, metadata) {
  const chunks = [];

  processedChunks.forEach((chunk) => {
    // Add context summaries as chunks
    chunk.contextSummaries?.forEach((ctx) => {
      chunks.push({
        id: `ctx_${chunks.length}`,
        type: 'context',
        content: ctx.summary,
        metadata: {
          topic: ctx.topic,
          timeframe: ctx.timeframe,
          keyPoints: ctx.keyPoints,
          source: metadata.topic,
        },
      });
    });

    // Add technical details as chunks
    chunk.technicalDetails?.forEach((tech) => {
      chunks.push({
        id: `tech_${chunks.length}`,
        type: 'technical',
        content: `${tech.context}\n\n${tech.content}`,
        metadata: {
          technicalType: tech.type,
          source: metadata.topic,
        },
      });
    });

    // Add decisions as chunks
    chunk.decisions?.forEach((decision) => {
      chunks.push({
        id: `decision_${chunks.length}`,
        type: 'decision',
        content: `${decision.summary}\n\n${decision.details}`,
        metadata: {
          participants: decision.participants,
          source: metadata.topic,
        },
      });
    });
  });

  // Return as JSONL format
  return chunks.map((chunk) => JSON.stringify(chunk)).join('\n');
}

/**
 * Save file to disk
 */
function saveFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Saved: ${filePath}`);
}

/**
 * CLI helper function
 */
export async function runCLI(inputPath, outputDir, options) {
  console.log('Starting RAG optimization...');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);

  try {
    const result = await optimizeForRAG(inputPath, outputDir, options);

    console.log('\n✓ RAG optimization complete!');
    console.log(`\nProcessed ${result.chunksProcessed} chunk(s)`);
    console.log('\nGenerated files:');
    Object.entries(result.outputFiles).forEach(([key, file]) => {
      console.log(`  - ${key}: ${file}`);
    });

    return result;
  } catch (error) {
    console.error('\n✗ Error during RAG optimization:', error.message);
    throw error;
  }
}
