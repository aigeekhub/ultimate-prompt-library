import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { library } from '@/lib/library';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q') ?? '';
  const folderId = request.nextUrl.searchParams.get('folderId');
  const categoryId = request.nextUrl.searchParams.get('categoryId');

  let prompts = await library.prompts.searchPrompts(session.user.id, query);

  // Filter by folder
  if (folderId) {
    prompts = prompts.filter((p) => p.folderId === folderId);
  }

  // Filter by category
  if (categoryId) {
    const promptIds = new Set<string>();
    for (const prompt of prompts) {
      const cats = await library.categories.getPromptCategories(prompt.id, session.user.id);
      if (cats.some((c) => c.id === categoryId)) {
        promptIds.add(prompt.id);
      }
    }
    prompts = prompts.filter((p) => promptIds.has(p.id));
  }

  return NextResponse.json(prompts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  try {
    const prompt = await library.prompts.createPrompt(session.user.id, {
      title: data.title,
      body: data.body,
      folderId: data.folderId,
      notes: data.notes,
    });
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create prompt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
