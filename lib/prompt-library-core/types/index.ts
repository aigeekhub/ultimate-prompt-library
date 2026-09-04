export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  body: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptCategory {
  promptId: string;
  categoryId: string;
}

export interface OptimizationVersion {
  id: string;
  promptId: string;
  originalBody: string;
  optimizedBody: string;
  explanation: string;
  createdAt: Date;
}

export interface OptimizationResult {
  originalBody: string;
  optimizedBody: string;
  explanation: string;
}
