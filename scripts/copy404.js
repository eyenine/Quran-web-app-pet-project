// Copy index.html to 404.html for GitHub Pages SPA routing
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const src = path.join(buildDir, 'index.html');
const dst = path.join(buildDir, '404.html');

try {
  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Check if source file exists
  if (!fs.existsSync(src)) {
    console.error('❌ index.html not found in build directory.');
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(src, dst);
  
  // Read the content and modify for 404.html
  let content = fs.readFileSync(dst, 'utf8');
  
  // Add a comment at the top to indicate this is a copy
  content = `<!-- This file is a copy of index.html for GitHub Pages SPA routing -->\n${content}`;
  
  // Write the modified content back
  fs.writeFileSync(dst, content, 'utf8');
  
  console.log('✅ Successfully copied index.html → 404.html');
  console.log('📍 This enables React Router to work with GitHub Pages');
  
} catch (error) {
  console.error('❌ Error copying 404.html:', error.message);
  process.exit(1);
}
