import type { IRepository } from '../repositories/index';
import type { Prompt } from '../types/index';

export class PromptService {
  constructor(private repository: IRepository) {}

  async createPrompt(
    userId: string,
    data: { title: string; body: string; folderId?: string; notes?: string }
  ): Promise<Prompt> {
    if (!data.title.trim()) {
      throw new Error('Prompt title cannot be empty');
    }
    if (!data.body.trim()) {
      throw new Error('Prompt body cannot be empty');
    }
    return this.repository.prompts.create(userId, data);
  }

  async getPrompt(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.repository.prompts.findById(id, userId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }
    return prompt;
  }

  async getAllPrompts(userId: string): Promise<Prompt[]> {
    return this.repository.prompts.findAllByUser(userId);
  }

  async getPromptsByFolder(folderId: string, userId: string): Promise<Prompt[]> {
    return this.repository.prompts.findByFolder(folderId, userId);
  }

  async updatePrompt(
    id: string,
    userId: string,
    data: Partial<Omit<Prompt, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Prompt> {
    const prompt = await this.getPrompt(id, userId);
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Prompt title cannot be empty');
    }
    if (data.body !== undefined && !data.body.trim()) {
      throw new Error('Prompt body cannot be empty');
    }
    return this.repository.prompts.update(id, userId, data);
  }

  async deletePrompt(id: string, userId: string): Promise<void> {
    await this.getPrompt(id, userId);
    await this.repository.prompts.delete(id, userId);
  }

  async searchPrompts(userId: string, query: string): Promise<Prompt[]> {
    if (!query.trim()) {
      return this.getAllPrompts(userId);
    }
    return this.repository.prompts.search(userId, query.toLowerCase());
  }
}
