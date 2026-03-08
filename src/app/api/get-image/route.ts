import { NextResponse } from 'next/server';
import ImageModel from '@/app/models/image';
import { connectToDatabase } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { isSafeImageDataUrl, validateObjectIdLike } from '@/lib/validation';

export async function GET(req: Request) {
  const rate = checkRateLimit(req, { keyPrefix: 'image:get', windowMs: 60_000, limit: 240 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const validated = validateObjectIdLike(id);

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  await connectToDatabase();
  const img = await ImageModel.findById(validated.data).select('imageData').lean();

  if (!img) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  if (!isSafeImageDataUrl(img.imageData)) {
    return NextResponse.json({ error: 'Unsafe image format' }, { status: 400 });
  }

  return NextResponse.json({
    imageData: img.imageData,
  });
}
