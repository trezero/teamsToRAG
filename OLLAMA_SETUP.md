# Using Ollama for Local RAG Optimization

Avoid Claude AI rate limits by using Ollama for local AI processing!

## What is Ollama?

Ollama lets you run large language models locally on your machine. No API costs, no rate limits!

## Setup Instructions

### 1. Install Ollama

**Windows:**
```bash
# Download from: https://ollama.com/download/windows
# Run the installer
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Start Ollama Service

```bash
ollama serve
```

Leave this running in a terminal window.

### 3. Pull a Model

```bash
# Recommended: Llama 3.1 (8B parameters, good quality/speed balance)
ollama pull llama3.1

# Alternative options:
# ollama pull llama3.1:70b  # Better quality, slower
# ollama pull mistral        # Faster, smaller
# ollama pull gemma2         # Google's model
```

### 4. Configure Environment

Edit your `.env` file:

```env
# Use Ollama instead of Claude
AI_PROVIDER=ollama

# Ollama settings
OLLAMA_ENDPOINT=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.1
```

## Usage

### Basic Usage (with Ollama)

```bash
npm run optimize -- output/chat-IRIS-Dev-Integration-Meeting.md
```

That's it! It will automatically use Ollama.

### Specify Provider Explicitly

```bash
# Use Ollama
npm run optimize -- output/chat-*.md --provider ollama

# Use Claude (if you have API key)
npm run optimize -- output/chat-*.md --provider claude --api-key YOUR_KEY
```

### Use Different Model

```bash
# Use Llama 3.1 70B (better quality)
npm run optimize -- output/chat-*.md --model llama3.1:70b

# Use Mistral (faster)
npm run optimize -- output/chat-*.md --model mistral
```

## Model Recommendations

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `llama3.1` | 8B | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | General use, balanced |
| `llama3.1:70b` | 70B | ⚡ Slow | ⭐⭐⭐⭐⭐ Excellent | High quality needed |
| `mistral` | 7B | ⚡⚡⚡⚡ Very Fast | ⭐⭐ Decent | Quick processing |
| `gemma2` | 9B | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | Alternative to Llama |

## Performance Comparison

### Claude AI (Cloud)
- ✅ High quality results
- ✅ Fast API responses
- ❌ Costs money ($0.10-0.30 per chat)
- ❌ Rate limits
- ❌ Requires internet
- ❌ Data sent to third party

### Ollama (Local)
- ✅ FREE - no API costs
- ✅ No rate limits
- ✅ Works offline
- ✅ Data stays on your machine
- ⚠️ Requires good hardware (8GB+ RAM)
- ⚠️ Slower than Claude (depends on your CPU/GPU)
- ⚠️ Quality depends on model size

## Hardware Requirements

**Minimum (for llama3.1):**
- 8GB RAM
- Modern CPU (will be slow)

**Recommended:**
- 16GB+ RAM
- NVIDIA GPU with 8GB+ VRAM (for GPU acceleration)
- Modern CPU with AVX2 support

**Optimal:**
- 32GB+ RAM
- NVIDIA RTX 3090/4090 or similar
- Fast NVMe SSD

## GPU Acceleration

Ollama automatically uses your GPU if available!

**Check GPU usage:**
```bash
# While processing, run:
nvidia-smi  # On systems with NVIDIA GPU
```

**To disable GPU (use CPU only):**
```bash
OLLAMA_NUM_GPU=0 ollama serve
```

## Troubleshooting

### "Cannot connect to Ollama"

**Solution:** Make sure Ollama is running
```bash
ollama serve
```

### "Model not found"

**Solution:** Pull the model first
```bash
ollama pull llama3.1
```

### Very Slow Processing

**Solutions:**
1. Use a smaller model: `--model mistral`
2. Reduce chunk size: `--chunk-size 50000`
3. Check if GPU is being used: `nvidia-smi`
4. Close other applications to free up RAM

### Out of Memory Errors

**Solutions:**
1. Use a smaller model
2. Close other applications
3. Reduce chunk size
4. Restart Ollama service

### Poor Quality Results

**Solutions:**
1. Use a larger model: `--model llama3.1:70b`
2. Try different model: `--model gemma2`
3. If quality still not good enough, use Claude: `--provider claude`

## Example Workflow

```bash
# 1. Start Ollama (in separate terminal)
ollama serve

# 2. Pull model (one time only)
ollama pull llama3.1

# 3. Export Teams chat
npm start generate

# 4. Optimize with Ollama (uses local AI, no costs!)
npm run optimize -- output/chat-IRIS-Dev-Integration-Meeting.md

# Result: RAG-optimized documents created locally, no API costs!
```

## Cost Comparison

**Processing a 1000-message chat (350KB):**

| Provider | Cost | Time | Quality |
|----------|------|------|---------|
| Claude | $0.10-0.30 | ~30 seconds | ⭐⭐⭐⭐⭐ |
| Ollama (llama3.1, CPU) | $0 | ~5 minutes | ⭐⭐⭐⭐ |
| Ollama (llama3.1, GPU) | $0 | ~1 minute | ⭐⭐⭐⭐ |
| Ollama (llama3.1:70b, GPU) | $0 | ~3 minutes | ⭐⭐⭐⭐⭐ |

**For 100 chats:**
- Claude: **$10-30**
- Ollama: **$0** (just electricity)

## Advanced Configuration

### Custom Ollama Endpoint

```bash
# If Ollama is on different machine
npm run optimize -- output/chat-*.md \
  --provider ollama \
  --ollama-endpoint http://192.168.1.100:11434/api/generate
```

### Environment Variables

```env
# .env file
AI_PROVIDER=ollama
OLLAMA_ENDPOINT=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.1
```

### Mix and Match

```bash
# Use Ollama for processing, Claude for summary only
# (Not currently supported, but could be added)
```

## When to Use Which Provider

**Use Ollama when:**
- You have good hardware
- Processing many chats (save money)
- Want data privacy
- No internet/behind firewall
- Learning/experimenting

**Use Claude when:**
- Need absolute best quality
- Don't have good hardware
- One-off processing
- Speed is critical
- Ollama quality not sufficient

## More Information

- Ollama Docs: https://github.com/ollama/ollama
- Model Library: https://ollama.com/library
- Discord Community: https://discord.gg/ollama
