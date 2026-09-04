import type { IRepository } from '../repositories/index';
import type { OptimizationResult, OptimizationVersion } from '../types/index';

export interface LLMClient {
  optimizePrompt(prompt: string): Promise<OptimizationResult>;
}

export class OptimizationService {
  constructor(
    private repository: IRepository,
    private llmClient: LLMClient
  ) {}

  async optimizePrompt(promptId: string, userId: string): Promise<OptimizationVersion> {
    const prompt = await this.repository.prompts.findById(promptId, userId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    const result = await this.llmClient.optimizePrompt(prompt.body);

    const version = await this.repository.optimizations.create(promptId, userId, {
      originalBody: prompt.body,
      optimizedBody: result.optimizedBody,
      explanation: result.explanation,
    });

    return version;
  }

  async getOptimizationHistory(promptId: string, userId: string): Promise<OptimizationVersion[]> {
    await this.repository.prompts.findById(promptId, userId);
    return this.repository.optimizations.findByPrompt(promptId, userId);
  }

  async getLatestOptimization(promptId: string, userId: string): Promise<OptimizationVersion | null> {
    await this.repository.prompts.findById(promptId, userId);
    return this.repository.optimizations.findLatest(promptId, userId);
  }

  async applyOptimization(promptId: string, userId: string, versionId: string): Promise<void> {
    const prompt = await this.repository.prompts.findById(promptId, userId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    const history = await this.repository.optimizations.findByPrompt(promptId, userId);
    const version = history.find((v) => v.id === versionId);
    if (!version) {
      throw new Error('Optimization version not found');
    }

    await this.repository.prompts.update(promptId, userId, {
      body: version.optimizedBody,
    });
  }
}
