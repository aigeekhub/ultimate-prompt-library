import { createLibraryWithPrisma } from './prompt-library-core';
import { StubLLMClient } from './llm-client';

export const library = createLibraryWithPrisma(new StubLLMClient());
