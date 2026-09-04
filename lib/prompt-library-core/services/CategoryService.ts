import type { IRepository } from '../repositories/index';
import type { Category } from '../types/index';

export class CategoryService {
  constructor(private repository: IRepository) {}

  async createCategory(userId: string, data: { name: string; color?: string }): Promise<Category> {
    if (!data.name.trim()) {
      throw new Error('Category name cannot be empty');
    }
    return this.repository.categories.create(userId, data);
  }

  async getCategory(id: string, userId: string): Promise<Category> {
    const category = await this.repository.categories.findById(id, userId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async getAllCategories(userId: string): Promise<Category[]> {
    return this.repository.categories.findAllByUser(userId);
  }

  async updateCategory(
    id: string,
    userId: string,
    data: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Category> {
    await this.getCategory(id, userId);
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Category name cannot be empty');
    }
    return this.repository.categories.update(id, userId, data);
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    await this.getCategory(id, userId);
    await this.repository.categories.delete(id, userId);
  }

  async addCategoryToPrompt(promptId: string, categoryId: string, userId: string): Promise<void> {
    const prompt = await this.repository.prompts.findById(promptId, userId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }
    await this.getCategory(categoryId, userId);
    await this.repository.categories.addToPrompt(promptId, categoryId, userId);
  }

  async removeCategoryFromPrompt(promptId: string, categoryId: string, userId: string): Promise<void> {
    const prompt = await this.repository.prompts.findById(promptId, userId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }
    await this.getCategory(categoryId, userId);
    await this.repository.categories.removeFromPrompt(promptId, categoryId, userId);
  }

  async getPromptCategories(promptId: string, userId: string): Promise<Category[]> {
    await this.repository.prompts.findById(promptId, userId);
    return this.repository.categories.getPromptCategories(promptId, userId);
  }

  async findPromptIdsByCategory(categoryId: string, userId: string): Promise<Set<string>> {
    // Verify the category exists and belongs to the user
    await this.getCategory(categoryId, userId);
    return this.repository.categories.findPromptIdsByCategory(categoryId, userId);
  }
}
