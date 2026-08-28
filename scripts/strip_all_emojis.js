import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Strip all emojis from entire file:
const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u{1F300}-\u{1FAFF}]/gu;
content = content.replace(emojiRegex, '');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Stripped ALL emojis cleanly!');
