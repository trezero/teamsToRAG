"""
RAG Engine for Teams Chat Application

Implements Retrieval-Augmented Generation pipeline with:
- Context-aware chunking
- Multi-stage retrieval (vector search + reranking)
- Agentic query analysis
- LLM integration for response generation
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
import time
from sentence_transformers import SentenceTransformer, CrossEncoder
import numpy as np

from models import (
    ChatQuery,
    ChatResponse,
    RetrievedChunk,
    ConversationChunk,
    QueryAnalysis,
    RAGConfig,
    RetrievalStrategy,
    GenerationRequest,
    GenerationResponse
)
from vector_store import MilvusVectorStore
from data_ingestion import create_chunks_from_messages

logger = logging.getLogger(__name__)

class QueryAnalyzer:
    """
    Analyzes user queries to determine intent and retrieval strategy.
    """

    def __init__(self):
        # Keywords for different query types
        self.factual_keywords = [
            "what", "when", "where", "who", "how many", "how much",
            "find", "search", "locate", "get", "show me"
        ]

        self.summary_keywords = [
            "summarize", "summary", "overview", "recap", "brief",
            "tell me about", "explain", "describe"
        ]

        self.specific_keywords = [
            "specific", "exact", "precise", "particular", "certain"
        ]

        self.temporal_keywords = [
            "yesterday", "today", "last week", "this month",
            "recently", "before", "after", "during"
        ]

    def analyze_query(self, query: str) -> QueryAnalysis:
        """
        Analyze query to determine type and extraction parameters.

        Args:
            query: User query string

        Returns:
            QueryAnalysis with intent classification
        """
        query_lower = query.lower()

        # Determine query type
        if any(keyword in query_lower for keyword in self.summary_keywords):
            query_type = "summary"
        elif any(keyword in query_lower for keyword in self.factual_keywords):
            query_type = "factual"
        elif any(keyword in query_lower for keyword in self.specific_keywords):
            query_type = "specific"
        else:
            query_type = "general"

        # Extract entities (basic implementation - could be enhanced with NER)
        entities = []
        # Simple entity extraction - look for quoted text or capitalized phrases
        import re
        quoted_entities = re.findall(r'"([^"]*)"', query)
        entities.extend(quoted_entities)

        # Extract temporal information
        temporal_filters = None
        for keyword in self.temporal_keywords:
            if keyword in query_lower:
                temporal_filters = {"period": keyword}
                break

        # Extract user mentions (basic - look for @ mentions or capitalized names)
        user_filters = []
        user_mentions = re.findall(r'@(\w+)', query)
        user_filters.extend(user_mentions)

        return QueryAnalysis(
            query_type=query_type,
            entities=entities,
            temporal_filters=temporal_filters,
            user_filters=user_filters,
            confidence=0.8  # Placeholder confidence score
        )

class ContextAwareChunker:
    """
    Creates context-aware chunks from conversation data.
    """

    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def create_chunks(
        self,
        messages: List[Dict[str, Any]],
        chat_metadata: Dict[str, Any]
    ) -> List[ConversationChunk]:
        """
        Create context-aware chunks preserving conversation flow.

        Args:
            messages: List of parsed messages
            chat_metadata: Chat metadata

        Returns:
            List of conversation chunks
        """
        chunks = []
        current_chunk_messages = []
        current_length = 0

        for i, message in enumerate(messages):
            message_text = f"{message['user']}: {message['content']}"
            message_length = len(message_text)

            # Check if adding this message would exceed chunk size
            if current_chunk_messages and current_length + message_length > self.chunk_size:
                # Create chunk from current messages
                chunk = self._create_chunk_from_messages(
                    current_chunk_messages,
                    chat_metadata,
                    len(chunks)
                )
                chunks.append(chunk)

                # Start new chunk with overlap
                overlap_messages = self._get_overlap_messages(
                    current_chunk_messages,
                    self.overlap
                )
                current_chunk_messages = overlap_messages + [message]
                current_length = sum(len(f"{m['user']}: {m['content']}") for m in current_chunk_messages)
            else:
                current_chunk_messages.append(message)
                current_length += message_length

        # Create final chunk
        if current_chunk_messages:
            chunk = self._create_chunk_from_messages(
                current_chunk_messages,
                chat_metadata,
                len(chunks)
            )
            chunks.append(chunk)

        logger.info(f"Created {len(chunks)} context-aware chunks")
        return chunks

    def _create_chunk_from_messages(
        self,
        messages: List[Dict[str, Any]],
        chat_metadata: Dict[str, Any],
        chunk_index: int
    ) -> ConversationChunk:
        """Create a ConversationChunk from a list of messages."""
        from models import ChunkMetadata

        # Combine messages into text
        text_parts = []
        for msg in messages:
            text_parts.append(f"{msg['user']}: {msg['content']}")
        text = "\n".join(text_parts)

        # Create metadata
        metadata = ChunkMetadata(
            chat_title=chat_metadata.get("title", "Unknown Chat"),
            source_file=chat_metadata.get("source_file", ""),
            chunk_type="conversation",
            message_count=len(messages),
            start_time=messages[0]["timestamp"] if messages else "",
            end_time=messages[-1]["timestamp"] if messages else ""
        )

        chunk_id = f"{chat_metadata.get('title', 'unknown').replace(' ', '_')}_{chunk_index}"

        return ConversationChunk(
            id=chunk_id,
            text=text,
            metadata=metadata
        )

    def _get_overlap_messages(self, messages: List[Dict[str, Any]], max_overlap: int) -> List[Dict[str, Any]]:
        """Get messages for overlap, staying within character limit."""
        overlap_messages = []
        overlap_length = 0

        # Take messages from the end backwards until we hit the overlap limit
        for message in reversed(messages):
            message_text = f"{message['user']}: {message['content']}"
            if overlap_length + len(message_text) > max_overlap:
                break
            overlap_messages.insert(0, message)
            overlap_length += len(message_text)

        return overlap_messages

class Reranker:
    """
    Cross-encoder reranker for improved retrieval precision.
    """

    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.model = CrossEncoder(model_name)

    def rerank(self, query: str, candidates: List[str], top_k: int = 5) -> List[Tuple[str, float, int]]:
        """
        Rerank candidate texts based on relevance to query.

        Args:
            query: Search query
            candidates: List of candidate texts
            top_k: Number of top results to return

        Returns:
            List of (text, score, original_index) tuples
        """
        if not candidates:
            return []

        # Create query-document pairs
        pairs = [[query, candidate] for candidate in candidates]

        # Get relevance scores
        scores = self.model.predict(pairs)

        # Sort by score (descending)
        scored_candidates = list(zip(candidates, scores, range(len(candidates))))
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        # Return top-k
        return scored_candidates[:top_k]

class RAGEngine:
    """
    Main RAG engine coordinating retrieval and generation.
    """

    def __init__(self, config: RAGConfig, vector_store: MilvusVectorStore):
        self.config = config
        self.vector_store = vector_store

        # Initialize components
        self.query_analyzer = QueryAnalyzer()
        self.chunker = ContextAwareChunker(
            chunk_size=config.chunk_size,
            overlap=config.chunk_overlap
        )
        self.reranker = Reranker() if config.retrieval_strategy.use_reranking else None

        # Initialize LLM client (placeholder - will be implemented)
        self.llm_client = None

        logger.info("RAG Engine initialized")

    def process_query(self, query: ChatQuery) -> ChatResponse:
        """
        Process a user query through the complete RAG pipeline.

        Args:
            query: User query object

        Returns:
            Chat response with generated answer and retrieved context
        """
        start_time = time.time()

        try:
            # Step 1: Analyze query
            query_analysis = self.query_analyzer.analyze_query(query.query)
            logger.info(f"Query analysis: {query_analysis.query_type}")

            # Step 2: Expand query if enabled
            expanded_queries = self._expand_query(query.query) if self.config.retrieval_strategy.expand_query else [query.query]

            # Step 3: Retrieve relevant chunks
            retrieved_chunks = self._retrieve_chunks(
                expanded_queries,
                query_analysis,
                limit=query.limit * 2  # Retrieve more for reranking
            )

            # Step 4: Rerank if enabled
            if self.reranker and len(retrieved_chunks) > query.limit:
                retrieved_chunks = self._rerank_chunks(query.query, retrieved_chunks, query.limit)

            # Step 5: Generate response
            response_text = self._generate_response(query.query, retrieved_chunks[:query.limit])

            # Step 6: Format response
            response = ChatResponse(
                query=query.query,
                response=response_text,
                retrieved_chunks=retrieved_chunks[:query.limit],
                processing_time=time.time() - start_time,
                model_used=self.config.llm_config.model
            )

            logger.info(f"Query processed in {response.processing_time:.2f}s")
            return response

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            # Return error response
            return ChatResponse(
                query=query.query,
                response=f"I apologize, but I encountered an error while processing your query: {str(e)}",
                retrieved_chunks=[],
                processing_time=time.time() - start_time,
                model_used=self.config.llm_config.model
            )

    def _expand_query(self, query: str) -> List[str]:
        """Expand query with synonyms and variations (basic implementation)."""
        # Placeholder - could use word embeddings or LLM for expansion
        expansions = [query]

        # Simple synonym expansion for common terms
        synonyms = {
            "find": ["locate", "search for", "get"],
            "show": ["display", "list", "give me"],
            "what": ["which", "what are"],
            "when": ["at what time", "on which date"]
        }

        for word, syns in synonyms.items():
            if word in query.lower():
                for syn in syns:
                    expanded = query.lower().replace(word, syn)
                    expansions.append(expanded.title())  # Restore capitalization

        return list(set(expansions))  # Remove duplicates

    def _retrieve_chunks(
        self,
        queries: List[str],
        analysis: QueryAnalysis,
        limit: int = 10
    ) -> List[RetrievedChunk]:
        """
        Retrieve relevant chunks using vector search.

        Args:
            queries: List of query strings (original + expansions)
            analysis: Query analysis results
            limit: Maximum chunks to retrieve

        Returns:
            List of retrieved chunks with scores
        """
        all_results = []

        # Build filter expression
        filter_expr = self._build_filter_expression(analysis)

        # Search with each query
        for query in queries:
            results = self.vector_store.search_similar(
                query_text=query,
                limit=limit,
                filter_expr=filter_expr
            )

            # Convert to RetrievedChunk objects
            for result in results:
                chunk = ConversationChunk(
                    id=result.id,
                    text=result.entity["text"],
                    metadata=result.entity
                )

                retrieved = RetrievedChunk(
                    chunk=chunk,
                    score=result.distance,  # Cosine similarity
                    rank=len(all_results)
                )
                all_results.append(retrieved)

        # Sort by score and deduplicate
        all_results.sort(key=lambda x: x.score, reverse=True)
        seen_ids = set()
        deduplicated = []

        for result in all_results:
            if result.chunk.id not in seen_ids:
                seen_ids.add(result.chunk.id)
                result.rank = len(deduplicated)
                deduplicated.append(result)

        return deduplicated[:limit]

    def _build_filter_expression(self, analysis: QueryAnalysis) -> Optional[str]:
        """Build Milvus filter expression from query analysis."""
        filters = []

        # Filter by chat title if specified
        # Note: This would need to be passed from the query
        # if analysis.chat_filter:
        #     filters.append(f"chat_title == '{analysis.chat_filter}'")

        # Add user filters
        if analysis.user_filters:
            user_conditions = [f"text like '%{user}%'" for user in analysis.user_filters]
            filters.append(f"({' or '.join(user_conditions)})")

        # Combine filters
        if filters:
            return " and ".join(filters)

        return None

    def _rerank_chunks(
        self,
        query: str,
        chunks: List[RetrievedChunk],
        top_k: int
    ) -> List[RetrievedChunk]:
        """Rerank chunks using cross-encoder."""
        if not self.reranker or not chunks:
            return chunks

        # Extract texts for reranking
        candidate_texts = [chunk.chunk.text for chunk in chunks]

        # Rerank
        reranked = self.reranker.rerank(query, candidate_texts, top_k=top_k)

        # Reconstruct RetrievedChunk objects with new scores
        reranked_chunks = []
        for text, score, original_index in reranked:
            original_chunk = chunks[original_index]
            reranked_chunk = RetrievedChunk(
                chunk=original_chunk.chunk,
                score=score,
                rank=len(reranked_chunks)
            )
            reranked_chunks.append(reranked_chunk)

        return reranked_chunks

    def _generate_response(self, query: str, retrieved_chunks: List[RetrievedChunk]) -> str:
        """
        Generate response using retrieved context.

        Args:
            query: Original user query
            retrieved_chunks: Retrieved context chunks

        Returns:
            Generated response text
        """
        if not retrieved_chunks:
            return "I couldn't find relevant information in the chat history to answer your question."

        # Combine context from retrieved chunks
        context_texts = []
        for chunk in retrieved_chunks:
            context_texts.append(f"[Context {chunk.rank + 1}]:\n{chunk.chunk.text}")

        context = "\n\n".join(context_texts)

        # Create prompt
        system_prompt = """You are a helpful assistant that answers questions based on Microsoft Teams chat conversations.
Use the provided context to give accurate, relevant answers. If the context doesn't contain enough information to fully answer the question, say so clearly.
Be concise but comprehensive, and reference specific conversations when relevant."""

        user_prompt = f"""Question: {query}

Context from Teams chats:
{context}

Please provide a helpful answer based on the above context."""

        # Generate response (placeholder - implement LLM integration)
        # For now, return a simple response
        response = f"Based on the Teams chat history, here's what I found relevant to your question:\n\n"

        for i, chunk in enumerate(retrieved_chunks[:3]):  # Show top 3 chunks
            response += f"{i+1}. From {chunk.chunk.metadata.chat_title}: {chunk.chunk.text[:200]}...\n"

        response += f"\n(This is a placeholder response. LLM integration to be implemented.)"

        return response

    def ingest_chat_data(self, chat_data: Dict[str, Any]) -> bool:
        """
        Ingest new chat data into the vector store.

        Args:
            chat_data: Parsed chat data

        Returns:
            True if ingestion successful
        """
        try:
            # Create chunks
            chunks = self.chunker.create_chunks(
                chat_data["messages"],
                chat_data["metadata"]
            )

            # Convert to vector documents
            from vector_store import create_vector_documents_from_chunks
            documents = create_vector_documents_from_chunks(chunks)

            # Store in vector database
            success = self.vector_store.insert_documents(documents)

            if success:
                logger.info(f"Successfully ingested {len(chunks)} chunks from chat")
            else:
                logger.error("Failed to ingest chat data")

            return success

        except Exception as e:
            logger.error(f"Error ingesting chat data: {e}")
            return False

if __name__ == "__main__":
    # Example usage
    from models import RAGConfig, MilvusCollectionConfig
    from vector_store import MilvusVectorStore

    # Initialize components
    config = RAGConfig()
    vector_store = MilvusVectorStore(collection_config=MilvusCollectionConfig())

    if vector_store.connect():
        engine = RAGEngine(config, vector_store)

        # Example query
        query = ChatQuery(query="What did the team discuss about the project deadline?")
        response = engine.process_query(query)

        print(f"Response: {response.response}")
        print(f"Processing time: {response.processing_time:.2f}s")
        print(f"Retrieved chunks: {len(response.retrieved_chunks)}")

    vector_store.disconnect()