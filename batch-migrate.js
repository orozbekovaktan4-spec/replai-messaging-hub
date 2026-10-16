#!/usr/bin/env node
// Batch update script to replace all readBusinessesStore() calls with Prisma

import fs from 'fs';
import path from 'path';

const serverFile = './server-new.js';

console.log('🔄 Starting batch migration of server-new.js...\n');

try {
  let content = fs.readFileSync(serverFile, 'utf8');
  let updateCount = 0;

  // Pattern 1: const store = readBusinessesStore(); const business = store.businesses[0];
  const pattern1 = /const store = (await )?readBusinessesStore\(\);\s*const business = store\.businesses\[0\];/g;
  const replacement1 = 'const businesses = await db.getAllBusinesses();\n    const business = businesses[0];';

  const matches1 = content.match(pattern1);
  if (matches1) {
    content = content.replace(pattern1, replacement1);
    updateCount += matches1.length;
    console.log(`✅ Updated ${matches1.length} occurrences of pattern: store.businesses[0]`);
  }

  // Pattern 2: const store = readBusinessesStore(); const business = store.businesses.find(...)
  const pattern2 = /const store = (await )?readBusinessesStore\(\);\s*const business = store\.businesses\.find\(([^)]+)\);/g;
  const replacement2 = (match, p1, findExpr) => {
    return `const businesses = await db.getAllBusinesses();\n    const business = businesses.find(${findExpr});`;
  };

  const matches2 = content.match(pattern2);
  if (matches2) {
    content = content.replace(pattern2, replacement2);
    updateCount += matches2.length;
    console.log(`✅ Updated ${matches2.length} occurrences of pattern: store.businesses.find(...)`);
  }

  // Pattern 3: Replace writeBusinessesStore(store) with comment
  const pattern3 = /\s*writeBusinessesStore\(store\);/g;
  const replacement3 = '\n    // Data saved automatically via Prisma';

  const matches3 = content.match(pattern3);
  if (matches3) {
    content = content.replace(pattern3, replacement3);
    updateCount += matches3.length;
    console.log(`✅ Replaced ${matches3.length} writeBusinessesStore() calls`);
  }

  // Pattern 4: Simple readBusinessesStore at start of function
  const pattern4 = /(\s+)const store = (await )?readBusinessesStore\(\);/g;
  const replacement4 = '$1const businesses = await db.getAllBusinesses();';

  const beforeCount4 = (content.match(pattern4) || []).length;
  content = content.replace(pattern4, replacement4);
  if (beforeCount4 > 0) {
    console.log(`✅ Updated ${beforeCount4} standalone readBusinessesStore() calls`);
    updateCount += beforeCount4;
  }

  // Pattern 5: store.businesses references
  content = content.replace(/store\.businesses/g, 'businesses');
  console.log(`✅ Replaced all store.businesses references`);

  // Write back
  fs.writeFileSync(serverFile, content, 'utf8');

  console.log(`\n✅ Migration complete! Updated ${updateCount} locations.\n`);
  console.log('📋 Next steps:');
  console.log('   1. Review the changes: git diff server-new.js');
  console.log('   2. Test the server: npm start');
  console.log('   3. Test webhooks and admin dashboard');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
