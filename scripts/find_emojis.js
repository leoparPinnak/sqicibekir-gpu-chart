const fs = require('fs');
const content = fs.readFileSync('indikator_sablonu.html', 'utf8');
const lines = content.split('\n');
const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u{1F300}-\u{1FAFF}]/gu;

let total = 0;
lines.forEach((line, idx) => {
    const matches = line.match(emojiRegex);
    if (matches) {
        total += matches.length;
        console.log(`L${idx+1}: [${matches.join(' ')}] ${line.trim().substring(0, 90)}`);
    }
});
console.log('TOTAL EMOJIS FOUND:', total);
