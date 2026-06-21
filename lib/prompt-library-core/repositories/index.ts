import type { Prompt, Folder, Category, OptimizationVersion } from '../types/index';

export interface IPromptRepository {
  create(userId: string, data: { title: string; body: string; folderId?: string; notes?: string }): Promise<Prompt>;
  findById(id: string, userId: string): Promise<Prompt | null>;
  findAllByUser(userId: string): Promise<Prompt[]>;
  findByFolder(folderId: string, userId: string): Promise<Prompt[]>;
  update(id: string, userId: string, data: Partial<Omit<Prompt, 'id' | 'userId' | 'createdAt'>>): Promise<Prompt>;
  delete(id: string, userId: string): Promise<void>;
  search(userId: string, query: string): Promise<Prompt[]>;
}

export interface IFolderRepository {
  create(userId: string, data: { name: string; description?: string }): Promise<Folder>;
  findById(id: string, userId: string): Promise<Folder | null>;
  findAllByUser(userId: string): Promise<Folder[]>;
  update(id: string, userId: string, data: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>): Promise<Folder>;
  delete(id: string, userId: string): Promise<void>;
}

export interface ICategoryRepository {
  create(userId: string, data: { name: string; color?: string }): Promise<Category>;
  findById(id: string, userId: string): Promise<Category | null>;
  findAllByUser(userId: string): Promise<Category[]>;
  update(id: string, userId: string, data: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>): Promise<Category>;
  delete(id: string, userId: string): Promise<void>;
  addToPrompt(promptId: string, categoryId: string, userId: string): Promise<void>;
  removeFromPrompt(promptId: string, categoryId: string, userId: string): Promise<void>;
  getPromptCategories(promptId: string, userId: string): Promise<Category[]>;
}

export interface IOptimizationRepository {
  create(promptId: string, userId: string, data: { originalBody: string; optimizedBody: string; explanation: string }): Promise<OptimizationVersion>;
  findByPrompt(promptId: string, userId: string): Promise<OptimizationVersion[]>;
  findLatest(promptId: string, userId: string): Promise<OptimizationVersion | null>;
}

export interface IRepository {
  prompts: IPromptRepository;
  folders: IFolderRepository;
  categories: ICategoryRepository;
  optimizations: IOptimizationRepository;
}
