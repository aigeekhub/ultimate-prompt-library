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
    const prompt = await library.prompts.getPrompt(id, session.user.id);
    return NextResponse.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Prompt not found';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  try {
    const prompt = await library.prompts.updatePrompt(id, session.user.id, {
      title: data.title,
      body: data.body,
      folderId: data.folderId,
      notes: data.notes,
    });
    return NextResponse.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update prompt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await library.prompts.deletePrompt(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete prompt';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
