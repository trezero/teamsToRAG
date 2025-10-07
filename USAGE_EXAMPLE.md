# Usage Example: Converting Teams Chat to RAG-Optimized Format

This guide walks you through the complete process of exporting a Teams chat and optimizing it for RAG.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Azure AD app registered with appropriate permissions
- [ ] Anthropic API key obtained
- [ ] `.env` file configured

## Step 1: Configure Environment

Create `.env` file:

```bash
cp .env.sample .env
```

Edit `.env`:

```env
# Microsoft Azure AD
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
AUTH_MODE=delegated

# Teams Chat/Channel
TEAMS_CHAT_ID=19:meeting_NDQzNGVkYTEtYjU4Yi00NGFjLTliNTMtZDBlMDVlODdjZTAz@thread.v2

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## Step 2: Export Teams Chat

```bash
# Install dependencies first
npm install

# Export the chat
npm start generate
```

**Output:**
```
✓ Authenticated successfully
✓ Chat metadata retrieved
✓ Fetching messages (this may take a while for large chats)...
✓ Retrieved 1616 messages
✓ RAG document generated successfully

Output: output/chat-19_meeting_NDQzNGVkYTEtYjU4Yi00NGFjLTliNTMtZDBlMDVlODdjZTAz@thread.v2.md
```

This creates a markdown file like:

```markdown
# Teams Chat Export for RAG

**Topic:** IRIS Dev Integration Testing
**Chat Type:** meeting
**Total Messages:** 1616
**Created:** 6/24/2025, 9:52:38 AM

---

## 6/24/2025

**Unknown User** - 10:06:56 AM


## 6/30/2025

**Jez Tucker** - 6:11:14 AM
fsuuid:inode:inodegen

-> encode -> md5sum "like"

...
```

## Step 3: Optimize for RAG with Claude AI

```bash
# Run the RAG optimizer
npm run optimize -- "output/chat-19_meeting_NDQzNGVkYTEtYjU4Yi00NGFjLTliNTMtZDBlMDVlODdjZTAz@thread.v2.md"
```

**Output:**
```
📊 RAG Optimization Configuration:
  Input: output/chat-19_meeting_NDQzNGVkYTEtYjU4Yi00NGFjLTliNTMtZDBlMDVlODdjZTAz@thread.v2.md
  Output: output/rag
  Model: claude-3-5-sonnet-20241022
  Format: structured
  Topics: ✓
  Decisions: ✓
  Action Items: ✓
  Summary: ✓

Starting RAG optimization...
Processing chunk 1/3...
Processing chunk 2/3...
Processing chunk 3/3...

✓ RAG optimization complete!

Processed 3 chunk(s)

Generated files:
  - summary: output/rag/iris_dev_integration_testing_summary.md
  - main: output/rag/iris_dev_integration_testing_rag_structured.md
  - topics: output/rag/iris_dev_integration_testing_topics.md
  - decisions: output/rag/iris_dev_integration_testing_decisions.md
  - actionItems: output/rag/iris_dev_integration_testing_action_items.md

✨ RAG-optimized documents are ready for embedding and retrieval!
```

## Step 4: Review the Output

### Summary File (`iris_dev_integration_testing_summary.md`)

```markdown
# Summary: IRIS Dev Integration Testing

The conversation centers around the integration testing for IRIS Dev, with a particular
focus on finalizing the inode etag format and Hub integration. The team reached consensus
on using the `:fsid:ino:igen` format for inode etag numbers to maintain consistency with
the ngrecall command. Key technical discussions included rabbit exchange configuration,
Versity deployment issues, and resolving Jinja template errors in the Salt configuration.

The team successfully deployed version 6.10.0-0.alpha.9 containing Hub 2.8.0-0.alpha1 and
Versity with the inode etag support. Several action items were identified including pushing
updates to Cardiff lab nodes and creating RabbitMQ credentials for the integration.

---

**Metadata:**
- Total Messages: 1616
- Created: 6/24/2025, 9:52:38 AM
- Last Updated: 2025-10-06T22:52:35.659Z
- Participants: Jez Tucker, Gareth Tucker, Orlando Richards, Daniel Iwan, Christopher Oates
- Topics: inode etag format, Hub integration, rabbit exchanges, versity deployment, salt configuration
```

### Topics File (`iris_dev_integration_testing_topics.md`)

```markdown
# Topics: IRIS Dev Integration Testing

- inode etag format
- Hub 2.8.0-0.alpha1 integration
- RabbitMQ exchange configuration
- Versity deployment
- Salt configuration errors
- ngrecall command compatibility
- Cardiff lab deployment
- Pixstor upgrade process
```

### Decisions File (`iris_dev_integration_testing_decisions.md`)

```markdown
# Decisions: IRIS Dev Integration Testing

## Decision 1

**Summary:** Standardized inode etag format to `:fsid:ino:igen`

**Details:** The team agreed to use the format `:fsid:ino:igen` for inode etag numbers
to maintain consistency with the ngrecall command and published events. This format
represents fsid (filesystem ID), ino (inode number), and igen (inode generation).

**Participants:** Orlando Richards, Jez Tucker, Daniel Iwan

---

## Decision 2

**Summary:** Deploy version 6.10.0-0.alpha.9 to Cardiff lab

**Details:** Version 6.10.0-0.alpha.9 containing Hub 2.8.0-0.alpha1 and Versity with
inode etag support was selected for deployment to Cardiff lab nodes ahead of the
afternoon session.

**Participants:** Orlando Richards, Daniel Iwan
```

### Action Items File (`iris_dev_integration_testing_action_items.md`)

```markdown
# Action Items: IRIS Dev Integration Testing

## Action 1

**Task:** Push version 6.10.0-0.alpha.9 to Cardiff lab nodes

**Owner:** Daniel Iwan

**Context:** Deploy the build containing Hub 2.8.0-0.alpha1 and Versity with inode etag
support to Cardiff lab ahead of afternoon session

---

## Action 2

**Task:** Provide RabbitMQ exchange configuration details

**Owner:** Christopher Oates

**Context:** Hub needs rabbit exchange settings configured. Provide details for Daniel
to ensure it's working by morning.
```

## Step 5: Use with Your RAG System

### Option A: Structured Documents (for targeted retrieval)

```javascript
import fs from 'fs';

// Load specific document types
const summary = fs.readFileSync('output/rag/iris_dev_integration_testing_summary.md', 'utf8');
const decisions = fs.readFileSync('output/rag/iris_dev_integration_testing_decisions.md', 'utf8');
const actionItems = fs.readFileSync('output/rag/iris_dev_integration_testing_action_items.md', 'utf8');

// Use for targeted queries
function answerQuery(query) {
  if (query.includes('decision') || query.includes('decided')) {
    return searchInMarkdown(decisions, query);
  } else if (query.includes('action') || query.includes('todo')) {
    return searchInMarkdown(actionItems, query);
  } else {
    return searchInMarkdown(summary, query);
  }
}
```

### Option B: Semantic Chunks (for vector embeddings)

First, generate semantic format:

```bash
npm run optimize -- "output/chat-19_meeting_*.md" --format semantic
```

Then use the JSONL output:

```javascript
import fs from 'fs';
import { embed } from 'your-embedding-library';

// Load semantic chunks
const chunks = fs.readFileSync('output/rag/iris_dev_integration_testing_rag_semantic.jsonl', 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

// Insert into vector database
for (const chunk of chunks) {
  const embedding = await embed(chunk.content);

  await vectorDB.insert({
    id: chunk.id,
    content: chunk.content,
    embedding: embedding,
    type: chunk.type,
    metadata: chunk.metadata
  });
}

// Later, query with semantic search
async function queryRAG(question) {
  const questionEmbedding = await embed(question);
  const results = await vectorDB.search(questionEmbedding, limit: 5);

  return results.map(r => ({
    content: r.content,
    type: r.type,
    relevance: r.similarity
  }));
}
```

## Step 6: Incremental Updates

When the chat has new messages:

```bash
# Export again (only fetches new messages)
npm start generate

# Re-optimize the updated export
npm run optimize -- "output/chat-19_meeting_*.md"
```

The tool will:
1. Detect the existing export
2. Fetch only new messages since last run
3. Append them to the existing file
4. Re-optimize with the complete updated content

## Advanced Usage

### Custom Chunk Size (for very large chats)

```bash
npm run optimize -- "output/chat-*.md" --chunk-size 50000
```

### Exclude Certain Extractions

```bash
npm run optimize -- "output/chat-*.md" \
  --no-action-items \
  --no-summary
```

### Use Different Claude Model

```bash
npm run optimize -- "output/chat-*.md" \
  --model claude-3-opus-20240229
```

### Specify Custom Output Directory

```bash
npm run optimize -- "output/chat-*.md" \
  --output ./my-rag-documents
```

## Cost Estimation

For the example chat (1616 messages, ~350KB):

- **Export**: Free (uses Microsoft Graph API)
- **RAG Optimization**: ~$0.15-0.30 (using Claude 3.5 Sonnet)
  - Input: ~100,000 tokens @ $3/million = $0.30
  - Output: ~5,000 tokens @ $15/million = $0.075
  - **Total: ~$0.38**

For a typical workload (10 chats/month):
- **Monthly cost**: ~$3.80

## Tips for Best Results

1. **Clean exports first**: Run the Teams export separately to verify the data
2. **Use structured format for** specific document types (decisions, actions)
3. **Use semantic format for** general-purpose RAG with vector search
4. **Combine both formats** for maximum flexibility
5. **Re-optimize periodically** when chat has significant new content
6. **Review extracted data** to ensure quality before using in production

## Troubleshooting

### Large files taking too long to process

Use smaller chunk size:
```bash
npm run optimize -- "output/chat-*.md" --chunk-size 50000
```

### API errors during optimization

Check your API key and credits:
```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY

# Check rate limits in Anthropic Console
# https://console.anthropic.com/
```

### Poor quality extractions

Try different prompt strategies or use a more capable model:
```bash
npm run optimize -- "output/chat-*.md" --model claude-3-opus-20240229
```

## Next Steps

- Integrate the optimized documents into your RAG pipeline
- Experiment with different chunking strategies
- Build custom retrieval logic based on document types
- Create embeddings and test semantic search quality
- Monitor and iterate on extraction quality
