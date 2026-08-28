import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. In handleMouseUp: Keep selected tool active continuously after drawing completion
const oldSinglePointFinish = `                                this.drawings.push(newD);
                                this.selectDrawing(newD);
                                if (!this.continuousDraw) { window.selectTvTool('cursor'); } else { this.drawingState = 'idle'; this.drawingInProgress = null; }`;

const newSinglePointFinish = `                                this.drawings.push(newD);
                                this.selectDrawing(newD);
                                this.drawingInProgress = null;
                                this.drawingState = 'idle';
                                // 🌟 Araç kullanıcı kapatana kadar aktif kalmaya devam eder`;

content = content.replace(oldSinglePointFinish, newSinglePointFinish);

const oldTwoPointFinish = `                            this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                            this.drawings.push(this.drawingInProgress);
                            this.selectDrawing(this.drawingInProgress);
                            this.drawingInProgress = null;
                            this.drawingState = 'idle';
                            if (!this.continuousDraw) { window.selectTvTool('cursor'); } else { this.drawingState = 'idle'; this.drawingInProgress = null; }`;

const newTwoPointFinish = `                            this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                            this.drawings.push(this.drawingInProgress);
                            this.selectDrawing(this.drawingInProgress);
                            this.drawingInProgress = null;
                            this.drawingState = 'idle';
                            // 🌟 Araç kullanıcı kapatana kadar aktif kalmaya devam eder (Peş peşe çizim)`;

content = content.replace(oldTwoPointFinish, newTwoPointFinish);

// 2. Enhance Escape key and Right-Click to allow easy tool closing
const oldKeyDown = `            handleKeyDown(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

                if (e.key === 'Escape') {
                    this.cancelDrawing();
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (this.selectedDrawing) {
                        this.drawings = this.drawings.filter(d => d.id !== this.selectedDrawing.id);
                        this.selectDrawing(null);
                    }
                }
            }`;

const newKeyDown = `            handleKeyDown(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

                if (e.key === 'Escape') {
                    if (this.drawingState === 'drawing') {
                        // Çizilmekte olan şekli iptal et, araç modunda kal
                        this.drawingInProgress = null;
                        this.drawingState = 'idle';
                    } else if (this.activeTool !== 'cursor') {
                        // Çizim modundan çıkıp imleç moduna geç
                        window.selectTvTool('cursor');
                        this.selectDrawing(null);
                    } else {
                        this.selectDrawing(null);
                    }
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (this.selectedDrawing) {
                        this.drawings = this.drawings.filter(d => d.id !== this.selectedDrawing.id);
                        this.selectDrawing(null);
                    }
                }
            }`;

content = content.replace(oldKeyDown, newKeyDown);

// 3. Enhance Right Click in initEvents
const oldInitEvents = `                this.container.addEventListener('contextmenu', (e) => {
                    if (this.drawingState === 'drawing') {
                        e.preventDefault();
                        this.cancelDrawing();
                    }
                });`;

const newInitEvents = `                this.container.addEventListener('contextmenu', (e) => {
                    if (this.drawingState === 'drawing') {
                        e.preventDefault();
                        this.drawingInProgress = null;
                        this.drawingState = 'idle';
                    } else if (this.activeTool !== 'cursor') {
                        e.preventDefault();
                        window.selectTvTool('cursor');
                    }
                });`;

content = content.replace(oldInitEvents, newInitEvents);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Persistent drawing mode applied: Tool stays active until user explicitly switches or exits!');
