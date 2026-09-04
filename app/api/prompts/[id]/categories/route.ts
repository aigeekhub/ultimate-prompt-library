import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { library } from '@/lib/library';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const categories = await library.categories.getPromptCategories(id, session.user.id);
    return NextResponse.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Prompt not found';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  try {
    await library.categories.addCategoryToPrompt(id, data.categoryId, session.user.id);
    const categories = await library.categories.getPromptCategories(id, session.user.id);
    return NextResponse.json(categories, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add category to prompt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
