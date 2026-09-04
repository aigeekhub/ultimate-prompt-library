import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { library } from '@/lib/library';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await library.categories.getAllCategories(session.user.id);
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const category = await library.categories.createCategory(session.user.id, {
      name: data.name,
      color: data.color,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
