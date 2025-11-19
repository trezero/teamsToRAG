# Contributing Guide

Thank you for considering contributing to Teams to RAG! This document provides guidelines and instructions for developers who want to contribute to the project.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

**For CLI Tool Development**:
- Node.js 18+ and npm
- Git
- Azure AD application with appropriate permissions

**For Docker RAG Application Development**:
- Docker and Docker Compose
- Python 3.10
- Conda (recommended) or venv

### Development Setup

#### 1. Fork and Clone Repository

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/teamsToRAG.git
cd teamsToRAG

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/teamsToRAG.git
```

#### 2. Install CLI Tool Dependencies

```bash
# Install Node.js dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Azure AD credentials
nano .env
```

#### 3. Setup Python Environment (for RAG Application)

**Option A: Using Conda (Recommended)**
```bash
# Create conda environment
conda create -n teamsRAG python=3.10 -y
conda activate teamsRAG

# Install dependencies
pip install -r backend/requirements.txt

# For ingestion scripts only (lightweight)
conda create -n milvusImport310 python=3.10 -y
conda activate milvusImport310
pip install -r scripts/requirements-ingestion.txt
```

**Option B: Using venv**
```bash
# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

#### 4. Start Docker Services (if working on RAG app)

```bash
# Start all services
docker compose up -d

# Verify services are running
docker compose ps

# View logs
docker compose logs -f
```

#### 5. Verify Setup

```bash
# Test CLI tool
npm start validate

# Test interactive menu
npm start menu

# Test Docker application health
curl http://localhost:8000/health
```

## Code Organization

Understanding the project structure will help you navigate the codebase:

```
teamsToRAG/
├── src/                        # CLI Tool source code
│   ├── index.js               # Main CLI entry point (Commander.js)
│   ├── menu.js                # Interactive menu UI
│   ├── auth.js                # OAuth2 authentication
│   ├── teamsClient.js         # Microsoft Graph API client
│   ├── chatFinder.js          # Chat/channel discovery
│   ├── cache.js               # SQLite caching layer
│   ├── ragGenerator.js        # Markdown generation
│   ├── ragOptimizer.js        # Claude AI optimization
│   └── optimizeRag.js         # RAG optimizer CLI
├── backend/                    # Docker RAG Application backend
│   ├── main.py                # FastAPI server
│   ├── rag_engine.py          # RAG pipeline
│   ├── vector_store.py        # Vector database integration
│   ├── data_ingestion.py      # Data parser
│   └── models.py              # Pydantic models
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── ChatInterface.js
│   │   └── api.js
│   └── package.json
├── scripts/                    # Utility scripts
│   ├── ingest_data.py         # Data ingestion
│   └── setup.sh               # Setup script
├── docs/                       # Documentation
│   ├── developer/             # Developer documentation
│   ├── user-guide/            # User guides
│   └── planning/              # Planning documents
└── tests/                      # Test files
```

### Key Components

**CLI Tool**:
- `src/auth.js`: Handles OAuth2 device code and client credentials flows
- `src/teamsClient.js`: All Microsoft Graph API interactions
- `src/cache.js`: Local SQLite caching for performance
- `src/ragGenerator.js`: Converts Teams messages to markdown

**RAG Application**:
- `backend/rag_engine.py`: Core RAG logic and LLM integration
- `backend/vector_store.py`: Vector database operations
- `backend/data_ingestion.py`: Parses Teams markdown exports

## Development Workflow

### 1. Create a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the coding standards (see below) and make your changes in small, logical commits:

```bash
# Make changes to files
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add support for private channels"
```

### 3. Test Your Changes

**CLI Tool Testing**:
```bash
# Run validation
npm start validate

# Test with small dataset
npm start generate -- --chat-id "YOUR_CHAT_ID" --max-messages 10

# Test interactive menu
npm start menu

# Test cache functionality
npm start menu
# Use options 4 (force refresh) and 5 (clear cache)
```

**RAG Application Testing**:
```bash
# Test data ingestion
conda activate milvusImport310
python scripts/ingest_data.py sample_data/ --verbose

# Test API endpoints
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What was discussed about features?"}'

# Check logs
docker compose logs -f app
```

### 4. Write Tests

Add tests for new functionality:

**CLI Tool** (future test structure):
```javascript
// tests/auth.test.js
describe('Authentication', () => {
  test('should authenticate with device code', async () => {
    // Test implementation
  });

  test('should handle expired device code', async () => {
    // Test implementation
  });
});
```

**Backend** (future test structure):
```python
# tests/test_rag_engine.py
def test_semantic_search():
    # Test implementation
    pass

def test_chunking_algorithm():
    # Test implementation
    pass
```

### 5. Update Documentation

If your changes affect user-facing functionality:

1. Update relevant markdown files in `docs/`
2. Update README.md if adding new features
3. Update CLAUDE.md if changing architecture
4. Add code comments for complex logic

### 6. Submit Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# - Provide clear description of changes
# - Reference any related issues
# - Include screenshots for UI changes
```

## Coding Standards

### JavaScript/Node.js (CLI Tool)

**Style Guide**:
- Use modern ES6+ syntax
- Use async/await over callbacks
- Prefer const/let over var
- Use meaningful variable names

**Code Formatting**:
```javascript
// GOOD: Clear, descriptive names
async function fetchChatMessages(chatId, sinceDate = null) {
  const messages = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetchPage(chatId, messages.length);
    messages.push(...response.value);
    hasMore = !!response['@odata.nextLink'];
  }

  return messages;
}

// BAD: Unclear names, mixed styles
function getData(id, d) {
  var msgs = [];
  // ...
}
```

**Error Handling**:
```javascript
// GOOD: Helpful error messages
try {
  const data = await fetchData(chatId);
} catch (error) {
  if (error.statusCode === 404) {
    throw new Error(`Chat not found: ${chatId}. Verify the chat ID and your access.`);
  } else if (error.statusCode === 403) {
    throw new Error(`Permission denied. Ensure you have Chat.Read permission.`);
  } else {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}
```

**User Experience**:
```javascript
// Use ora for consistent spinners
const ora = require('ora');
const spinner = ora('Fetching messages...').start();

try {
  const messages = await fetchMessages(chatId);
  spinner.succeed(`Fetched ${messages.length} messages`);
} catch (error) {
  spinner.fail(`Failed: ${error.message}`);
}
```

### Python (RAG Application)

**Style Guide**:
- Follow PEP 8 conventions
- Use type hints for function signatures
- Use docstrings for functions and classes
- Prefer descriptive names over abbreviations

**Code Formatting**:
```python
# GOOD: Type hints, docstrings, clear logic
async def semantic_search(
    query: str,
    filters: Dict[str, Any] = None,
    top_k: int = 5
) -> List[SearchResult]:
    """
    Perform semantic search over vector database.

    Args:
        query: User's search query
        filters: Optional metadata filters
        top_k: Number of results to return

    Returns:
        List of search results with scores
    """
    embeddings = await self.embed_query(query)
    results = await self.vector_db.search(embeddings, filters, top_k)
    return results
```

**Error Handling**:
```python
# GOOD: Specific exceptions with context
from fastapi import HTTPException

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = await rag_engine.query(request.query)
        return {"response": response}
    except VectorDBConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Vector database unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Documentation Standards

**Code Comments**:
```javascript
// GOOD: Explains WHY, not WHAT
// Channel messages API doesn't support $filter on createdDateTime
// so we must fetch all messages and filter client-side
const allMessages = await fetchAllChannelMessages(teamId, channelId);
const newMessages = allMessages.filter(m =>
  new Date(m.createdDateTime) > sinceDate
);

// BAD: Obvious comment
// Filter messages
const filtered = messages.filter(m => m.date > date);
```

**Markdown Documentation**:
- Use clear headings and structure
- Include code examples for complex concepts
- Add links to related documentation
- Keep line length to 80-100 characters

## Testing Approach

### Manual Testing Checklist

Before submitting a PR, verify:

**CLI Tool**:
- [ ] `npm start validate` succeeds
- [ ] Authentication works (device code flow)
- [ ] Can list chats in interactive menu
- [ ] Can export chat to markdown
- [ ] Incremental updates work correctly
- [ ] Cache behaves as expected
- [ ] Error messages are helpful

**RAG Application**:
- [ ] Docker services start successfully
- [ ] Health check endpoint responds
- [ ] Data ingestion completes without errors
- [ ] Chat queries return relevant results
- [ ] Frontend displays results correctly

### Automated Testing (Future)

We plan to add:
- Unit tests for core functions
- Integration tests for API interactions
- End-to-end tests for user workflows
- CI/CD pipeline with automated testing

## Pull Request Guidelines

### PR Title Format

Use conventional commits format:

- `feat: Add new feature`
- `fix: Fix bug in authentication`
- `docs: Update API documentation`
- `refactor: Reorganize cache module`
- `test: Add tests for chat export`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issues
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] Tested changes locally
- [ ] No new warnings or errors
```

### Review Process

1. Maintainers will review your PR within 1-2 weeks
2. Address any feedback or requested changes
3. Once approved, maintainers will merge your PR
4. Your contribution will be included in the next release

## Common Development Tasks

### Adding a New CLI Command

1. Edit `src/index.js`:
```javascript
program
  .command('mycommand')
  .description('My new command')
  .option('--my-option <value>', 'Option description')
  .action(async (options) => {
    await myCommandHandler(options);
  });
```

2. Create handler in appropriate module
3. Update documentation
4. Test with various inputs

### Adding a New API Endpoint

1. Add route in `backend/main.py`:
```python
@app.post("/api/myendpoint")
async def my_endpoint(request: MyRequest):
    result = await process_request(request)
    return {"result": result}
```

2. Add request/response models in `backend/models.py`
3. Update API documentation
4. Test endpoint manually and with curl

### Modifying RAG Pipeline

1. Edit `backend/rag_engine.py`
2. Update chunking, embedding, or retrieval logic
3. Test with sample data
4. Measure performance impact
5. Update documentation

## Getting Help

If you need help:

1. Check existing documentation in `docs/`
2. Search existing GitHub issues
3. Create a new issue with `question` label
4. Join community discussions (if available)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project documentation

Thank you for contributing to Teams to RAG!
