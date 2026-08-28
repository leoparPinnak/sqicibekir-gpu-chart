import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Find all elements referenced with document.getElementById('vbt-...') or similar
const vbtMatches = content.match(/document\.getElementById\(['"](vbt-[^'"]+|active-strat-footer)['"]\)/g);
console.log('Matches found:', vbtMatches);
