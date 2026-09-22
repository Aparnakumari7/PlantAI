#!/usr/bin/env node

/**
 * Helper script to update frontend API URL after Render deployment
 * Usage: node setup-backend-url.js <backend-url>
 * Example: node setup-backend-url.js https://drplant-ai-backend.onrender.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Missing backend URL');
  console.error('Usage: node setup-backend-url.js <backend-url>');
  console.error('Example: node setup-backend-url.js https://drplant-ai-backend.onrender.com');
  process.exit(1);
}

const backendUrl = args[0];

// Validate URL
try {
  new URL(backendUrl);
} catch (e) {
  console.error('❌ Invalid URL format:', backendUrl);
  process.exit(1);
}

// Files to update
const files = [
  'src/services/apiService.js',
  'src/services/aiService.js'
];

console.log(`\n🚀 Updating API endpoints to use: ${backendUrl}\n`);

let filesUpdated = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipped (not found): ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Replace common API endpoint patterns
  const patterns = [
    // localhost patterns
    /http:\/\/localhost:5000/g,
    /http:\/\/localhost:\d+/g,
    /process\.env\.VITE_API_URL \|\| 'http:\/\/localhost:\d+'/g,
    
    // Old Render patterns (if any)
    /https:\/\/[a-z0-9-]+\.onrender\.com/g,
  ];

  patterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, backendUrl);
    }
  });

  // If no replacements were made, add it as a constant
  if (content === originalContent) {
    // Check if it already has VITE_API_URL
    if (content.includes('VITE_API_URL')) {
      console.log(`ℹ️  Already configured: ${file}`);
      return;
    }
    
    // Add VITE_API_URL constant
    content = `// Backend API URL\nconst API_URL = process.env.VITE_API_URL || '${backendUrl}';\n\n${content}`;
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  filesUpdated++;
  console.log(`✅ Updated: ${file}`);
});

// Update .env
const envPath = path.join(__dirname, '.env');
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

if (envContent.includes('VITE_API_URL')) {
  envContent = envContent.replace(/VITE_API_URL=.*/, `VITE_API_URL=${backendUrl}`);
} else {
  envContent += `\n# Backend API\nVITE_API_URL=${backendUrl}\n`;
}

fs.writeFileSync(envPath, envContent, 'utf-8');
console.log(`✅ Updated: .env`);

console.log(`\n✨ Done! Backend URL updated to: ${backendUrl}`);
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Verify frontend works');
console.log('3. Push to GitHub');
console.log('4. Vercel will auto-deploy\n');
