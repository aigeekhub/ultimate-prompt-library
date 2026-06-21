import type { PrismaClient, Prompt as PrismaPrompt, Folder as PrismaFolder, Category as PrismaCategory } from '@prisma/client';
import type {
  IPromptRepository,
  IFolderRepository,
  ICategoryRepository,
  IOptimizationRepository,
  IRepository,
} from './index';
import type { Prompt, Folder, Category, OptimizationVersion } from '../types/index';

function toPrompt(row: PrismaPrompt): Prompt {
  return {
    id: row.id,
    userId: row.userId,
    folderId: row.folderId ?? undefined,
    title: row.title,
    body: row.body,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toFolder(row: PrismaFolder): Folder {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toCategory(row: PrismaCategory): Category {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    color: row.color ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaPromptRepository implements IPromptRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    userId: string,
    data: { title: string; body: string; folderId?: string; notes?: string }
  ): Promise<Prompt> {
    const row = await this.prisma.prompt.create({
      data: {
        userId,
        title: data.title,
        body: data.body,
        notes: data.notes,
        folderId: data.folderId,
      },
    });
    return toPrompt(row);
  }

  async findById(id: string, userId: string): Promise<Prompt | null> {
    const row = await this.prisma.prompt.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return null;
    return toPrompt(row);
  }

  async findAllByUser(userId: string): Promise<Prompt[]> {
    const rows = await this.prisma.prompt.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(toPrompt);
  }

  async findByFolder(folderId: string, userId: string): Promise<Prompt[]> {
    const rows = await this.prisma.prompt.findMany({
      where: { folderId, userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(toPrompt);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Prompt, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Prompt> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Prompt not found');
    }

    const row = await this.prisma.prompt.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        notes: data.notes,
        folderId: data.folderId,
      },
    });
    return toPrompt(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Prompt not found');
    }

    await this.prisma.prompt.delete({ where: { id } });
  }

  async search(userId: string, query: string): Promise<Prompt[]> {
    const rows = await this.prisma.prompt.findMany({ where: { userId } });
    const lowerQuery = query.toLowerCase();
    return rows
      .filter((p) => p.title.toLowerCase().includes(lowerQuery) || p.body.toLowerCase().includes(lowerQuery))
      .map(toPrompt);
  }
}

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: { name: string; description?: string }): Promise<Folder> {
    const row = await this.prisma.folder.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
    });
    return toFolder(row);
  }

  async findById(id: string, userId: string): Promise<Folder | null> {
    const row = await this.prisma.folder.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return null;
    return toFolder(row);
  }

  async findAllByUser(userId: string): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(toFolder);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Folder> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Folder not found');
    }

    const row = await this.prisma.folder.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return toFolder(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Folder not found');
    }

    await this.prisma.folder.delete({ where: { id } });
  }
}

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: { name: string; color?: string }): Promise<Category> {
    const row = await this.prisma.category.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
      },
    });
    return toCategory(row);
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return null;
    return toCategory(row);
  }

  async findAllByUser(userId: string): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return rows.map(toCategory);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Category> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Category not found');
    }

    const row = await this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
    return toCategory(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error('Category not found');
    }

    await this.prisma.category.delete({ where: { id } });
  }

  async addToPrompt(promptId: string, categoryId: string, _userId: string): Promise<void> {
    await this.prisma.promptCategory.create({
      data: { promptId, categoryId },
    });
  }

  async removeFromPrompt(promptId: string, categoryId: string, _userId: string): Promise<void> {
    await this.prisma.promptCategory.delete({
      where: { promptId_categoryId: { promptId, categoryId } },
    });
  }

  async getPromptCategories(promptId: string, _userId: string): Promise<Category[]> {
    const links = await this.prisma.promptCategory.findMany({
      where: { promptId },
      include: { category: true },
    });
    return links.map((link) => toCategory(link.category));
  }
}

export class PrismaOptimizationRepository implements IOptimizationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    promptId: string,
    userId: string,
    data: { originalBody: string; optimizedBody: string; explanation: string }
  ): Promise<OptimizationVersion> {
    return this.prisma.optimizationVersion.create({
      data: {
        promptId,
        userId,
        originalBody: data.originalBody,
        optimizedBody: data.optimizedBody,
        explanation: data.explanation,
      },
    });
  }

  async findByPrompt(promptId: string, userId: string): Promise<OptimizationVersion[]> {
    return this.prisma.optimizationVersion.findMany({
      where: { promptId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLatest(promptId: string, userId: string): Promise<OptimizationVersion | null> {
    return this.prisma.optimizationVersion.findFirst({
      where: { promptId, userId },
      orderBy: { createdAt: 'desc' },
    });
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
