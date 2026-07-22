import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MOBILE_DIRECTORIES = [
  'services',
  'hooks',
  'screens',
  'components',
  'stores',
  'utils',
  'contexts',
  'constants',
  'config',
  'types',
];
const FORBIDDEN = [
  ['EXPO', 'PUBLIC', 'ANTHROPIC', 'API', 'KEY'].join('_'),
  ['EXPO', 'PUBLIC', 'OPENAI', 'API', 'KEY'].join('_'),
  "from '@anthropic-ai/sdk'",
  "from 'openai'",
];

const collectProductionSource = async directory => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectProductionSource(path)));
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
};

test('mobile production source cannot contain provider secrets or SDK imports', async () => {
  const sourceFiles = [join(ROOT, 'App.tsx'), join(ROOT, 'index.ts')];
  for (const directory of MOBILE_DIRECTORIES) {
    sourceFiles.push(...(await collectProductionSource(join(ROOT, directory))));
  }

  for (const path of sourceFiles) {
    const source = await readFile(path, 'utf8');
    for (const token of FORBIDDEN) {
      assert.equal(
        source.includes(token),
        false,
        `${path.slice(ROOT.length + 1)} contains forbidden token ${token}`
      );
    }
  }

  const manager = await readFile(join(ROOT, 'services/ai/manager.ts'), 'utf8');
  assert.match(manager, /from '\.\/providers\/proxy'/);
  assert.equal(
    existsSync(
      join(ROOT, 'services/ai/providers', ['anthropic', 'ts'].join('.'))
    ),
    false
  );
  assert.equal(
    existsSync(join(ROOT, 'services/ai/providers', ['openai', 'ts'].join('.'))),
    false
  );
});
