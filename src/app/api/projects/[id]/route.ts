import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProjectModel from '@/app/models/projects';
import { requireAdmin } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateObjectIdLike, validateProjectInput } from '@/lib/validation';

// GET project by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const validatedId = validateObjectIdLike(id);

  if (!validatedId.ok) {
    return NextResponse.json({ error: validatedId.error }, { status: 400 });
  }

  const rate = checkRateLimit(req, { keyPrefix: 'project:get', windowMs: 60_000, limit: 180 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  await connectToDatabase();

  try {
    const project = await ProjectModel.findById(id).lean();
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!project.visibility) {
      const unauthorized = requireAdmin(req);
      if (unauthorized) return unauthorized;
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid ID or Server Error' }, { status: 500 });
  }
}

// UPDATE project by ID
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(req, { keyPrefix: 'project:put', windowMs: 60_000, limit: 40 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const validatedId = validateObjectIdLike(id);

  if (!validatedId.ok) {
    return NextResponse.json({ error: validatedId.error }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const body = await req.json();
    const parsed = validateProjectInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const updated = await ProjectModel.findByIdAndUpdate(id, parsed.data, { new: true });

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating project' }, { status: 500 });
  }
}

// DELETE project by ID
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(_req);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(_req, { keyPrefix: 'project:delete', windowMs: 60_000, limit: 20 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;
  const validatedId = validateObjectIdLike(id);

  if (!validatedId.ok) {
    return NextResponse.json({ error: validatedId.error }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const deleted = await ProjectModel.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
  }
}
