import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Remove Tag #4 completely
const lastScriptIdx = content.lastIndexOf('<script>');
if (lastScriptIdx !== -1) {
    const endScriptIdx = content.indexOf('</script>', lastScriptIdx);
    if (endScriptIdx !== -1) {
        console.log('Removing Tag #4...');
        content = content.substring(0, lastScriptIdx) + content.substring(endScriptIdx + 9);
    }
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Removed duplicate tag #4.');
