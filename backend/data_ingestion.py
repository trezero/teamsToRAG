"""
Teams Chat Data Ingestion Module

Parses Microsoft Teams chat exports in Markdown format and converts them
into structured JSON data suitable for vector database storage.
"""

import re
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import logging

from models import ConversationChunk, ChunkMetadata

logger = logging.getLogger(__name__)

class TeamsChatParser:
    """
    Parser for Microsoft Teams chat Markdown exports.

    Handles the specific format of Teams exports including:
    - Header metadata (topic, chat type, message count, timestamps)
    - Date sections (## MM/DD/YYYY)
    - Messages as: **User Name** - HH:MM AM/PM
    - Multi-line messages, code blocks, links, and formatting
    """

    def __init__(self):
        # Regex patterns for parsing Teams Markdown
        self.header_pattern = re.compile(r'^# (.+)$', re.MULTILINE)
        self.metadata_pattern = re.compile(r'^\*\*(.+?):\*\*\s*(.+)$', re.MULTILINE)
        self.date_section_pattern = re.compile(r'^## (\d{1,2}/\d{1,2}/\d{4})$', re.MULTILINE)
        self.message_pattern = re.compile(
            r'^\*\*(.+?)\*\*\s*-\s*(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))\s*$',
            re.MULTILINE
        )

    def parse_file(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a single Teams chat Markdown file.

        Args:
            file_path: Path to the Markdown file

        Returns:
            Structured chat data dictionary
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Failed to read file {file_path}: {e}")
            raise

        return self.parse_content(content, file_path)

    def parse_content(self, content: str, source_file: str = "") -> Dict[str, Any]:
        """
        Parse Teams chat content from Markdown string.

        Args:
            content: Raw Markdown content
            source_file: Optional source file path for metadata

        Returns:
            Structured chat data dictionary
        """
        # Extract header and metadata
        chat_metadata = self._extract_metadata(content)

        # Split content into date sections
        date_sections = self._split_by_date(content)

        # Parse messages from each date section
        messages = []
        for date_str, section_content in date_sections.items():
            section_messages = self._parse_date_section(date_str, section_content)
            messages.extend(section_messages)

        # Create structured output
        chat_data = {
            "metadata": chat_metadata,
            "messages": messages,
            "source_file": source_file,
            "total_messages": len(messages),
            "parsed_at": datetime.now().isoformat()
        }

        logger.info(f"Parsed {len(messages)} messages from chat")
        return chat_data

    def _extract_metadata(self, content: str) -> Dict[str, Any]:
        """Extract chat metadata from the header section."""
        metadata = {}

        # Extract chat title
        header_match = self.header_pattern.search(content)
        if header_match:
            metadata["title"] = header_match.group(1).strip()

        # Extract metadata fields
        for match in self.metadata_pattern.finditer(content):
            key = match.group(1).lower().replace(' ', '_')
            value = match.group(2).strip()

            # Parse specific fields
            if key == "chat_type":
                metadata[key] = value
            elif key == "message_count":
                metadata[key] = int(value) if value.isdigit() else value
            elif key in ["exported_on", "started_on"]:
                # Parse dates - Teams format varies, try multiple patterns
                try:
                    # Try MM/DD/YYYY format
                    metadata[key] = datetime.strptime(value, "%m/%d/%Y").date().isoformat()
                except ValueError:
                    try:
                        # Try other common formats
                        metadata[key] = datetime.fromisoformat(value.replace(' ', 'T')).date().isoformat()
                    except ValueError:
                        metadata[key] = value  # Keep as string if parsing fails
            else:
                metadata[key] = value

        return metadata

    def _split_by_date(self, content: str) -> Dict[str, str]:
        """Split content into sections by date."""
        date_sections = {}

        # Find all date section headers
        date_matches = list(self.date_section_pattern.finditer(content))

        for i, match in enumerate(date_matches):
            date_str = match.group(1)
            start_pos = match.end()

            # Find end position (next date section or end of content)
            if i + 1 < len(date_matches):
                end_pos = date_matches[i + 1].start()
            else:
                end_pos = len(content)

            # Extract section content
            section_content = content[start_pos:end_pos].strip()
            date_sections[date_str] = section_content

        return date_sections

    def _parse_date_section(self, date_str: str, content: str) -> List[Dict[str, Any]]:
        """Parse messages from a single date section."""
        messages = []

        # Split content by message pattern
        message_parts = self.message_pattern.split(content)

        # Process messages (pattern splits on message headers)
        for i in range(1, len(message_parts), 3):  # Skip first empty part, then take every 3 parts
            if i + 2 < len(message_parts):
                user_name = message_parts[i].strip()
                time_str = message_parts[i + 1].strip()
                message_content = message_parts[i + 2].strip()

                # Parse timestamp
                timestamp = self._parse_timestamp(date_str, time_str)

                # Clean and structure message content
                structured_message = self._structure_message(
                    user_name, message_content, timestamp
                )

                if structured_message:
                    messages.append(structured_message)

        return messages

    def _parse_timestamp(self, date_str: str, time_str: str) -> str:
        """Parse date and time into ISO format timestamp."""
        try:
            # Combine date and time
            datetime_str = f"{date_str} {time_str}"

            # Parse using common Teams format (with seconds)
            dt = datetime.strptime(datetime_str, "%m/%d/%Y %I:%M:%S %p")
            return dt.isoformat()
        except ValueError as e:
            logger.warning(f"Failed to parse timestamp '{datetime_str}': {e}")
            # Return a reasonable default
            return datetime.now().isoformat()

    def _structure_message(self, user_name: str, content: str, timestamp: str) -> Optional[Dict[str, Any]]:
        """Structure a single message with metadata."""
        if not content.strip():
            return None

        # Extract message components
        message_data = {
            "user": user_name,
            "timestamp": timestamp,
            "content": self._clean_content(content),
            "message_type": self._detect_message_type(content),
            "has_attachments": "<<" in content or "[File:" in content,
            "has_code": "```" in content,
            "has_links": "http" in content.lower() or "www." in content.lower()
        }

        return message_data

    def _clean_content(self, content: str) -> str:
        """Clean and normalize message content."""
        # Remove excessive whitespace
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
        return content.strip()

    def _detect_message_type(self, content: str) -> str:
        """Detect the type of message based on content."""
        if "[File:" in content or "<<" in content:
            return "file_share"
        elif "```" in content:
            return "code"
        elif content.strip().startswith(">"):
            return "quote"
        elif len(content.strip()) < 50 and "?" in content:
            return "question"
        else:
            return "text"

def create_chunks_from_messages(chat_data: Dict[str, Any], chunk_size: int = 1000) -> List[ConversationChunk]:
    """
    Create conversation chunks from parsed messages.

    Args:
        chat_data: Parsed chat data from TeamsChatParser
        chunk_size: Maximum characters per chunk

    Returns:
        List of ConversationChunk objects suitable for vector storage
    """
    messages = chat_data["messages"]
    chunks = []

    current_chunk = []
    current_length = 0

    for message in messages:
        message_text = f"{message['user']}: {message['content']}"
        message_length = len(message_text)

        # If adding this message would exceed chunk size, save current chunk
        if current_chunk and current_length + message_length > chunk_size:
            chunk_text = "\n".join(current_chunk)
            
            # Create ChunkMetadata object
            chunk_metadata = ChunkMetadata(
                chat_title=chat_data["metadata"].get("title", ""),
                source_file=chat_data.get("source_file", ""),
                chunk_type="conversation",
                message_count=len(current_chunk),
                start_time=current_chunk[0].split(": ", 1)[0] if current_chunk else "",
                end_time=current_chunk[-1].split(": ", 1)[0] if current_chunk else ""
            )
            
            # Create ConversationChunk object
            chunk = ConversationChunk(
                id=f"{chat_data['metadata'].get('title', 'unknown')}_{len(chunks)}",
                text=chunk_text,
                metadata=chunk_metadata
            )
            chunks.append(chunk)
            current_chunk = []
            current_length = 0

        current_chunk.append(message_text)
        current_length += message_length

    # Add remaining chunk
    if current_chunk:
        chunk_text = "\n".join(current_chunk)
        
        # Create ChunkMetadata object
        chunk_metadata = ChunkMetadata(
            chat_title=chat_data["metadata"].get("title", ""),
            source_file=chat_data.get("source_file", ""),
            chunk_type="conversation",
            message_count=len(current_chunk),
            start_time=current_chunk[0].split(": ", 1)[0] if current_chunk else "",
            end_time=current_chunk[-1].split(": ", 1)[0] if current_chunk else ""
        )
        
        # Create ConversationChunk object
        chunk = ConversationChunk(
            id=f"{chat_data['metadata'].get('title', 'unknown')}_{len(chunks)}",
            text=chunk_text,
            metadata=chunk_metadata
        )
        chunks.append(chunk)

    logger.info(f"Created {len(chunks)} chunks from {len(messages)} messages")
    return chunks

if __name__ == "__main__":
    # Example usage
    import sys

    if len(sys.argv) != 2:
        print("Usage: python data_ingestion.py <teams_chat.md>")
        sys.exit(1)

    file_path = sys.argv[1]
    parser = TeamsChatParser()

    try:
        chat_data = parser.parse_file(file_path)
        chunks = create_chunks_from_messages(chat_data)

        # Output structured data
        output = {
            "chat_data": chat_data,
            "chunks": chunks
        }

        print(json.dumps(output, indent=2, ensure_ascii=False))

    except Exception as e:
        logger.error(f"Failed to parse {file_path}: {e}")
        sys.exit(1)