const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build output...\n');

const outDir = path.join(__dirname, '..', 'out');
const boardDir = path.join(outDir, 'board');

// Check if out directory exists
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: out/ directory does not exist');
  process.exit(1);
}

// Check if board directory exists
if (!fs.existsSync(boardDir)) {
  console.error('❌ Error: out/board/ directory does not exist');
  console.error('   This means no board detail pages were generated!');
  process.exit(1);
}

// Count board pages
const boardPages = fs.readdirSync(boardDir);
const htmlFiles = boardPages.filter(dir => {
  const indexPath = path.join(boardDir, dir, 'index.html');
  return fs.existsSync(indexPath);
});

console.log(`📊 Build verification results:`);
console.log(`   - Total board directories: ${boardPages.length}`);
console.log(`   - Board pages with index.html: ${htmlFiles.length}`);

if (htmlFiles.length === 0) {
  console.error('\n❌ FAILED: No board pages were generated!');
  process.exit(1);
}

if (htmlFiles.length < 900) {
  console.warn(`\n⚠️  WARNING: Only ${htmlFiles.length} board pages generated (expected ~1000+)`);
  console.warn('   Some boards may be missing from the deployment.');
}

console.log('\n✅ Build verification passed!');
console.log(`   ${htmlFiles.length} board pages are ready for deployment.\n`);
