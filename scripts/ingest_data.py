#!/usr/bin/env python3
"""
Data Ingestion Script for Teams RAG Application

Command-line tool to ingest Teams chat data into the vector database.
"""

import argparse
import logging
import sys
import os
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from data_ingestion import TeamsChatParser, create_chunks_from_messages
from vector_store import MilvusVectorStore, create_vector_documents_from_chunks
from models import MilvusCollectionConfig

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def ingest_file(file_path: str, vector_store: MilvusVectorStore, chunk_size: int = 1000) -> bool:
    """
    Ingest a single Teams chat file.

    Args:
        file_path: Path to the Markdown file
        vector_store: Connected vector store instance
        chunk_size: Maximum characters per chunk

    Returns:
        True if ingestion successful
    """
    try:
        logger.info(f"Processing file: {file_path}")

        # Parse chat data
        parser = TeamsChatParser()
        chat_data = parser.parse_file(file_path)

        logger.info(f"Parsed {chat_data['total_messages']} messages from '{chat_data['metadata'].get('title', 'Unknown')}'")

        # Create chunks
        chunks = create_chunks_from_messages(chat_data, chunk_size)
        logger.info(f"Created {len(chunks)} chunks")

        # Convert to vector documents
        documents = create_vector_documents_from_chunks(chunks)

        # Store in vector database
        success = vector_store.insert_documents(documents)

        if success:
            logger.info(f"Successfully stored {len(documents)} vectors in database")
            return True
        else:
            logger.error("Failed to store vectors in database")
            return False

    except Exception as e:
        logger.error(f"Failed to ingest {file_path}: {e}")
        return False

def ingest_directory(directory_path: str, vector_store: MilvusVectorStore, chunk_size: int = 1000) -> tuple[int, int]:
    """
    Ingest all Markdown files from a directory.

    Args:
        directory_path: Path to directory containing Markdown files
        vector_store: Connected vector store instance
        chunk_size: Maximum characters per chunk

    Returns:
        Tuple of (successful_ingests, total_files)
    """
    directory = Path(directory_path)

    if not directory.exists():
        logger.error(f"Directory does not exist: {directory_path}")
        return 0, 0

    # Find all .md files
    md_files = list(directory.glob("**/*.md"))

    if not md_files:
        logger.warning(f"No .md files found in {directory_path}")
        return 0, 0

    logger.info(f"Found {len(md_files)} Markdown files to process")

    successful = 0
    total = len(md_files)

    for file_path in md_files:
        if ingest_file(str(file_path), vector_store, chunk_size):
            successful += 1

    return successful, total

def main():
    parser = argparse.ArgumentParser(description="Ingest Teams chat data into vector database")
    parser.add_argument(
        "input",
        help="Path to Teams chat Markdown file or directory containing Markdown files"
    )
    parser.add_argument(
        "--host",
        default="localhost",
        help="Milvus server host (default: localhost)"
    )
    parser.add_argument(
        "--port",
        default="19530",
        help="Milvus server port (default: 19530)"
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=1000,
        help="Maximum characters per chunk (default: 1000)"
    )
    parser.add_argument(
        "--drop-existing",
        action="store_true",
        help="Drop existing collection before creating new one"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Initialize vector store
    collection_config = MilvusCollectionConfig()
    vector_store = MilvusVectorStore(
        host=args.host,
        port=args.port,
        collection_config=collection_config
    )

    try:
        # Connect to Milvus
        logger.info(f"Connecting to Milvus at {args.host}:{args.port}")
        if not vector_store.connect():
            logger.error("Failed to connect to Milvus")
            sys.exit(1)

        # Create collection
        if not vector_store.create_collection(drop_existing=args.drop_existing):
            logger.error("Failed to create collection")
            sys.exit(1)

        # Check if input is file or directory
        input_path = Path(args.input)

        if input_path.is_file():
            # Ingest single file
            success = ingest_file(args.input, vector_store, args.chunk_size)
            if success:
                logger.info("Ingestion completed successfully")
            else:
                logger.error("Ingestion failed")
                sys.exit(1)

        elif input_path.is_dir():
            # Ingest directory
            successful, total = ingest_directory(args.input, vector_store, args.chunk_size)
            logger.info(f"Ingestion completed: {successful}/{total} files processed successfully")

            if successful != total:
                logger.warning(f"Some files failed to ingest: {total - successful} failures")
                sys.exit(1)

        else:
            logger.error(f"Input path does not exist: {args.input}")
            sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Ingestion interrupted by user")
        sys.exit(1)

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

    finally:
        # Clean up
        vector_store.disconnect()
        logger.info("Disconnected from Milvus")

if __name__ == "__main__":
    main()