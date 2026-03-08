import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();

function resolveAliasPath(specifier) {
  const relative = specifier.slice(2);
  const base = path.join(rootDir, 'src', relative);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
  ];

  const matched = candidates.find((candidate) => fs.existsSync(candidate));
  return matched ? pathToFileURL(matched).href : null;
}

export function resolve(specifier, context, defaultResolve) {
  if (specifier === 'next/server') {
    return defaultResolve('next/server.js', context, defaultResolve);
  }

  if (specifier.startsWith('@/')) {
    const mapped = resolveAliasPath(specifier);
    if (mapped) {
      return defaultResolve(mapped, context, defaultResolve);
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
