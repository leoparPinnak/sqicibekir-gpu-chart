import fs from 'fs';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix header HTML layout (remove broken extra div)
    const oldHeaderSnippet = `                <div class="live-price-box">
                    <span class="ws-status-dot" id="ws-dot" title="Canlı Veri Akışı"></span>
                    <span id="price-val">Yükleniyor...</span>
                    <span class="api-source-badge" id="header-api-source">Binance WS API</span>
                </div>
            </div>

            
                <!-- TEMA DEĞİŞTİRME BUTONU (BEYAZ / SİYAH TEMA) -->
                <button class="theme-toggle-btn" id="btn-theme-toggle" onclick="toggleTheme()" title="Açık (Beyaz) / Koyu Tema">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    <span id="theme-btn-label">BEYAZ TEMA</span>
                </button>
            </div>

            <div class="indicator-nav"></div>
        </div>`;

    const cleanHeaderSnippet = `                <div class="live-price-box">
                    <span class="ws-status-dot" id="ws-dot" title="Canlı Veri Akışı"></span>
                    <span id="price-val">Yükleniyor...</span>
                    <span class="api-source-badge" id="header-api-source">Binance WS API</span>
                </div>

                <!-- TEMA DEĞİŞTİRME BUTONU (BEYAZ / SİYAH TEMA) -->
                <button class="theme-toggle-btn" id="btn-theme-toggle" onclick="toggleTheme()" title="Açık (Beyaz) / Koyu Tema">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    <span id="theme-btn-label">BEYAZ TEMA</span>
                </button>
            </div>
        </div>`;

    if (content.includes(oldHeaderSnippet)) {
        content = content.replace(oldHeaderSnippet, cleanHeaderSnippet);
    }

    // 2. Add u_is_light_theme uniform to Fragment Shader
    const oldFsUniforms = `    uniform int u_show_cloud;
    uniform int u_show_ema;
    uniform int u_show_bg;

    uniform sampler2D u_candle_tex;
    uniform sampler2D u_ind_tex;
    uniform float u_total_candles;
        uniform float u_load_anim; // 0.0 -> 1.0 Doğal Logaritmik Açılış Animasyonu
        out vec4 fragColor;`;

    const cleanFsUniforms = `    uniform int u_show_cloud;
    uniform int u_show_ema;
    uniform int u_show_bg;
    uniform int u_is_light_theme;

    uniform sampler2D u_candle_tex;
    uniform sampler2D u_ind_tex;
    uniform float u_total_candles;
    uniform float u_load_anim;
    out vec4 fragColor;`;

    content = content.replace(oldFsUniforms, cleanFsUniforms);

    // 3. Update Fragment Shader background color & grid for Light Theme
    const oldShaderBg = `        // Koyu Uzay Arka Planı
        vec3 col = vec3(0.042, 0.062, 0.105);

        float visibleCount = max(1.0, u_view_range.y - u_view_range.x);
        float currentCandleIdx = u_view_range.x + uv.x * visibleCount;
        float candleCenterIdx = floor(currentCandleIdx) + 0.5;
        float texCoordX = clamp(candleCenterIdx / max(1.0, u_total_candles), 0.0, 1.0);

        vec4 indData = texture(u_ind_tex, vec2(texCoordX, 0.5));
        float htfRegime = indData.r;
        float sa1H = indData.g;
        float sb1H = indData.b;
        float ema4HLive = indData.a;

        if (u_show_bg == 1 && u_total_candles > 0.0) {
            if (htfRegime > 0.5) {
                col = mix(col, vec3(0.06, 0.85, 0.35), 0.07);
            } else if (htfRegime < -0.5) {
                col = mix(col, vec3(0.95, 0.15, 0.25), 0.07);
            }
        }

        float gridY = fract(uv.y * 8.0);
        float hLine = smoothstep(0.025, 0.0, abs(gridY - 0.5) * 2.0);
        col += vec3(0.12, 0.18, 0.28) * hLine * 0.4;

        float gridX = fract(uv.x * 10.0);
        float vLine = smoothstep(0.025, 0.0, abs(gridX - 0.5) * 2.0);
        col += vec3(0.12, 0.18, 0.28) * vLine * 0.25;`;

    const cleanShaderBg = `        // Arka Plan Rengi: Açık (Beyaz) veya Koyu (Siyah)
        vec3 col = (u_is_light_theme == 1) ? vec3(0.988, 0.992, 0.996) : vec3(0.042, 0.062, 0.105);

        float visibleCount = max(1.0, u_view_range.y - u_view_range.x);
        float currentCandleIdx = u_view_range.x + uv.x * visibleCount;
        float candleCenterIdx = floor(currentCandleIdx) + 0.5;
        float texCoordX = clamp(candleCenterIdx / max(1.0, u_total_candles), 0.0, 1.0);

        vec4 indData = texture(u_ind_tex, vec2(texCoordX, 0.5));
        float htfRegime = indData.r;
        float sa1H = indData.g;
        float sb1H = indData.b;
        float ema4HLive = indData.a;

        if (u_show_bg == 1 && u_total_candles > 0.0) {
            if (htfRegime > 0.5) {
                col = mix(col, (u_is_light_theme == 1) ? vec3(0.12, 0.85, 0.45) : vec3(0.06, 0.85, 0.35), 0.06);
            } else if (htfRegime < -0.5) {
                col = mix(col, (u_is_light_theme == 1) ? vec3(0.95, 0.25, 0.35) : vec3(0.95, 0.15, 0.25), 0.06);
            }
        }

        float gridY = fract(uv.y * 8.0);
        float hLine = smoothstep(0.025, 0.0, abs(gridY - 0.5) * 2.0);
        vec3 gridCol = (u_is_light_theme == 1) ? vec3(0.85, 0.88, 0.92) : vec3(0.12, 0.18, 0.28);
        col = mix(col, gridCol, hLine * (u_is_light_theme == 1 ? 0.35 : 0.4));

        float gridX = fract(uv.x * 10.0);
        float vLine = smoothstep(0.025, 0.0, abs(gridX - 0.5) * 2.0);
        col = mix(col, gridCol, vLine * (u_is_light_theme == 1 ? 0.25 : 0.25));`;

    content = content.replace(oldShaderBg, cleanShaderBg);

    // 4. Uniform setup in JS
    const oldUniformLocs = `                uCandleTex = gl.getUniformLocation(prog, 'u_candle_tex');
                uIndTex = gl.getUniformLocation(prog, 'u_ind_tex');
                uTotalCandles = gl.getUniformLocation(prog, 'u_total_candles');
                uLoadAnim = gl.getUniformLocation(prog, 'u_load_anim');`;

    const cleanUniformLocs = `                uCandleTex = gl.getUniformLocation(prog, 'u_candle_tex');
                uIndTex = gl.getUniformLocation(prog, 'u_ind_tex');
                uTotalCandles = gl.getUniformLocation(prog, 'u_total_candles');
                uLoadAnim = gl.getUniformLocation(prog, 'u_load_anim');
                uIsLightTheme = gl.getUniformLocation(prog, 'u_is_light_theme');`;

    content = content.replace(oldUniformLocs, cleanUniformLocs);

    // 5. Declare uIsLightTheme variable
    const oldDecl = `let uShowCloud, uShowEma, uShowBg;`;
    const cleanDecl = `let uShowCloud, uShowEma, uShowBg, uIsLightTheme;`;
    content = content.replace(oldDecl, cleanDecl);

    // 6. Uniform upload in render loop
    const oldUniformUpload = `                    gl.uniform1i(uShowCloud, layers.cloud);
                    gl.uniform1i(uShowEma, layers.ema);
                    gl.uniform1i(uShowBg, layers.bg);`;

    const cleanUniformUpload = `                    gl.uniform1i(uShowCloud, layers.cloud);
                    gl.uniform1i(uShowEma, layers.ema);
                    gl.uniform1i(uShowBg, layers.bg);
                    if (uIsLightTheme) {
                        gl.uniform1i(uIsLightTheme, currentTheme === 'light' ? 1 : 0);
                    }`;

    content = content.replace(oldUniformUpload, cleanUniformUpload);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleanly fixed theme header and shader in ${filePath}`);
}

fixFile('indikator_sablonu.html');
fixFile('index.html');
