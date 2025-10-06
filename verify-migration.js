// Verification script for local monument images migration
const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFYING LOCAL MONUMENT IMAGES MIGRATION\n');
console.log('='.repeat(60));

// 1. Check if public/monuments folder exists
const monumentsPath = path.join(__dirname, 'frontend', 'public', 'monuments');
console.log('\n1. Checking monuments folder...');
if (fs.existsSync(monumentsPath)) {
  console.log('   ✅ Monuments folder exists');
  
  // Count images
  const files = fs.readdirSync(monumentsPath);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
  console.log(`   ✅ Found ${imageFiles.length} image files`);
  
  // Calculate total size
  let totalSize = 0;
  imageFiles.forEach(file => {
    const stats = fs.statSync(path.join(monumentsPath, file));
    totalSize += stats.size;
  });
  console.log(`   ✅ Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.log('   ❌ Monuments folder does NOT exist!');
  console.log('   📝 Run: mkdir frontend/public/monuments');
  process.exit(1);
}

// 2. Check file formats
console.log('\n2. File formats breakdown:');
const formats = {};
const files = fs.readdirSync(monumentsPath);
files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  formats[ext] = (formats[ext] || 0) + 1;
});
Object.entries(formats).forEach(([ext, count]) => {
  console.log(`  ${ext}: ${count} files`);
});

// 3. Check if IndianMonumentsCarousel.tsx exists and uses local paths
console.log('\n3. Checking IndianMonumentsCarousel.tsx...');
const carouselPath = path.join(__dirname, 'frontend', 'src', 'components', 'IndianMonumentsCarousel.tsx');
if (fs.existsSync(carouselPath)) {
  const content = fs.readFileSync(carouselPath, 'utf8');
  
  // Check for local paths
  const localPathCount = (content.match(/\/monuments\//g) || []).length;
  const unsplashCount = (content.match(/unsplash\.com/g) || []).length;
  
  console.log(`   ✅ Component exists`);
  console.log(`   ✅ Local paths: ${localPathCount}`);
  console.log(`   ${unsplashCount === 0 ? '✅' : '❌'} Unsplash URLs: ${unsplashCount}`);
  
  if (unsplashCount > 0) {
    console.log('   ⚠️  Warning: Still using Unsplash URLs!');
  }
} else {
  console.log('   ❌ Component file not found!');
}

// 4. Check if MobileHomeView.tsx exists and uses local paths
console.log('\n4. Checking MobileHomeView.tsx...');
const mobileViewPath = path.join(__dirname, 'frontend', 'src', 'components', 'MobileHomeView.tsx');
if (fs.existsSync(mobileViewPath)) {
  const content = fs.readFileSync(mobileViewPath, 'utf8');
  
  // Check for local paths
  const localPathCount = (content.match(/\/monuments\//g) || []).length;
  const unsplashCount = (content.match(/unsplash\.com/g) || []).length;
  
  console.log(`   ✅ Component exists`);
  console.log(`   ✅ Local paths: ${localPathCount}`);
  console.log(`   ${unsplashCount === 0 ? '✅' : '❌'} Unsplash URLs: ${unsplashCount}`);
  
  if (unsplashCount > 0) {
    console.log('   ⚠️  Warning: Still using Unsplash URLs in mobile view!');
  }
} else {
  console.log('   ❌ Component file not found!');
}

// 5. List all monument images
console.log('\n5. Monument images inventory:');
const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
imageFiles.sort().forEach((file, index) => {
  const stats = fs.statSync(path.join(monumentsPath, file));
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${file.padEnd(70, ' ')} ${sizeMB.padStart(6, ' ')} MB`);
});

// 6. Check for large files (> 3MB)
console.log('\n6. Checking for large files (> 3MB)...');
const largeFiles = imageFiles.filter(file => {
  const stats = fs.statSync(path.join(monumentsPath, file));
  return stats.size > 3 * 1024 * 1024;
});

if (largeFiles.length > 0) {
  console.log(`   ⚠️  Found ${largeFiles.length} large files:`);
  largeFiles.forEach(file => {
    const stats = fs.statSync(path.join(monumentsPath, file));
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`      - ${file} (${sizeMB} MB)`);
  });
  console.log('   💡 Consider compressing these files for better performance');
} else {
  console.log('   ✅ No files larger than 3MB');
}

// 7. Performance recommendations
console.log('\n7. Performance Recommendations:');
const totalSizeMB = files.reduce((sum, file) => {
  const stats = fs.statSync(path.join(monumentsPath, file));
  return sum + stats.size;
}, 0) / 1024 / 1024;

if (totalSizeMB > 15) {
  console.log('   📊 Current total size is high');
  console.log('   💡 Recommended actions:');
  console.log('      1. Compress images to ~80-85% quality');
  console.log('      2. Convert to WebP or AVIF format');
  console.log('      3. Target: < 10MB total size');
} else {
  console.log('   ✅ Total size is reasonable');
}

// Final summary
console.log('\n' + '='.repeat(60));
console.log('\n✅ MIGRATION VERIFICATION COMPLETE!\n');
console.log('📝 Next steps:');
console.log('   1. Start dev server: npm run dev');
console.log('   2. Visit http://localhost:3000');
console.log('   3. Check if images load correctly');
console.log('   4. Test carousel animations');
console.log('   5. Verify text readability over images\n');
