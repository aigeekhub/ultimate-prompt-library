import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { library } from '@/lib/library';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const folders = await library.folders.getAllFolders(session.user.id);
  return NextResponse.json(folders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const folder = await library.folders.createFolder(session.user.id, {
      name: data.name,
      description: data.description,
    });
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create folder';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
