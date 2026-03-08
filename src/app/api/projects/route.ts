import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProjectModel from '@/app/models/projects';
import { requireAdmin } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { parsePagination, validateProjectInput } from '@/lib/validation';

export async function GET(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(req, { keyPrefix: 'projects:get', windowMs: 60_000, limit: 120 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { page, limit, skip } = parsePagination(req.url, { limit: 20, maxLimit: 100 });
  await connectToDatabase();

  const [items, total] = await Promise.all([
    ProjectModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ProjectModel.countDocuments(),
  ]);

  return NextResponse.json({ items, meta: { page, limit, total } }, { status: 200 });
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(request, { keyPrefix: 'projects:post', windowMs: 60_000, limit: 20 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  await connectToDatabase();

  try {
    const body = await request.json();
    const parsed = validateProjectInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const project = await ProjectModel.create(parsed.data);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create project';
    console.error(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
