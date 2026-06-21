const fs = require('fs');

const builderPath = 'c:\\Users\\Admin\\Documents\\Wisdom-eye\\src\\app\\lms-admin\\courses\\[id]\\page-builder\\page.js';
const content = fs.readFileSync(builderPath, 'utf8');

const lines = content.split('\n');
let foundRegularBlock = false;
lines.forEach((line, index) => {
  if (line.includes('Regular Block') || (line.includes('block-hover') && index > 2880)) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
