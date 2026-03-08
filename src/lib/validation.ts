import type { BlockType, ProjectInput } from '@/types/project';

const ALLOWED_BLOCK_TYPES = new Set<BlockType>([
  'paragraph',
  'heading1',
  'heading2',
  'bullet_list',
  'numbered_list',
  'image',
  'equation',
  'columns',
  'code',
  'divider',
  'spacer',
]);

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

type PaginationResult = {
  page: number;
  limit: number;
  skip: number;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asTrimmedString(item)).filter(Boolean);
}

function isValidBlock(block: unknown): boolean {
  if (!block || typeof block !== 'object') return false;
  const candidate = block as { id?: unknown; type?: unknown; columns?: unknown };

  if (typeof candidate.id !== 'string' || !candidate.id) return false;
  if (typeof candidate.type !== 'string' || !ALLOWED_BLOCK_TYPES.has(candidate.type as BlockType)) {
    return false;
  }

  if (candidate.type === 'columns') {
    if (!Array.isArray(candidate.columns)) return false;
  }

  return true;
}

export function parsePagination(url: string, defaults?: { page?: number; limit?: number; maxLimit?: number }): PaginationResult {
  const parsed = new URL(url);
  const pageParam = Number(parsed.searchParams.get('page'));
  const limitParam = Number(parsed.searchParams.get('limit'));

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : (defaults?.page ?? 1);
  const maxLimit = defaults?.maxLimit ?? 50;
  const rawLimit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : (defaults?.limit ?? 12);
  const limit = Math.min(rawLimit, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function validateProjectInput(body: unknown): ValidationResult<ProjectInput> {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  const payload = body as Record<string, unknown>;
  const title = asTrimmedString(payload.title);

  if (!title) {
    return { ok: false, error: 'Project title is required' };
  }

  const blocks = Array.isArray(payload.blocks) ? payload.blocks : [];
  if (!blocks.every(isValidBlock)) {
    return { ok: false, error: 'Invalid block structure' };
  }

  const project: ProjectInput = {
    visibility: Boolean(payload.visibility),
    title,
    description: asTrimmedString(payload.description),
    longDescription: asTrimmedString(payload.longDescription),
    technologies: ensureStringArray(payload.technologies),
    features: ensureStringArray(payload.features),
    challenges: ensureStringArray(payload.challenges),
    solutions: ensureStringArray(payload.solutions),
    image: asTrimmedString(payload.image) || undefined,
    githubLink: asTrimmedString(payload.githubLink),
    liveLink: asTrimmedString(payload.liveLink),
    duration: asTrimmedString(payload.duration),
    teamSize: asTrimmedString(payload.teamSize),
    role: asTrimmedString(payload.role),
    blocks: blocks as ProjectInput['blocks'],
  };

  return { ok: true, data: project };
}

export function validateAuthCredentials(body: unknown): ValidationResult<{ email: string; password: string }> {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  const payload = body as Record<string, unknown>;
  const email = asTrimmedString(payload.email).toLowerCase();
  const password = asTrimmedString(payload.password);

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { ok: false, error: 'Invalid email format' };
  }

  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' };
  }

  return { ok: true, data: { email, password } };
}

export function validateUserListProjection<T extends { email: unknown; role: unknown }>(users: T[]) {
  return users
    .filter((user) => typeof user.email === 'string' && typeof user.role === 'string')
    .map((user) => ({
      email: user.email as string,
      role: user.role as string,
    }));
}

export function validateObjectIdLike(id: string | null): ValidationResult<string> {
  if (!id) {
    return { ok: false, error: 'ID is required' };
  }

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return { ok: false, error: 'Invalid ID format' };
  }

  return { ok: true, data: id };
}

export function validateImageUpload(file: File, maxBytes: number, allowedMimeTypes: string[]): ValidationResult<File> {
  if (!file) {
    return { ok: false, error: 'No file uploaded' };
  }

  if (file.size > maxBytes) {
    return { ok: false, error: `File size exceeds ${Math.floor(maxBytes / (1024 * 1024))}MB limit` };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return { ok: false, error: 'Unsupported file type' };
  }

  return { ok: true, data: file };
}

export function isSafeImageDataUrl(dataUrl: string): boolean {
  return /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(dataUrl);
}

export function normalizeStringArray(input: unknown): string[] {
  return isStringArray(input) ? input.map((item) => item.trim()).filter(Boolean) : [];
}
