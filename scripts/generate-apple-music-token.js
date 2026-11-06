#!/usr/bin/env node

/**
 * Generate Apple Music Developer Token from .p8 private key
 * Usage: npm run generate-apple-token
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const config = {
  keyFile: process.env.APPLE_MUSIC_KEY_FILE,
  keyId: process.env.APPLE_MUSIC_KEY_ID,
  teamId: process.env.APPLE_MUSIC_TEAM_ID,
};

const TOKEN_ENV_NAME = 'EXPO_PUBLIC_APPLE_MUSIC_TOKEN';

function upsertEnvValue(content, name, value) {
  const entry = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, 'm');

  if (pattern.test(content)) {
    return content.replace(pattern, entry);
  }

  return `${content.trimEnd()}\n${entry}\n`;
}

function generateAppleMusicToken() {
  try {
    // Validate required environment variables
    if (!config.keyFile || !config.keyId || !config.teamId) {
      throw new Error(
        'Missing required environment variables in .env file:\n' +
          '  APPLE_MUSIC_KEY_FILE, APPLE_MUSIC_KEY_ID, APPLE_MUSIC_TEAM_ID'
      );
    }

    if (!/^[A-Z0-9]{10}$/.test(config.keyId)) {
      throw new Error(
        'APPLE_MUSIC_KEY_ID must be 10 uppercase letters or digits'
      );
    }

    if (!/^[A-Z0-9]{10}$/.test(config.teamId)) {
      throw new Error(
        'APPLE_MUSIC_TEAM_ID must be 10 uppercase letters or digits'
      );
    }

    // Read the private key
    const keyPath = path.resolve(config.keyFile);
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Private key file not found: ${keyPath}`);
    }

    const privateKey = fs.readFileSync(keyPath, 'utf8');

    // Generate JWT token (6 months expiration)
    const payload = {
      iss: config.teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 60 * 60,
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: config.keyId,
    });

    // Save without ever printing the credential to stdout.
    const envPath = path.resolve('.env');
    const envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, 'utf8')
      : '';
    const updatedContent = upsertEnvValue(envContent, TOKEN_ENV_NAME, token);

    fs.writeFileSync(envPath, updatedContent, { mode: 0o600 });
    fs.chmodSync(envPath, 0o600);

    console.log('✅ Apple Music JWT token generated and saved to .env');
    console.log(
      `⏰ Token expires ${new Date(payload.exp * 1000).toISOString()}`
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateAppleMusicToken();
}

module.exports = { generateAppleMusicToken };
