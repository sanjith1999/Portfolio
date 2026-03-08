import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProjectModel from '@/app/models/projects';
import { checkRateLimit } from '@/lib/rate-limit';
import { parsePagination } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const rate = checkRateLimit(req, { keyPrefix: 'projects:visible', windowMs: 60_000, limit: 300 });
    if (!rate.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { page, limit, skip } = parsePagination(req.url, { limit: 12, maxLimit: 50 });
    await connectToDatabase();

    const query = { visibility: true };
    const [items, total] = await Promise.all([
      ProjectModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProjectModel.countDocuments(query),
    ]);

    return NextResponse.json({ items, meta: { page, limit, total } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch visible projects' }, { status: 500 });
  }
}
