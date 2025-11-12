/**
 * Pre-serialization script for resources.
 *
 * This script reads JSON files from the ./database directory,
 * serializes each one using Node.js's v8 module into a binary format,
 * and saves them as .v8 files in the ./cache directory.
 *
 * Purpose:
 * - Improve startup performance by avoiding JSON.parse at runtime
 * - Reduce CPU usage during worker initialization
 * - Enable faster deserialization with v8.deserialize()
 *
 * Usage:
 *   Run this script once during build or deploy:
 *     node scripts/prep-data.js
 */

import fs from 'node:fs';
import v8 from 'node:v8';
import path from 'node:path';

const inputDir = './database';
const outputDir = './cache';

fs.mkdirSync(outputDir, { recursive: true });

const resources = ['products', 'carts', 'users', 'quotes', 'todos', 'posts', 'comments', 'recipes'];

function serializeToV8(inputPath, outputPath) {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const buffer = v8.serialize(parsed);
  fs.writeFileSync(outputPath, buffer);
}

resources.forEach(resource => {
  const inputPath = path.join(inputDir, `${resource}.json`);
  const outputPath = path.join(outputDir, `${resource}.v8`);
  serializeToV8(inputPath, outputPath);
  console.log(`Serialized ${resource}.json → ${resource}.v8`);
});
