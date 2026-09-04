# Prompt Library Core Module

A reusable, framework-agnostic domain logic library for managing prompts, folders, categories, and AI-assisted optimization.

## Architecture

This module is designed to be **completely independent** of Next.js, UI frameworks, or any specific deployment context. It provides:

- **Types**: Domain models (`Prompt`, `Folder`, `Category`, `OptimizationVersion`, etc.)
- **Repository Interfaces**: Abstract data access layer (`IPromptRepository`, `IFolderRepository`, etc.)
- **Services**: Business logic for CRUD operations and optimization
- **Public API**: Clean, typed exports for external consumption

## Usage

### 1. Implement the Repository Interfaces

Create concrete implementations of the repository interfaces for your storage layer (Prisma, direct DB calls, mock, etc.):

```typescript
import type { IPromptRepository, IFolderRepository, ICategoryRepository, IOptimizationRepository, IRepository } from 'prompt-library-core';

class PrismaPromptRepository implements IPromptRepository {
  // implement all methods...
}

const repository: IRepository = {
  prompts: new PrismaPromptRepository(),
  folders: new PrismaFolderRepository(),
  categories: new PrismaCategoryRepository(),
  optimizations: new PrismaOptimizationRepository(),
};
```

### 2. Implement the LLM Client

Create a client that integrates with your chosen LLM (Claude, OpenAI, etc.):

```typescript
import type { LLMClient, OptimizationResult } from 'prompt-library-core';

class ClaudeOptimizationClient implements LLMClient {
  async optimizePrompt(prompt: string): Promise<OptimizationResult> {
    // Call Claude API and return optimized prompt
  }
}

const llmClient = new ClaudeOptimizationClient();
```

### 3. Create the Library Instance

```typescript
import { createPromptLibrary } from 'prompt-library-core';

const library = createPromptLibrary(repository, llmClient);

// Now you have:
// - library.prompts (PromptService)
// - library.folders (FolderService)
// - library.categories (CategoryService)
// - library.optimizations (OptimizationService)
```

### 4. Use the Services

```typescript
// Create a prompt
const prompt = await library.prompts.createPrompt(userId, {
  title: 'My Prompt',
  body: 'This is the prompt content',
  folderId: 'folder-123',
});

// Create a category
const category = await library.categories.createCategory(userId, {
  name: 'Writing',
  color: '#FF5733',
});

// Add category to prompt
await library.categories.addCategoryToPrompt(prompt.id, category.id, userId);

// Search prompts
const results = await library.prompts.searchPrompts(userId, 'keyword');

// Optimize a prompt
const optimization = await library.optimizations.optimizePrompt(prompt.id, userId);
```

## Reusability

This module can be consumed:

- **In the Next.js app**: Wire repositories and LLM client in API routes or server actions
- **In other applications**: Implement repositories for your storage layer and integrate with any framework (Express, FastAPI, etc.)
- **Headlessly**: Use only the services and types without any UI layer

## Directory Structure

```
lib/prompt-library-core/
├── types/          # Domain model interfaces
├── repositories/   # Repository interface definitions
├── services/       # Business logic implementations
├── utils/          # Shared utilities (if needed)
├── index.ts        # Public API exports
└── README.md       # This file
```

## No Framework Dependencies

This module intentionally has **zero dependencies** on:
- Next.js
- React
- Any UI framework
- Specific databases

This ensures it can be extracted or reused in other projects without refactoring.
