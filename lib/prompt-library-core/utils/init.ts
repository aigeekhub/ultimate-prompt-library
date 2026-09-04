import { PrismaClient } from '@prisma/client';
import { createPromptLibrary, type LLMClient } from '../index';
import { createPrismaRepository } from '../repositories/prisma';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export function createLibraryWithPrisma(llmClient: LLMClient) {
  const prisma = getPrismaClient();
  const repository = createPrismaRepository(prisma);
  return createPromptLibrary(repository, llmClient);
}

export async function closePrismaConnection() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
