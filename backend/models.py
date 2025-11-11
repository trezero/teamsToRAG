"""
Pydantic models for the Teams RAG application.

Defines data structures for API requests, responses, and internal data handling.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class Message(BaseModel):
    """Represents a single chat message."""
    user: str = Field(..., description="Name of the user who sent the message")
    timestamp: str = Field(..., description="ISO format timestamp of the message")
    content: str = Field(..., description="Text content of the message")
    message_type: str = Field(default="text", description="Type of message (text, file_share, code, etc.)")
    has_attachments: bool = Field(default=False, description="Whether message contains attachments")
    has_code: bool = Field(default=False, description="Whether message contains code blocks")
    has_links: bool = Field(default=False, description="Whether message contains links")

class ChatMetadata(BaseModel):
    """Metadata for a Teams chat conversation."""
    title: Optional[str] = Field(None, description="Chat title/topic")
    chat_type: Optional[str] = Field(None, description="Type of chat (group, private, etc.)")
    message_count: Optional[int] = Field(None, description="Total number of messages")
    exported_on: Optional[str] = Field(None, description="Date the chat was exported")
    started_on: Optional[str] = Field(None, description="Date the chat was started")

class ChatData(BaseModel):
    """Complete parsed chat data."""
    metadata: ChatMetadata
    messages: List[Message]
    source_file: str = Field(..., description="Path to source file")
    total_messages: int
    parsed_at: str = Field(..., description="When the data was parsed")

class ChunkMetadata(BaseModel):
    """Metadata for a conversation chunk."""
    chat_title: str = Field(..., description="Title of the chat this chunk belongs to")
    source_file: str = Field(..., description="Source file path")
    chunk_type: str = Field(default="conversation", description="Type of chunk")
    message_count: int = Field(..., description="Number of messages in this chunk")
    start_time: str = Field(..., description="Timestamp of first message in chunk")
    end_time: str = Field(..., description="Timestamp of last message in chunk")

class ConversationChunk(BaseModel):
    """A chunk of conversation text suitable for vector storage."""
    id: str = Field(..., description="Unique identifier for the chunk")
    text: str = Field(..., description="Text content of the chunk")
    metadata: ChunkMetadata

class VectorDocument(BaseModel):
    """Document ready for vector database storage."""
    id: str
    text: str
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class IngestRequest(BaseModel):
    """Request to ingest chat data."""
    file_path: str = Field(..., description="Path to Teams chat Markdown file")
    chunk_size: int = Field(default=1000, description="Maximum characters per chunk")

class IngestResponse(BaseModel):
    """Response from data ingestion."""
    success: bool
    chat_data: ChatData
    chunks_created: int
    vectors_stored: int
    message: str

class ChatQuery(BaseModel):
    """User query for chat retrieval."""
    query: str = Field(..., description="Natural language query")
    chat_filter: Optional[str] = Field(None, description="Filter by specific chat title")
    limit: int = Field(default=5, description="Maximum number of results to return")
    include_context: bool = Field(default=True, description="Include conversation context")

class RetrievedChunk(BaseModel):
    """A chunk retrieved from vector search."""
    chunk: ConversationChunk
    score: float = Field(..., description="Similarity score")
    rank: int = Field(..., description="Rank in results")

class ChatResponse(BaseModel):
    """Response to a chat query."""
    query: str
    response: str
    retrieved_chunks: List[RetrievedChunk]
    processing_time: float = Field(..., description="Time taken to process query in seconds")
    model_used: str = Field(..., description="LLM model used for generation")

    model_config = {"protected_namespaces": ()}

class ConversationList(BaseModel):
    """List of available conversations."""
    conversations: List[Dict[str, Any]] = Field(..., description="List of conversation metadata")
    total_count: int

class HealthCheck(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Service status (healthy/unhealthy)")
    version: str = Field(..., description="Application version")
    services: Dict[str, str] = Field(..., description="Status of dependent services")
    uptime: float = Field(..., description="Service uptime in seconds")

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Additional error details")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# Vector Database Models

class MilvusCollectionConfig(BaseModel):
    """Configuration for Milvus collection."""
    name: str = Field(default="teams_chats", description="Collection name")
    description: str = Field(default="Teams chat conversation chunks", description="Collection description")
    dimension: int = Field(default=384, description="Vector dimension (matches embedding model)")

class SearchRequest(BaseModel):
    """Request for vector similarity search."""
    query_vector: List[float] = Field(..., description="Query embedding vector")
    limit: int = Field(default=10, description="Number of results to return")
    filter_expr: Optional[str] = Field(None, description="Milvus filter expression")
    output_fields: List[str] = Field(default_factory=lambda: ["id", "text", "metadata"])

class SearchResult(BaseModel):
    """Result from vector similarity search."""
    id: str
    distance: float
    entity: Dict[str, Any]

class RerankRequest(BaseModel):
    """Request for cross-encoder reranking."""
    query: str
    candidates: List[str] = Field(..., description="Candidate texts to rerank")
    top_k: int = Field(default=5, description="Number of top results to return")

class RerankResult(BaseModel):
    """Result from reranking."""
    text: str
    score: float
    original_index: int

# LLM Integration Models

class LLMConfig(BaseModel):
    """Configuration for LLM service."""
    provider: str = Field(default="openai", description="LLM provider (openai, ollama)")
    model: str = Field(default="gpt-3.5-turbo", description="Model name")
    api_key: Optional[str] = Field(None, description="API key for external providers")
    base_url: Optional[str] = Field(None, description="Base URL for API calls")
    temperature: float = Field(default=0.7, description="Generation temperature")
    max_tokens: int = Field(default=1000, description="Maximum tokens to generate")

class GenerationRequest(BaseModel):
    """Request for text generation."""
    prompt: str = Field(..., description="Input prompt")
    context: List[str] = Field(default_factory=list, description="Context chunks")
    system_prompt: Optional[str] = Field(None, description="System prompt")
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="Previous conversation turns")

class GenerationResponse(BaseModel):
    """Response from text generation."""
    text: str
    usage: Optional[Dict[str, Any]] = Field(None, description="Token usage statistics")
    model: str
    finish_reason: Optional[str] = Field(None, description="Reason generation stopped")

# RAG Engine Models

class RetrievalStrategy(BaseModel):
    """Configuration for retrieval strategy."""
    strategy: str = Field(default="hybrid", description="Retrieval strategy (vector, keyword, hybrid)")
    use_reranking: bool = Field(default=True, description="Whether to use cross-encoder reranking")
    expand_query: bool = Field(default=True, description="Whether to expand query with synonyms")
    context_window: int = Field(default=3, description="Number of chunks to include as context")

class RAGConfig(BaseModel):
    """Configuration for RAG pipeline."""
    embedding_model: str = Field(default="all-MiniLM-L6-v2", description="Sentence transformer model")
    llm_config: LLMConfig = Field(default_factory=LLMConfig)
    retrieval_strategy: RetrievalStrategy = Field(default_factory=RetrievalStrategy)
    chunk_size: int = Field(default=1000, description="Maximum characters per chunk")
    chunk_overlap: int = Field(default=200, description="Overlap between chunks")

class QueryAnalysis(BaseModel):
    """Analysis of user query intent."""
    query_type: str = Field(..., description="Type of query (factual, summary, specific, general)")
    entities: List[str] = Field(default_factory=list, description="Named entities mentioned")
    temporal_filters: Optional[Dict[str, str]] = Field(None, description="Time-based filters")
    user_filters: List[str] = Field(default_factory=list, description="Specific users mentioned")
    confidence: float = Field(..., description="Confidence in analysis")