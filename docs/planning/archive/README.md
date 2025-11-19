# Planning Archive

This directory contains historical Product Requirement Documents (PRDs), implementation notes, and design artifacts that show the evolution of the Teams to RAG project. These documents are preserved for historical context and to help understand why certain architectural decisions were made.

## Why Archive These Documents?

These documents represent the **planning and implementation journey** of the project. While they are no longer actively used for day-to-day development, they provide valuable context:

1. **Understanding Design Decisions**: See the reasoning behind key architectural choices
2. **Learning from Implementation**: Review the challenges faced and solutions discovered
3. **Historical Context**: Understand how the project evolved from CLI tool to full RAG application
4. **Reference Material**: Consult original requirements when evaluating new features

## Archive Organization

### Phase 1: Incremental Updates Implementation

The Phase 1 documents tell the story of implementing smart incremental updates for Teams chat exports, working around Microsoft Graph API limitations.

#### **phase1-incremental-updates-plan.md**
- **Original**: `teamsUpdatePlan.md`
- **What**: Strategic plan for implementing incremental updates
- **Key Content**:
  - Analysis of Graph API filter capabilities (chats vs channels)
  - Comparison of update strategies (server-side vs client-side filtering)
  - Recommended implementation approach
  - Testing scenarios and success criteria

**Why This Matters**: Shows the research and decision-making process that led to the client-side filtering approach (see [Design Decisions](../design-decisions.md#client-side-filtering-for-incremental-updates)).

#### **phase1-incremental-updates-changes.md**
- **Original**: `CHANGES_PHASE1.md`
- **What**: Summary of changes made during Phase 1 implementation
- **Key Content**:
  - Fixed chat filter syntax for Graph API
  - Removed unsupported channel filters
  - Added overwrite function for full refresh
  - Updated main logic for differentiated handling

**Why This Matters**: Documents the actual code changes and their rationale.

#### **phase1-incremental-updates-final.md**
- **Original**: `IMPLEMENTATION_FINAL.md`
- **What**: Final implementation summary and key learnings
- **Key Content**:
  - Root cause analysis of the Graph API filter error
  - Client-side filtering solution with early termination
  - Performance characteristics (best/typical/worst case)
  - Lessons learned about Graph API documentation inconsistencies

**Why This Matters**: The "lessons learned" section provides insights for future API integrations.

### Filename Sanitization Change

#### **change-filename-sanitization.md**
- **Original**: `FILENAME_UPDATE.md`
- **What**: Implementation notes for using human-readable chat names in filenames
- **Key Content**:
  - Before/after examples of filename changes
  - Sanitization rules for cross-platform compatibility
  - Incremental update compatibility considerations
  - Fallback behavior for unnamed chats

**Why This Matters**: Documents a user-facing change that improved the experience significantly.

### Product Requirement Documents (PRDs)

These PRDs represent planned features at various stages of implementation. They show the original vision and help evaluate whether current implementation matches intent.

#### **prd-interactive-menu.md**
- **Original**: `addFindChatPRD.md`
- **What**: PRD for adding interactive chat/channel discovery to the CLI tool
- **Status**: ✅ **Implemented** in current version
- **Key Content**:
  - User experience flows for finding chats and channels
  - Technical implementation approach
  - Integration with existing authentication
  - Migration path from bash script

**Why This Matters**: Shows the planned UX that drove the interactive menu implementation. Compare with actual implementation to see what changed and why.

#### **prd-vector-export.md**
- **Original**: `bulkExportToVectorDBPRD.md`
- **What**: PRD for bulk export of cached chats to vector database
- **Status**: 🚧 **Partially Implemented** (manual ingestion works, automated bulk export pending)
- **Key Content**:
  - RAG search interface design
  - Chunking and embedding strategy
  - Incremental indexing approach
  - Performance targets (15-20 minutes for 1500 chats)

**Why This Matters**: Represents the vision for automated knowledge base building. Phase 5 of the roadmap builds on this PRD.

#### **prd-unified-knowledge-base.md**
- **Original**: `unifiedTeamsKnowledgebasePRD.md`
- **What**: PRD for dual-storage system (vector + graph) with Docker deployment
- **Status**: 🚧 **Partially Implemented** (infrastructure complete, agentic search pending)
- **Key Content**:
  - Dual storage architecture (ChromaDB + Neo4j)
  - Docker-first deployment strategy
  - Agentic query routing concept
  - LLM-based entity extraction and Cypher generation

**Why This Matters**: The most comprehensive PRD, describing the full vision for the knowledge base. Current Docker deployment directly implements this PRD's Phase 1-2.

#### **user-stories-knowledge-base.md**
- **Original**: `USER_STORIES.md`
- **What**: Detailed user stories for the unified knowledge base feature
- **Status**: 📋 **Reference Material** for Phase 5+ implementation
- **Key Content**:
  - Organized by epic (Docker, DB Setup, Pipelines, Search, etc.)
  - Acceptance criteria for each story
  - Technical implementation notes
  - Definition of done for each feature

**Why This Matters**: Provides granular implementation details for RAG features. Use as a checklist when implementing Phase 5 features.

### Docker Implementation Notes

#### **docker-setup-notes.md**
- **Original**: `DOCKER_SETUP_NOTES.md`
- **What**: Configuration decisions and notes for Docker deployment
- **Key Content**:
  - Why no external ports by default
  - External Ollama connection approach
  - Network topology and service communication
  - Troubleshooting common Docker issues

**Why This Matters**: Explains the reasoning behind Docker configuration choices (see [Design Decisions](../design-decisions.md#no-external-ports-by-default)).

## How to Use This Archive

### When Evaluating New Features
1. Check if similar functionality was planned in a PRD
2. Review the original requirements and use cases
3. Consider what's changed since the PRD was written

### When Debugging Issues
1. Consult implementation notes for context on how features work
2. Review known limitations documented in PRDs
3. Check if similar issues were addressed in Phase 1 notes

### When Onboarding New Contributors
1. Read Phase 1 documents to understand the implementation journey
2. Review PRDs to see the original vision and what's still pending
3. Consult Design Decisions doc (references these archives)

## What's NOT Archived

The following documents remain active and are updated regularly:
- **README.md**: Main project overview (root directory)
- **CLAUDE.md**: Developer context for Claude Code (root directory)
- **docs/planning/roadmap.md**: Current roadmap and status
- **docs/planning/design-decisions.md**: Living document of key decisions
- **docs/developer/**: Active developer documentation

## Contributing to the Archive

### When to Add Documents
Archive documents when:
- A feature is fully implemented and PRD is no longer needed
- Implementation notes are complete and won't change
- Document provides historical context but isn't needed for daily work

### How to Archive
1. Move file to `docs/planning/archive/`
2. Rename with descriptive name following existing patterns
3. Update this README with document description
4. Update cross-references in active docs
5. Consider creating a summary in `design-decisions.md` if decision is significant

### Naming Conventions
- **PRDs**: `prd-{feature-name}.md`
- **Implementation**: `{phase}-{feature}-{type}.md` (e.g., `phase1-incremental-updates-plan.md`)
- **Changes**: `change-{feature-name}.md`
- **Stories**: `user-stories-{feature}.md`

## Quick Reference

| Document | Status | Key Takeaway |
|----------|--------|--------------|
| phase1-incremental-updates-plan.md | ✅ Complete | Why client-side filtering was chosen |
| phase1-incremental-updates-changes.md | ✅ Complete | What code changed in Phase 1 |
| phase1-incremental-updates-final.md | ✅ Complete | Lessons learned from Graph API integration |
| change-filename-sanitization.md | ✅ Complete | How filename sanitization works |
| prd-interactive-menu.md | ✅ Implemented | Original vision for interactive menu |
| prd-vector-export.md | 🚧 Partial | Planned automated bulk export feature |
| prd-unified-knowledge-base.md | 🚧 Partial | Full vision for dual-storage RAG system |
| user-stories-knowledge-base.md | 📋 Reference | Detailed acceptance criteria for Phase 5 |
| docker-setup-notes.md | ✅ Complete | Docker configuration decisions |

## Legend
- ✅ **Complete**: Feature fully implemented
- 🚧 **Partial**: Some components implemented, others pending
- 📋 **Reference**: Planning document for future implementation

---

**Last Updated**: 2025-11-14

For questions about archived documents or to suggest additions, please open an issue or contact the maintainers.
