#!/bin/bash

# Teams RAG Application Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Setting up Teams RAG Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend
mkdir -p frontend/src
mkdir -p scripts
mkdir -p output
mkdir -p .cache

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.sample .env 2>/dev/null || cat > .env << EOF
# Teams RAG Application Environment Variables

# Vector Database Configuration
VECTOR_DB_HOST=milvus-standalone
VECTOR_DB_PORT=19530

# Graph Database Configuration (Neo4j)
GRAPH_DB_URI=bolt://neo4j:7687
GRAPH_DB_USER=neo4j
GRAPH_DB_PASSWORD=changeme

# LLM Configuration
LLM_HOST_URL=http://host.docker.internal:11434

# Teams Authentication (optional)
TENANT_ID=
CLIENT_ID=
CLIENT_SECRET=
AUTH_MODE=delegated

# OpenAI API (optional fallback)
OPENAI_API_KEY=
EOF
    echo "✅ Created .env file. Please edit it with your configuration."
else
    echo "ℹ️  .env file already exists."
fi

# Build and start services
echo "🐳 Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 60

# Check if Milvus is ready
echo "🔍 Checking Milvus connection..."
max_attempts=60
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:9091/healthz &>/dev/null 2>&1; then
        echo "✅ Milvus is ready!"
        break
    fi
    echo "Attempt $attempt/$max_attempts: Waiting for Milvus..."
    sleep 15
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Milvus failed to start properly. Check logs with: docker-compose logs milvus-standalone"
    echo "🔍 Checking individual service status..."
    docker-compose ps
    echo "📋 Milvus logs:"
    docker-compose logs milvus-standalone | tail -20
    exit 1
fi

# Install Node.js dependencies (for build process)
echo "📦 Installing Node.js dependencies..."
cd frontend
if command -v npm &> /dev/null; then
    npm install
else
    echo "❌ npm is not installed. Please install Node.js and npm."
    exit 1
fi
cd ..

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh
chmod +x scripts/*.py

# Create sample data directory
mkdir -p sample_data

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Place your Teams chat Markdown files in the 'sample_data' directory"
echo "2. Run data ingestion: docker-compose exec app python scripts/ingest_data.py sample_data/"
echo "3. The backend and frontend are already running in Docker containers"
echo ""
echo "🌐 Access the application:"
echo "- Frontend: http://localhost:80 (served by Nginx)"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo "- Milvus: http://localhost:19530"
echo ""
echo "📊 View logs:"
echo "- All services: docker-compose logs -f"
echo "- Milvus: docker-compose logs -f milvus-standalone"
echo "- Backend: docker-compose logs -f app"
echo ""
echo "🛑 To stop: docker-compose down"
echo ""
echo "🔄 To restart: docker-compose restart"