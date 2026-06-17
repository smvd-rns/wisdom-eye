const fs = require('fs');
const html = fs.readFileSync('scratch/embed.html', 'utf8');

function findString(str) {
  let idx = 0;
  let matches = [];
  while ((idx = html.indexOf(str, idx)) !== -1) {
    matches.push(html.substring(idx, idx + 80));
    idx += str.length;
    if (matches.length >= 10) break;
  }
  console.log(`Matches for "${str}":`, matches);
}

findString('title');
findString('length');
findString('duration');
findString('approx');
findString('seconds');
