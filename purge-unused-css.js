/**
 * Remove unused CSS blocks from a MERGED style.css that contains
 * separators "FROM: assets/css/xxx.css".
 * Keeps: global, bootstrap, slick, slick-theme, style
 * Removes: fontawesome, flaticon, nice-select, rs6
 *
 * Run only when you have the full merged style.css (e.g. after re-merging
 * all CSS from assets/css). Normalize line endings and check result size before writing.
 */
const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, 'style.css');
let css = fs.readFileSync(stylePath, 'utf8');

// Normalize to \n for matching
const normalized = css.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const KEEP = [
  'assets/css/global.css',
  'assets/css/bootstrap.min.css',
  'assets/css/slick.css',
  'assets/css/slick-theme.css',
  'assets/css/style.css'
];

const marker = '/* ==========================\n   FROM: ';
const sections = [];
let pos = 0;
while (pos < normalized.length) {
  const idx = normalized.indexOf(marker, pos);
  if (idx === -1) break;
  const endMarker = '   ========================== */';
  const endIdx = normalized.indexOf(endMarker, idx);
  if (endIdx === -1) break;
  const nameStart = idx + marker.length;
  const nameEnd = normalized.indexOf('\n', nameStart);
  const name = normalized.slice(nameStart, nameEnd).trim();
  const nextSection = normalized.indexOf(marker, endIdx + 1);
  const contentEnd = nextSection === -1 ? normalized.length : nextSection;
  const content = normalized.slice(idx, contentEnd);
  sections.push({ name, content });
  pos = contentEnd;
}

let result = sections.filter(s => KEEP.includes(s.name)).map(s => s.content).join('\n\n');
const beforeFirst = normalized.indexOf(marker);
if (beforeFirst > 0) {
  result = normalized.slice(0, beforeFirst) + result;
}

const minLength = 50000;
if (result.length < minLength) {
  console.error('Safety: result too small (' + result.length + '). Not writing. Check that style.css has merged sections.');
  process.exit(1);
}

fs.writeFileSync(stylePath, result, 'utf8');
console.log('Removed fontawesome, flaticon, nice-select, rs6. Kept:', KEEP.join(', '));
console.log('New size:', (result.length / 1024).toFixed(1), 'KB');
