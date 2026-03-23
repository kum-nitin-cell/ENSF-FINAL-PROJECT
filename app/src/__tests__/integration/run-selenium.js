#!/usr/bin/env node

/**
 * Selenium Test Runner
 * WBS 1.4.2 — Frontend Integration Testing
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. In another terminal:   npm run test:selenium
 *
 * Environment variables:
 *   TEST_URL      — Base URL (default: http://localhost:5173)
 *   TEST_EMAIL    — Test account email
 *   TEST_PASSWORD — Test account password
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFile = join(__dirname, 'selenium.test.js');

console.log('🚀 Starting Selenium Integration Tests...\n');
console.log('ℹ️  Make sure the dev server is running: npm run dev\n');

try {
  execSync(`node ${testFile}`, {
    stdio: 'inherit',
    env: { ...process.env },
  });
} catch (err) {
  process.exit(1);
}
