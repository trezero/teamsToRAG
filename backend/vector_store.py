"""
Vector Store Module for Milvus Integration

Handles connection to Milvus vector database, collection management,
and vector operations for Teams chat data.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from pymilvus import (
    connections,
    Collection,
    CollectionSchema,
    FieldSchema,
    DataType,
    utility
)
from sentence_transformers import SentenceTransformer
import numpy as np

from models import (
    VectorDocument,
    MilvusCollectionConfig,
    SearchRequest,
    SearchResult,
    ConversationChunk
)

logger = logging.getLogger(__name__)

class MilvusVectorStore:
    """
    Milvus vector database client for Teams chat RAG system.

    Handles:
    - Collection creation and management
    - Vector embeddings and storage
    - Similarity search operations
    - Index optimization
    """

    def __init__(
        self,
        host: str = "localhost",
        port: str = "19530",
        collection_config: Optional[MilvusCollectionConfig] = None,
        embedding_model: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize Milvus connection and embedding model.

        Args:
            host: Milvus server host
            port: Milvus server port
            collection_config: Collection configuration
            embedding_model: Sentence transformer model name
        """
        self.host = host
        self.port = port
        self.collection_config = collection_config or MilvusCollectionConfig()
        self.embedding_model_name = embedding_model

        # Initialize embedding model
        self.embedding_model = SentenceTransformer(embedding_model)
        self.embedding_dimension = self.embedding_model.get_sentence_embedding_dimension()

        # Update collection config with correct dimension
        self.collection_config.dimension = self.embedding_dimension

        # Connection and collection
        self.collection: Optional[Collection] = None
        self._connected = False

    def connect(self) -> bool:
        """Establish connection to Milvus server."""
        try:
            # Disconnect first if already connected
            try:
                connections.disconnect(alias="default")
            except:
                pass

            connections.connect(
                alias="default",
                host=self.host,
                port=self.port,
                timeout=30  # Increased timeout for Docker environments
            )
            self._connected = True
            logger.info(f"Connected to Milvus at {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Milvus: {e}")
            self._connected = False
            return False

    def disconnect(self):
        """Disconnect from Milvus server."""
        try:
            connections.disconnect(alias="default")
            self._connected = False
            logger.info("Disconnected from Milvus")
        except Exception as e:
            logger.warning(f"Error disconnecting from Milvus: {e}")

    def create_collection(self, drop_existing: bool = False) -> bool:
        """
        Create the Teams chat collection with appropriate schema.

        Args:
            drop_existing: Whether to drop existing collection first

        Returns:
            True if collection created successfully
        """
        if not self._connected:
            logger.error("Not connected to Milvus")
            return False

        try:
            # Drop existing collection if requested
            if drop_existing and utility.has_collection(self.collection_config.name):
                utility.drop_collection(self.collection_config.name)
                logger.info(f"Dropped existing collection: {self.collection_config.name}")

            # Check if collection already exists
            if utility.has_collection(self.collection_config.name):
                logger.info(f"Collection {self.collection_config.name} already exists")
                self.collection = Collection(self.collection_config.name)
                return True

            # Define schema
            fields = [
                FieldSchema(
                    name="id",
                    dtype=DataType.VARCHAR,
                    max_length=255,
                    is_primary=True
                ),
                FieldSchema(
                    name="text",
                    dtype=DataType.VARCHAR,
                    max_length=65535  # Maximum for VARCHAR
                ),
                FieldSchema(
                    name="embedding",
                    dtype=DataType.FLOAT_VECTOR,
                    dim=self.embedding_dimension
                ),
                FieldSchema(
                    name="chat_title",
                    dtype=DataType.VARCHAR,
                    max_length=255
                ),
                FieldSchema(
                    name="source_file",
                    dtype=DataType.VARCHAR,
                    max_length=500
                ),
                FieldSchema(
                    name="chunk_type",
                    dtype=DataType.VARCHAR,
                    max_length=50
                ),
                FieldSchema(
                    name="message_count",
                    dtype=DataType.INT64
                ),
                FieldSchema(
                    name="start_time",
                    dtype=DataType.VARCHAR,
                    max_length=50
                ),
                FieldSchema(
                    name="end_time",
                    dtype=DataType.VARCHAR,
                    max_length=50
                )
            ]

            schema = CollectionSchema(
                fields=fields,
                description=self.collection_config.description
            )

            # Create collection
            self.collection = Collection(
                name=self.collection_config.name,
                schema=schema
            )

            # Create index on vector field
            index_params = {
                "metric_type": "COSINE",
                "index_type": "HNSW",
                "params": {"M": 16, "efConstruction": 256}
            }

            self.collection.create_index(
                field_name="embedding",
                index_params=index_params
            )

            # Load collection into memory
            self.collection.load()

            logger.info(f"Created collection: {self.collection_config.name}")
            return True

        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            return False

    def insert_documents(self, documents: List[VectorDocument]) -> bool:
        """
        Insert documents with embeddings into the collection.

        Args:
            documents: List of documents to insert

        Returns:
            True if insertion successful
        """
        if not self.collection:
            logger.error("Collection not initialized")
            return False

        try:
            # Prepare data for insertion
            ids = [doc.id for doc in documents]
            texts = [doc.text for doc in documents]
            embeddings = []

            # Generate embeddings if not provided
            for doc in documents:
                if doc.embedding is not None:
                    embeddings.append(doc.embedding)
                else:
                    embedding = self.embedding_model.encode(doc.text).tolist()
                    embeddings.append(embedding)

            # Extract metadata fields
            chat_titles = [doc.metadata.get("chat_title", "") for doc in documents]
            source_files = [doc.metadata.get("source_file", "") for doc in documents]
            chunk_types = [doc.metadata.get("chunk_type", "conversation") for doc in documents]
            message_counts = [doc.metadata.get("message_count", 0) for doc in documents]
            start_times = [doc.metadata.get("start_time", "") for doc in documents]
            end_times = [doc.metadata.get("end_time", "") for doc in documents]

            # Insert data
            entities = [
                ids,
                texts,
                embeddings,
                chat_titles,
                source_files,
                chunk_types,
                message_counts,
                start_times,
                end_times
            ]

            insert_result = self.collection.insert(entities)

            # Flush to ensure data persistence
            self.collection.flush()

            logger.info(f"Inserted {len(documents)} documents into collection")
            return True

        except Exception as e:
            logger.error(f"Failed to insert documents: {e}")
            return False

    def search_similar(
        self,
        query_text: str,
        limit: int = 10,
        filter_expr: Optional[str] = None,
        **kwargs
    ) -> List[SearchResult]:
        """
        Search for similar documents using vector similarity.

        Args:
            query_text: Text to search for
            limit: Maximum number of results
            filter_expr: Milvus filter expression
            **kwargs: Additional search parameters

        Returns:
            List of search results with scores
        """
        if not self.collection:
            logger.error("Collection not initialized")
            return []

        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query_text).tolist()

            # Prepare search parameters
            search_params = {
                "metric_type": "COSINE",
                "params": {"ef": 128}  # Search parameter for HNSW
            }

            # Perform search
            self.collection.load()  # Ensure collection is loaded

            search_results = self.collection.search(
                data=[query_embedding],
                anns_field="embedding",
                param=search_params,
                limit=limit,
                expr=filter_expr,
                output_fields=["id", "text", "chat_title", "source_file", "chunk_type", "message_count", "start_time", "end_time"]
            )

            # Format results
            results = []
            for hits in search_results:
                for hit in hits:
                    result = SearchResult(
                        id=hit.entity.get("id"),
                        distance=hit.distance,
                        entity={
                            "text": hit.entity.get("text"),
                            "chat_title": hit.entity.get("chat_title"),
                            "source_file": hit.entity.get("source_file"),
                            "chunk_type": hit.entity.get("chunk_type"),
                            "message_count": hit.entity.get("message_count"),
                            "start_time": hit.entity.get("start_time"),
                            "end_time": hit.entity.get("end_time")
                        }
                    )
                    results.append(result)

            logger.info(f"Found {len(results)} similar documents")
            return results

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection."""
        if not self.collection:
            return {"error": "Collection not initialized"}

        try:
            stats = {
                "name": self.collection.name,
                "num_entities": self.collection.num_entities,
                "schema": str(self.collection.schema),
                "indexes": [str(index) for index in self.collection.indexes]
            }
            return stats
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"error": str(e)}

    def delete_by_filter(self, filter_expr: str) -> bool:
        """
        Delete entities matching a filter expression.

        Args:
            filter_expr: Milvus filter expression

        Returns:
            True if deletion successful
        """
        if not self.collection:
            logger.error("Collection not initialized")
            return False

        try:
            self.collection.delete(expr=filter_expr)
            self.collection.flush()
            logger.info(f"Deleted entities matching filter: {filter_expr}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete entities: {e}")
            return False

    def optimize_index(self) -> bool:
        """Optimize the vector index for better search performance."""
        if not self.collection:
            logger.error("Collection not initialized")
            return False

        try:
            # Rebuild index with optimized parameters
            self.collection.drop_index()
            index_params = {
                "metric_type": "COSINE",
                "index_type": "HNSW",
                "params": {"M": 16, "efConstruction": 256}
            }
            self.collection.create_index(
                field_name="embedding",
                index_params=index_params
            )
            logger.info("Index optimized")
            return True
        except Exception as e:
            logger.error(f"Failed to optimize index: {e}")
            return False

def create_vector_documents_from_chunks(chunks: List[ConversationChunk]) -> List[VectorDocument]:
    """
    Convert conversation chunks to vector documents.

    Args:
        chunks: List of conversation chunks

    Returns:
        List of vector documents ready for storage
    """
    documents = []
    for chunk in chunks:
        doc = VectorDocument(
            id=chunk.id,
            text=chunk.text,
            metadata=chunk.metadata.dict()
        )
        documents.append(doc)

    return documents

if __name__ == "__main__":
    # Example usage and testing
    import sys

    # Initialize vector store
    vector_store = MilvusVectorStore()

    # Connect and create collection
    if vector_store.connect():
        if vector_store.create_collection(drop_existing=True):
            print("Collection created successfully")

            # Print collection stats
            stats = vector_store.get_collection_stats()
            print(f"Collection stats: {stats}")
        else:
            print("Failed to create collection")
    else:
        print("Failed to connect to Milvus")

    vector_store.disconnect()