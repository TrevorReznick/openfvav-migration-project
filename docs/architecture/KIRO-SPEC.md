# KIRO-SPEC.md

## Project Overview

**OpenFav Migration Unified** is a comprehensive CLI tool for migrating OpenFav design systems from V3/V4 to V6. It combines the best features from multiple migration tool versions to provide automated token extraction, color conversion, and design system migration capabilities.

## Project Status

**Current Implementation:** ~35% Complete (Phase 2 - Token Migration Core)

### Completed Features ✅
- CLI structure with Commander.js
- Token extraction from Tailwind config (colors, keyframes, animations)
- CSS variable extraction from CSS files
- Component class detection
- Color conversion utilities (hex → HSL, RGBA → HSL)
- Token migration pipeline (extract → convert → generate)
- Design token TypeScript generation
- CSS variables update in globals.css
- Tailwind config update with migrated tokens

### Pending Features ❌
- Config wizard (interactive setup)
- Full validation system
- Component migration
- Apply-tokens script
- Update-imports script
- Backup/restore system
- Reporter and logging
- API Express server
- Tailwind analyzer
- Component analyzer
- Test suite

## Kiro Specs Directory Structure

This project uses Kiro specs for feature development. Each feature should have its own spec directory:

```
.kiro/specs/
├── token-extraction/          # Extracting tokens from source files
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── color-conversion/          # Converting hex/rgba to HSL
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── component-migration/       # Migrating React/Astro components
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── config-wizard/            # Interactive configuration setup
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── backup-restore/           # Backup and rollback system
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── validation-system/        # Path and config validation
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
└── api-server/              # Express API for interactive analysis
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

## Recommended Spec Creation Order

Based on the project roadmap and current implementation status:

### Priority 1: High (Core Functionality)
1. **token-extraction** - Complete the token extraction system
2. **color-conversion** - Enhance color conversion with edge cases
3. **validation-system** - Add pre-flight checks and validation
4. **component-migration** - Implement component transformation

### Priority 2: Medium (User Experience)
5. **config-wizard** - Interactive setup for better UX
6. **backup-restore** - Safety features for production use
7. **apply-tokens** - Apply extracted tokens to files

### Priority 3: Low (Advanced Features)
8. **api-server** - Web dashboard for analysis
9. **analyzers** - Tailwind and component analyzers
10. **reporting** - Detailed migration reports

## How to Use This with Kiro

### Creating a New Feature Spec

1. **Identify the feature** you want to implement from the list above
2. **Create the spec directory**: `.kiro/specs/[feature-name]/`
3. **Start with requirements**: Create `requirements.md` with user stories
4. **Design the solution**: Create `design.md` with architecture
5. **Plan implementation**: Create `tasks.md` with actionable tasks
6. **Execute tasks**: Use Kiro to implement each task incrementally

### Example: Creating a Config Wizard Spec

```bash
# Tell Kiro to create a spec for the config wizard feature
"Create a spec for implementing an interactive configuration wizard"
```

Kiro will guide you through:
1. Writing requirements with user stories and acceptance criteria
2. Designing the architecture and components
3. Breaking down implementation into tasks
4. Executing tasks one by one

## Project Architecture

### Core Modules

**CLI (`src/cli.js`)**
- Entry point for all commands
- Handles command routing and options
- Loads configuration

**Token System (`src/tokens/`)**
- `migrate-tokens.js` - Main migration orchestrator
- `extractors/` - Extract tokens from various sources
- `generators/` - Generate TypeScript tokens and CSS
- `mappers/` - Map tokens between versions

**Component System (`src/components/`)** [TODO]
- `migrate-components.js` - Component migration orchestrator
- `transformers/` - Transform imports, classes, props
- `validators/` - Validate migrated components

**Utilities (`src/utils/`)**
- `color-converter.js` - Color format conversions
- `file-utils.js` [TODO] - File system operations
- `logger.js` [TODO] - Logging system
- `backup.js` [TODO] - Backup/restore

**Validators (`src/validators/`)** [TODO]
- `validate-paths.js` - Path validation
- Config validation

### Configuration

The tool uses `migration.config.json` for configuration:

```json
{
  "version": "2.0",
  "workspaceRoot": "/path/to/workspace",
  "paths": {
    "v3": "/path/to/v3",
    "v4": "/path/to/v4",
    "v6": "/path/to/v6"
  },
  "options": {
    "createBackup": true,
    "dryRun": false,
    "verbose": true,
    "outputFormat": "js"
  },
  "tokenMappings": { /* ... */ },
  "componentMappings": { /* ... */ }
}
```

## Migration Flow

```
Source (V3/V4)
    ↓
Extract Tokens
    ├── Tailwind Config (colors, keyframes, animations)
    ├── CSS Files (variables, component classes)
    └── SCSS Files (variables) [TODO]
    ↓
Convert Formats
    ├── Hex → HSL
    ├── RGBA → HSL with opacity
    └── Validate values
    ↓
Generate Outputs
    ├── TypeScript tokens (src/lib/tokens.ts)
    ├── CSS variables (src/styles/globals.css)
    └── Tailwind config updates
    ↓
Destination (V6)
```

## Testing Strategy

### Unit Tests (Not Implemented)
- Color conversion functions
- Token extraction logic
- Path resolution
- Config validation

### Integration Tests (Not Implemented)
- Full migration pipeline
- File generation
- Config loading

### Fixtures (Not Implemented)
- Sample Tailwind configs
- Sample CSS files
- Expected outputs

## Development Guidelines

### When Creating Specs

1. **User Stories**: Write from user perspective
   - "As a developer, I want to..."
   - Focus on value and outcomes

2. **Acceptance Criteria**: Use EARS format
   - WHEN [trigger], THE system SHALL [response]
   - Be specific and measurable

3. **Design**: Include
   - Architecture diagrams
   - Component interfaces
   - Data models
   - Error handling strategy

4. **Tasks**: Make them
   - Actionable and specific
   - Incremental (build on previous tasks)
   - Testable
   - Reference requirements

### Code Style

- ES modules (import/export)
- Async/await for async operations
- Descriptive function names
- JSDoc comments for public APIs
- Chalk for colored console output
- Error handling with try/catch

## Related Documentation

- **PLAN.md** - Complete project plan and roadmap
- **README.md** - User-facing documentation
- **PROJECT_STRUCTURE.md** - Directory structure details
- **ANALISI_FATTIBILITA.md** - Feasibility analysis (Italian)
- **SUMMARY.md** - Project summary and status

## Getting Started with Kiro

To start working on a feature:

1. Review this KIRO-SPEC.md to understand the project
2. Choose a feature from the priority list
3. Ask Kiro to create a spec: "Create a spec for [feature-name]"
4. Review and iterate on requirements
5. Review and iterate on design
6. Review and iterate on tasks
7. Execute tasks one by one with Kiro

## Notes

- The project is designed for backward compatibility with v1.0 configs
- Dry-run mode should always be available for safety
- All file operations should support backup/rollback
- Color conversion is critical - HSL format required by openfav-dev
- Component classes need special handling (convert to utilities or preserve)

---

**Last Updated:** 2025-01-09
**Project Version:** 2.0.0
**Kiro Spec Version:** 1.0
