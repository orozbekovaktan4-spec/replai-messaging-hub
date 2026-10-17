#!/usr/bin/env node
// Safe duplicate endpoint remover
// Uses AST-like approach to find complete endpoint blocks

import fs from 'fs';

const file = './server-new.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('🔍 Finding duplicate endpoints...\n');

// Track endpoint occurrences
const endpoints = [];
let currentBlock = null;
let braceDepth = 0;
let inEndpoint = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect endpoint start
  const match = line.match(/^app\.(get|post|put|delete)\('\/api\/admin\/businesses[^']*',/);
  if (match && !inEndpoint) {
    currentBlock = {
      type: match[1].toUpperCase(),
      path: line.match(/'([^']+)'/)[1],
      startLine: i + 1,
      lines: [line]
    };
    inEndpoint = true;
    braceDepth = 0;
  }

  if (inEndpoint) {
    if (i > currentBlock.startLine - 1) {
      currentBlock.lines.push(line);
    }

    // Count braces
    for (const char of line) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
    }

    // End of endpoint block
    if (braceDepth < 0 || (line.trim() === '});' && braceDepth === 0)) {
      currentBlock.endLine = i + 1;
      endpoints.push(currentBlock);
      inEndpoint = false;
      currentBlock = null;
    }
  }
}

// Find duplicates
const seen = new Map();
const toKeep = [];
const toDelete = [];

endpoints.forEach(ep => {
  const key = `${ep.type} ${ep.path}`;
  if (!seen.has(key)) {
    seen.set(key, ep);
    toKeep.push(ep);
    console.log(`✅ KEEP: Line ${ep.startLine}: ${key}`);
  } else {
    toDelete.push(ep);
    console.log(`❌ DELETE: Line ${ep.startLine}-${ep.endLine}: ${key} (duplicate)`);
  }
});

console.log(`\n📊 Found ${toDelete.length} duplicates to remove\n`);

if (toDelete.length === 0) {
  console.log('✅ No duplicates found!');
  process.exit(0);
}

// Create new content by removing duplicate blocks
const linesToDelete = new Set();
toDelete.forEach(ep => {
  for (let i = ep.startLine - 1; i < ep.endLine; i++) {
    linesToDelete.add(i);
  }
});

const newLines = lines.filter((_, i) => !linesToDelete.has(i));
const newContent = newLines.join('\n');

// Write to temporary file
fs.writeFileSync('./server-new.js.cleaned', newContent, 'utf8');

console.log('✅ Wrote cleaned version to server-new.js.cleaned');
console.log('\n🧪 Verifying syntax...');

// Verify syntax
import { execSync } from 'child_process';
try {
  execSync('node --check server-new.js.cleaned', { stdio: 'pipe' });
  console.log('✅ Syntax is valid!');
  console.log('\n📝 Apply changes? Run:');
  console.log('   mv server-new.js.cleaned server-new.js');
} catch (error) {
  console.error('❌ Syntax error in cleaned file!');
  console.error(error.message);
  process.exit(1);
}
