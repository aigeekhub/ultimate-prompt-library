import type { PrismaClient } from '@prisma/client';
import type {
  IPromptRepository,
  IFolderRepository,
  ICategoryRepository,
  IOptimizationRepository,
  IRepository,
} from './index';
import type { Prompt, Folder, Category, OptimizationVersion } from '../types/index';

export class PrismaPromptRepository implements IPromptRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: { title: string; body: string; folderId?: string; notes?: string }): Promise<Prompt> {
    return this.prisma.prompt.create({
      data: {
        userId,
        title: data.title,
        body: data.body,
        notes: data.notes,
        folderId: data.folderId,
      },
    }) as Promise<Prompt>;
  }

  async findById(id: string, userId: string): Promise<Prompt | null> {
    return (this.prisma.prompt.findUnique({
      where: { id },
    }) as Promise<any>).then((p) => (p?.userId === userId ? p : null));
  }

  async findAllByUser(userId: string): Promise<Prompt[]> {
    return this.prisma.prompt.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }) as Promise<Prompt[]>;
  }

  async findByFolder(folderId: string, userId: string): Promise<Prompt[]> {
    return this.prisma.prompt.findMany({
      where: { folderId, userId },
      orderBy: { updatedAt: 'desc' },
    }) as Promise<Prompt[]>;
  }

  async update(id: string, userId: string, data: Partial<Omit<Prompt, 'id' | 'userId' | 'createdAt'>>): Promise<Prompt> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Prompt not found');
    }

    return this.prisma.prompt.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        notes: data.notes,
        folderId: data.folderId,
      },
    }) as Promise<Prompt>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Prompt not found');
    }

    await this.prisma.prompt.delete({
      where: { id },
    });
  }

  async search(userId: string, query: string): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      where: { userId },
    });

    const lowerQuery = query.toLowerCase();
    return prompts.filter((p) => p.title.toLowerCase().includes(lowerQuery) || p.body.toLowerCase().includes(lowerQuery));
  }
}

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: { name: string; description?: string }): Promise<Folder> {
    return this.prisma.folder.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
    }) as Promise<Folder>;
  }

  async findById(id: string, userId: string): Promise<Folder | null> {
    return (this.prisma.folder.findUnique({
      where: { id },
    }) as Promise<any>).then((f) => (f?.userId === userId ? f : null));
  }

  async findAllByUser(userId: string): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }) as Promise<Folder[]>;
  }

  async update(id: string, userId: string, data: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>): Promise<Folder> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Folder not found');
    }

    return this.prisma.folder.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    }) as Promise<Folder>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Folder not found');
    }

    await this.prisma.folder.delete({
      where: { id },
    });
  }
}

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: { name: string; color?: string }): Promise<Category> {
    return this.prisma.category.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
      },
    }) as Promise<Category>;
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return (this.prisma.category.findUnique({
      where: { id },
    }) as Promise<any>).then((c) => (c?.userId === userId ? c : null));
  }

  async findAllByUser(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    }) as Promise<Category[]>;
  }

  async update(id: string, userId: string, data: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>): Promise<Category> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    }) as Promise<Category>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Category not found');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async addToPrompt(promptId: string, categoryId: string, userId: string): Promise<void> {
    await this.prisma.promptCategory.create({
      data: { promptId, categoryId },
    });
  }

  async removeFromPrompt(promptId: string, categoryId: string, userId: string): Promise<void> {
    await this.prisma.promptCategory.delete({
      where: { promptId_categoryId: { promptId, categoryId } },
    });
  }

  async getPromptCategories(promptId: string, userId: string): Promise<Category[]> {
    const categories = await this.prisma.promptCategory.findMany({
      where: { promptId },
      include: { category: true },
    });

    return categories.map((pc) => pc.category) as Promise<Category[]>;
  }
}

export class PrismaOptimizationRepository implements IOptimizationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(promptId: string, userId: string, data: { originalBody: string; optimizedBody: string; explanation: string }): Promise<OptimizationVersion> {
    return this.prisma.optimizationVersion.create({
      data: {
        promptId,
        userId,
        originalBody: data.originalBody,
        optimizedBody: data.optimizedBody,
        explanation: data.explanation,
      },
    }) as Promise<OptimizationVersion>;
  }

  async findByPrompt(promptId: string, userId: string): Promise<OptimizationVersion[]> {
    return this.prisma.optimizationVersion.findMany({
      where: { promptId, userId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<OptimizationVersion[]>;
  }

  async findLatest(promptId: string, userId: string): Promise<OptimizationVersion | null> {
    return this.prisma.optimizationVersion.findFirst({
      where: { promptId, userId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<OptimizationVersion | null>;
  }
}

export function createPrismaRepository(prisma: PrismaClient): IRepository {
  return {
    prompts: new PrismaPromptRepository(prisma),
    folders: new PrismaFolderRepository(prisma),
    categories: new PrismaCategoryRepository(prisma),
    optimizations: new PrismaOptimizationRepository(prisma),
  };
}
