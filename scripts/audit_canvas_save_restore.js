import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const saveMatches = content.match(/ctx2d\.save\(\)|ctx\.save\(\)/g) || [];
const restoreMatches = content.match(/ctx2d\.restore\(\)|ctx\.restore\(\)/g) || [];

console.log('Total save() calls:', saveMatches.length);
console.log('Total restore() calls:', restoreMatches.length);
