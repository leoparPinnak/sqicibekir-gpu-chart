import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const targetFragmentStart = `    <!-- ==================== VERTEX SHADER ==================== -->`;

const cleanStatusbarWithHud = `                </div>

                <!-- ⚡ HER AN GÖRÜNÜR İVME, MAX VE EŞİK AŞIM HUD BARI -->
                <div class="persistent-velocity-hud" id="persistent-velocity-hud" title="Canlı Yatay İvme (vx), En Yüksek Zirve İvme (vmax) ve Eşik Durumu">
                    <div class="hud-stat-item">
                        <span class="hud-lbl">İVME:</span>
                        <b id="hud-live-vx" class="hud-val-active">0.00</b> <small>px/ms</small>
                    </div>
                    <div class="hud-stat-item">
                        <span class="hud-lbl">MAX:</span>
                        <b id="hud-max-vx" class="hud-val-max" title="Zirve Hızı Sıfırla (Tıkla)">0.00</b> <small>px/ms</small>
                        <span class="hud-reset-btn" onclick="resetMaxVelocity(event)" title="Zirve İvmeyi Sıfırla">↺</span>
                    </div>
                    <div id="hud-alert-badge" class="hud-status-badge free">
                        <span class="badge-dot"></span>
                        <span id="hud-alert-text">MANUEL SERBEST</span>
                    </div>
                </div>
            </div>
            <div>
                <span id="active-strat-footer" style="color: #64748b;">TradeChart Pro Engine // v2.0 Modular</span>
            </div>
        </div>

    </div>

    <!-- ==================== VERTEX SHADER ==================== -->`;

content = content.replace(targetFragmentStart, cleanStatusbarWithHud);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully added persistent HUD and restored bottom statusbar closure!');
