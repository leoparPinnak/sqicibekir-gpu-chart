import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

content = content.replace('class="velocity-popover" id="zoom-duration-popover"', 'class="velocity-settings-popover" id="zoom-duration-popover"');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated popover class to velocity-settings-popover!');
