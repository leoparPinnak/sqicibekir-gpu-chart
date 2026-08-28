import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `                        <!-- HiDPI Keskin Vektör & Havai Fişek Canvas -->
                        <canvas id="overlay-canvas"></canvas>
                    </div>

                    <!-- ALT TARİH / ZAMAN BARI -->`;

const replacement = `                        <!-- HiDPI Keskin Vektör & Havai Fişek Canvas -->
                        <canvas id="overlay-canvas"></canvas>
                    </div>

                    <!-- 📊 ALT GÖSTERGE PANELLERİ (RSI, MACD, HACİM, ATR) -->
                    <div class="subpanes-wrapper" id="subpanes-wrapper"></div>

                    <!-- ALT TARİH / ZAMAN BARI -->`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Added subpanes-wrapper to HTML layout!');
