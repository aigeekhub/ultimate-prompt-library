import type { IRepository } from '../repositories/index';
import type { Folder } from '../types/index';

export class FolderService {
  constructor(private repository: IRepository) {}

  async createFolder(userId: string, data: { name: string; description?: string }): Promise<Folder> {
    if (!data.name.trim()) {
      throw new Error('Folder name cannot be empty');
    }
    return this.repository.folders.create(userId, data);
  }

  async getFolder(id: string, userId: string): Promise<Folder> {
    const folder = await this.repository.folders.findById(id, userId);
    if (!folder) {
      throw new Error('Folder not found');
    }
    return folder;
  }

  async getAllFolders(userId: string): Promise<Folder[]> {
    return this.repository.folders.findAllByUser(userId);
  }

  async updateFolder(
    id: string,
    userId: string,
    data: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Folder> {
    await this.getFolder(id, userId);
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Folder name cannot be empty');
    }
    return this.repository.folders.update(id, userId, data);
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    await this.getFolder(id, userId);
    await this.repository.folders.delete(id, userId);
  }

  async movePromptsToFolder(promptIds: string[], targetFolderId: string | undefined, userId: string): Promise<void> {
    for (const promptId of promptIds) {
      const prompt = await this.repository.prompts.findById(promptId, userId);
      if (prompt) {
        await this.repository.prompts.update(promptId, userId, { folderId: targetFolderId });
      }
    }
  }
}
