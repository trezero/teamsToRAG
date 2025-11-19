# AI Agent RAG Strategy Decision Guide

This document provides a decision-making framework for selecting the optimal Retrieval-Augmented Generation (RAG) strategy or combination of strategies for a given dataset. The choice should be based on the dataset's format, structure, and the nature of the user's query.

## Core Principle
An optimal RAG system often combines 3 to 5 different strategies.

## Core Recommended Stack
Based on general effectiveness and versatility, the following combination is a powerful starting point:

- **Context-aware Chunking (Data Prep)**: Ensures that the semantic structure of your documents is preserved during indexing.
- **Re-ranking (Retrieval)**: Improves precision by fetching a larger set of initial results and then using a more advanced model to select the most relevant ones for the LLM.
- **Agentic RAG (Retrieval)**: Provides the flexibility to choose how to search (e.g., search small chunks vs. read a whole document) based on the query.

## Quick Reference: Strategy by Data Format

| Data Format / Characteristic | Recommended RAG Strategy |
|------------------------------|--------------------------|
| Interconnected Data (e.g., user networks, org charts, complex wikis) | Knowledge Graphs |
| Structured/Hierarchical Docs (e.g., books, manuals, code) | Hierarchical RAG, Context-aware Chunking |
| Long, Dense Documents (e.g., research papers, legal text) | Contextual Retrieval, Hierarchical RAG |
| Heterogeneous Dataset (e.g., mix of PDFs, CSVs, short notes) | Agentic RAG |
| Domain-Specific (e.g., legal, medical, financial text) | Fine-tune Embeddings |
| General / Unstructured Text | Start with Re-ranking + Context-aware Chunking |
| Ambiguous User Queries | Query Expansion or Multi-query RAG |
| Need for High Precision | Re-ranking, Self-reflective RAG |

## Export to Sheets
*(Note: This section may refer to exporting the quick reference table to spreadsheet software for further analysis.)*

## Detailed RAG Strategies

### 1. Data Preparation Strategies (Indexing)
These strategies relate to how data is processed before it is stored.

#### Context-aware Chunking
**Principle**: A data preparation strategy that splits documents along their "natural boundaries" (e.g., sections, paragraphs, code blocks) rather than by a fixed character count.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: The dataset consists of semi-structured or structured documents like code, markdown, or technical manuals.
- **Why**: Arbitrary splitting (like 1000-character chunks) can break semantically important groups of text, leading to inaccurate embeddings. This method preserves the document's inherent structure.

**Pros**:
- Maintains document structure and semantic integrity.
- Relatively fast and low-cost to implement.

**Cons**:
- More complex to set up than simple fixed-size chunking.

#### Contextual Retrieval
**Principle**: A data preparation strategy where each chunk is prepended with LLM-generated metadata describing how that chunk fits within the overall document (e.g., "This chunk is from the 'Methodology' section and discusses...").

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: The dataset contains long, dense documents where a chunk's meaning is highly dependent on its location and surrounding context (e.g., legal texts, research papers).

**Pros**:
- Enriches every chunk with valuable context, improving retrieval accuracy.

**Cons**:
- Significantly slower and more expensive to index, as it requires an LLM call for every chunk created.

#### Fine-tune Embeddings
**Principle**: This strategy involves fine-tuning the embedding model itself on a domain-specific dataset.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: The dataset is highly specialized (e.g., legal, medical, financial) and general-purpose semantic similarity is not as effective as domain-specific nuances.
- **Use When**: You need similarity to be based on a different metric, such as sentiment rather than just semantic meaning.

**Pros**:
- Can provide significant (5-10%) accuracy gains in niche domains.
- Allows smaller, fine-tuned models to outperform larger, generic ones.

**Cons**:
- Requires a large, high-quality training dataset.
- Adds significant infrastructure and model maintenance overhead.

### 2. Retrieval & Generation Strategies (Querying)
These strategies relate to how data is fetched and processed at query time.

#### Re-ranking
**Principle**: A two-step retrieval process. First, retrieve a large number (e.g., 20-50) of candidate chunks. Second, use a specialized, more powerful model (like a cross-encoder) to re-rank these chunks and pass only the top-k (e.g., 3-5) most relevant ones to the LLM.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: This is a highly versatile, generally applicable strategy. It's especially useful when initial semantic search results are "noisy" or return many "somewhat relevant" chunks.

**Pros**:
- Considers a wider range of knowledge without overwhelming the LLM's context window.
- Significantly increases the relevance of the final context.

**Cons**:
- Slightly slower and more expensive at query time due to the second model call.

#### Agentic RAG
**Principle**: An LLM-based agent is given the choice of how to search the knowledge base. It can, for example, choose between performing a semantic search on small chunks or retrieving and reading an entire document.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: The dataset is heterogeneous, containing a mix of different data types (e.g., many small notes, large PDF reports, structured tables).
- **Why**: The agent can dynamically decide if a query is best answered by a small snippet (e.g., "What is X?") or by reading a whole file (e.g., "Summarize the report from last week.").

**Pros**:
- Extremely flexible and powerful.

**Cons**:
- Less predictable than non-agentic-based retrieval.
- Requires clear instructions and well-defined tools for the agent.

#### Hierarchical RAG
**Principle**: Stores data in layers with parent-child relationships (e.g., parent document -> child sections -> grandchild paragraphs). This allows you to "search small, return big."

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: The dataset consists of documents with a clear internal hierarchy, such as books (chapters, sections, paragraphs) or technical manuals.
- **Why**: A query can precisely match a small chunk (a paragraph), and the system can then retrieve the full parent section or document, providing the LLM with complete context. This can be seen as a specific implementation of Agentic RAG.

**Pros**:
- Excellent balance of search precision and contextual richness.

**Cons**:
- More complex data modeling and retrieval logic.

#### Knowledge Graphs
**Principle**: Combines traditional vector search with a graph database that stores entities and their relationships.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: The dataset is highly interconnected, and the relationships between data points are as important as the content itself (e.g., an organizational chart, a social network, a complex set of technical specifications).

**Pros**:
- Allows the agent to answer questions about relationships (e.g., "Who reports to Manager X?" or "Which components use part Y?"), which vector search cannot.

**Cons**:
- Much slower and more expensive to create, as it often requires an LLM to extract all entities and relationships from the raw text.

#### Self-reflective RAG
**Principle**: A self-correcting loop. After an initial search, an LLM acts as a "grader" to score the relevance of the retrieved chunks. If the score is too low, the agent refines the query and searches again.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: This is a data-agnostic, query-side strategy. Use it when retrieval quality is critical and you need to build in a validation step to prevent low-quality or irrelevant answers.

**Pros**:
- Acts as a self-correcting mechanism to improve answer quality.

**Cons**:
- Slower and more expensive at query time due to the extra LLM "grading" call and potential retries.

#### Query Expansion
**Principle**: Uses an LLM to take the user's initial query and expand it to be more specific or to add more relevant details before sending it to the vector database.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: This is a data-agnostic, query-side strategy. Use it when user queries are often broad, short, or ambiguous, and would benefit from more specific detail to find the best-matching chunks.

**Pros**:
- Can improve retrieval precision for vague queries.

**Cons**:
- Slower query time (extra LLM call for every search).

#### Multi-query RAG
**Principle**: Uses an LLM to generate multiple different variants of the user's query, then searches for all of them in parallel and combines the results.

**Decision Criteria (Dataset & Use Case)**:
- **Use When**: This is a data-agnostic, query-side strategy. Use it for complex user questions that could be interpreted in several different ways.

**Pros**:
- Provides more comprehensive coverage by searching from multiple "angles."

**Cons**:
- More expensive at query time (one LLM call + multiple parallel database queries).