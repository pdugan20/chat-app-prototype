import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const script = fileURLToPath(
  new URL('./generate-apple-music-token.js', import.meta.url)
);

for (const existing of [
  undefined,
  'OTHER_SETTING=keep\n',
  'OTHER_SETTING=keep\nEXPO_PUBLIC_APPLE_MUSIC_TOKEN=old\n',
]) {
  test(`saves a private token file with ${existing === undefined ? 'no' : existing.includes('=old') ? 'an existing token in' : 'other settings in'} .env`, () => {
    const directory = mkdtempSync(join(tmpdir(), 'apple-token-test-'));
    try {
      const { privateKey, publicKey } = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
      });
      const keyFile = join(directory, 'synthetic-key.p8');
      writeFileSync(keyFile, privateKey, { mode: 0o600 });
      const envFile = join(directory, '.env');
      if (existing !== undefined) writeFileSync(envFile, existing);
      const result = spawnSync(process.execPath, [script], {
        cwd: directory,
        encoding: 'utf8',
        env: {
          PATH: process.env.PATH,
          APPLE_MUSIC_KEY_FILE: keyFile,
          APPLE_MUSIC_KEY_ID: 'TESTKEY123',
          APPLE_MUSIC_TEAM_ID: 'TESTTEAM12',
          DOTENV_CONFIG_QUIET: 'true',
        },
      });
      assert.equal(result.status, 0, result.stderr);
      const saved = readFileSync(envFile, 'utf8');
      const entries = saved.match(/^EXPO_PUBLIC_APPLE_MUSIC_TOKEN=(.+)$/gm);
      assert.equal(entries?.length, 1);
      const token = entries[0].split('=')[1];
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['ES256'],
        issuer: 'TESTTEAM12',
      });
      assert.ok(payload.exp > payload.iat);
      assert.equal(statSync(envFile).mode & 0o777, 0o600);
      assert.ok(!result.stdout.includes(token));
      assert.ok(!result.stderr.includes(token));
      assert.ok(!result.stdout.includes(privateKey));
      if (existing) assert.ok(saved.includes('OTHER_SETTING=keep'));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
