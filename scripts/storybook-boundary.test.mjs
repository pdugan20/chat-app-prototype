import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const forbiddenNormalEntryMarkers = [
  '.rnstorybook',
  '@storybook',
  'storybook/',
  'STORYBOOK_ENABLED',
  'EXPO_PUBLIC_STORYBOOK_ENABLED',
];

const assertNormalEntryBoundary = (entry, source = 'normal app entry') => {
  for (const marker of forbiddenNormalEntryMarkers) {
    assert.equal(entry.includes(marker), false, `${source} contains ${marker}`);
  }
};

test('normal app entry does not import Storybook', async () => {
  const entry = await readFile('index.ts', 'utf8');
  assertNormalEntryBoundary(entry, 'index.ts');
  assert.match(entry, /registerRootComponent\(App\)/);
});

test('Metro owns Storybook entry-point swapping', async () => {
  const metro = await readFile('metro.config.js', 'utf8');
  assert.match(metro, /STORYBOOK_ENABLED/);
  assert.match(metro, /withStorybook/);
  assert.match(metro, /@storybook\/react-native\/withStorybook/);
  assert.equal(metro.includes('/metro/withStorybook'), false);
});

test('Storybook entry registers its native root', async () => {
  const entry = await readFile('.rnstorybook/index.tsx', 'utf8');
  assert.match(entry, /registerRootComponent\(StorybookUIRoot\)/);
});
