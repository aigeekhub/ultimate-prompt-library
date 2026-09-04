import type { LLMClient, OptimizationResult } from './prompt-library-core';

export class StubLLMClient implements LLMClient {
  async optimizePrompt(_prompt: string): Promise<OptimizationResult> {
    throw new Error('Prompt optimization is not yet implemented.');
  }
}
