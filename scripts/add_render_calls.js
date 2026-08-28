import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `                if (drawingEngine) {
                    drawingEngine.render(ctx2d);
                }`;

const replacement = `                renderOverlayIndicators(ctx2d, cssW, cssH, minPrice, maxPrice, smoothViewStart, smoothViewEnd);
                renderAllSubpanes();

                if (drawingEngine) {
                    drawingEngine.render(ctx2d);
                }`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Added renderOverlayIndicators and renderAllSubpanes to render loop!');
