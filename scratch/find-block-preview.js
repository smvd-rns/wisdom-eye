const fs = require('fs');

const builderPath = 'c:\\Users\\Admin\\Documents\\Wisdom-eye\\src\\app\\lms-admin\\courses\\[id]\\page-builder\\page.js';
const content = fs.readFileSync(builderPath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('function BlockPreview') || line.includes('const BlockPreview')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
