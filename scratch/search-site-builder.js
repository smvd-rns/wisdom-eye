const fs = require('fs');

const path1 = 'c:\\Users\\Admin\\Documents\\Wisdom-eye\\src\\app\\lms-admin\\site-builder\\[slug]\\page.js';
if (fs.existsSync(path1)) {
  const content = fs.readFileSync(path1, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('isRowBlock') || line.includes('__row__') || line.includes('Columns size=')) {
      console.log(`site-builder/page.js:${index + 1}: ${line.trim()}`);
    }
  });
} else {
  console.log('File not found');
}
