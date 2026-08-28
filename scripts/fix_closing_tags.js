import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// If content ends with undefined or missing tags, fix it:
if (content.includes('undefined')) {
    content = content.replace(/\nundefined\s*$/, '');
}

if (!content.includes('</script>\n</body>\n</html>') && !content.includes('</script>\r\n</body>\r\n</html>')) {
    content += '\n    </script>\n</body>\n</html>';
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed script closing tags in HTML!');
