export * from './types/index';
export * from './repositories/index';
export * from './services/index';
export * from './repositories/prisma';
export { createLibraryWithPrisma, getPrismaClient, closePrismaConnection } from './utils/init';

import type { IRepository } from './repositories/index';
import { PromptService, FolderService, CategoryService, OptimizationService } from './services/index';
import type { LLMClient } from './services/OptimizationService';

export interface IPromptLibrary {
  prompts: PromptService;
  folders: FolderService;
  categories: CategoryService;
  optimizations: OptimizationService;
}

export function createPromptLibrary(repository: IRepository, llmClient: LLMClient): IPromptLibrary {
  return {
    prompts: new PromptService(repository),
    folders: new FolderService(repository),
    categories: new CategoryService(repository),
    optimizations: new OptimizationService(repository, llmClient),
  };
}
