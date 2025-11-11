"""
FastAPI Backend for Teams RAG Chat Application

Provides REST API endpoints for:
- Data ingestion
- Chat queries
- Conversation management
- Health checks
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models import (
    ChatQuery,
    ChatResponse,
    IngestRequest,
    IngestResponse,
    ConversationList,
    HealthCheck,
    RAGConfig,
    MilvusCollectionConfig
)
from data_ingestion import TeamsChatParser, create_chunks_from_messages
from vector_store import MilvusVectorStore, create_vector_documents_from_chunks
from rag_engine import RAGEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables for services
vector_store: Optional[MilvusVectorStore] = None
rag_engine: Optional[RAGEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown."""
    # Startup
    await startup_event()
    yield
    # Shutdown
    await shutdown_event()

async def startup_event():
    """Initialize services on startup."""
    global vector_store, rag_engine

    try:
        # Load configuration from environment
        milvus_host = os.getenv("VECTOR_DB_HOST", "milvus-standalone")
        milvus_port = os.getenv("VECTOR_DB_PORT", "19530")

        # Initialize vector store
        collection_config = MilvusCollectionConfig()
        vector_store = MilvusVectorStore(
            host=milvus_host,
            port=milvus_port,
            collection_config=collection_config
        )

        # Connect to Milvus
        if not vector_store.connect():
            logger.error("Failed to connect to Milvus on startup")
            raise Exception("Milvus connection failed")

        # Create collection if it doesn't exist
        if not vector_store.create_collection():
            logger.error("Failed to create Milvus collection")
            raise Exception("Collection creation failed")

        # Initialize RAG engine
        rag_config = RAGConfig()
        rag_engine = RAGEngine(rag_config, vector_store)

        logger.info("Services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

async def shutdown_event():
    """Clean up services on shutdown."""
    global vector_store

    if vector_store:
        vector_store.disconnect()
        logger.info("Services shut down")

# Create FastAPI app
app = FastAPI(
    title="Teams RAG Chat API",
    description="Retrieval-Augmented Generation API for Microsoft Teams chat data",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint."""
    services_status = {}

    # Check Milvus connection
    if vector_store and vector_store._connected:
        try:
            stats = vector_store.get_collection_stats()
            services_status["milvus"] = "healthy" if "error" not in stats else "unhealthy"
        except Exception:
            services_status["milvus"] = "unhealthy"
    else:
        services_status["milvus"] = "disconnected"

    # Check RAG engine
    services_status["rag_engine"] = "healthy" if rag_engine else "unhealthy"

    # Overall status
    overall_status = "healthy" if all(status == "healthy" for status in services_status.values()) else "unhealthy"

    return HealthCheck(
        status=overall_status,
        version="1.0.0",
        services=services_status,
        uptime=0.0  # Could track actual uptime
    )

@app.post("/ingest", response_model=IngestResponse)
async def ingest_chat_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    chunk_size: int = 1000
):
    """
    Ingest Teams chat data from uploaded Markdown file.

    Processes the file in the background and stores chunks in vector database.
    """
    if not rag_engine:
        raise HTTPException(status_code=503, detail="RAG engine not available")

    try:
        # Read file content
        content = await file.read()
        file_content = content.decode('utf-8')

        # Parse chat data
        parser = TeamsChatParser()
        chat_data = parser.parse_content(file_content, file.filename)

        # Create chunks
        chunks = create_chunks_from_messages(chat_data, chunk_size)

        # Convert to vector documents
        documents = create_vector_documents_from_chunks(chunks)

        # Store in vector database
        success = vector_store.insert_documents(documents)

        if success:
            return IngestResponse(
                success=True,
                chat_data=chat_data,
                chunks_created=len(chunks),
                vectors_stored=len(documents),
                message=f"Successfully ingested {len(chunks)} chunks from {file.filename}"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to store vectors in database")

    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_query(query: ChatQuery):
    """
    Process a chat query using RAG pipeline.

    Returns generated response with retrieved context.
    """
    if not rag_engine:
        raise HTTPException(status_code=503, detail="RAG engine not available")

    try:
        response = rag_engine.process_query(query)
        return response

    except Exception as e:
        logger.error(f"Query processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@app.get("/conversations", response_model=ConversationList)
async def list_conversations():
    """
    List available conversations in the vector store.

    Returns metadata about ingested chats.
    """
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")

    try:
        # This is a simplified implementation
        # In a real system, you'd want to maintain a separate index of conversations
        # For now, we'll return a placeholder response
        conversations = [
            {
                "title": "Sample Conversation",
                "message_count": 0,
                "last_updated": "2024-01-01T00:00:00Z",
                "source_file": "sample.md"
            }
        ]

        return ConversationList(
            conversations=conversations,
            total_count=len(conversations)
        )

    except Exception as e:
        logger.error(f"Failed to list conversations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list conversations: {str(e)}")

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and its associated chunks.

    Note: This is a simplified implementation.
    """
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")

    try:
        # Delete chunks matching the conversation
        filter_expr = f"chat_title == '{conversation_id}'"
        success = vector_store.delete_by_filter(filter_expr)

        if success:
            return {"message": f"Conversation '{conversation_id}' deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete conversation")

    except Exception as e:
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")

@app.post("/optimize")
async def optimize_index():
    """Optimize the vector database index for better performance."""
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")

    try:
        success = vector_store.optimize_index()
        if success:
            return {"message": "Index optimization completed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Index optimization failed")

    except Exception as e:
        logger.error(f"Index optimization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Index optimization failed: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get statistics about the vector store and collections."""
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not available")

    try:
        stats = vector_store.get_collection_stats()
        return stats

    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

if __name__ == "__main__":
    # Run the server
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )