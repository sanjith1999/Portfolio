import { NextResponse } from 'next/server';
import ImageModel from '@/app/models/image';
import { requireAdmin } from '@/lib/api-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateImageUpload } from '@/lib/validation';

export async function POST(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(req, { keyPrefix: 'upload:post', windowMs: 60_000, limit: 20 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many upload requests' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const validation = validateImageUpload(file, 3 * 1024 * 1024, [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
    ]);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Convert file → Buffer → Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const dataUri = `data:${file.type};base64,${base64Image}`;

    await connectToDatabase();
    const result = await ImageModel.create({
      filename: file.name,
      contentType: file.type,
      imageData: dataUri,
      sizeBytes: file.size,
    });

    return NextResponse.json({
      message: 'Uploaded successfully',
      id: result._id.toString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
