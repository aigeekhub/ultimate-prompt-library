import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { library } from '@/lib/library';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, categoryId } = await params;

  try {
    await library.categories.removeCategoryFromPrompt(id, categoryId, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove category from prompt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
