/**
 * 🧪 LIQUID GLASS UI STUDIO & COMPONENT LAB CONTROLLER
 * Real-time reactive parameter binding, Cookie sequence counter & JSON preset manager
 */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 🍪 COOKIE YARDIMCI FONKSİYONLARI (COOKIE UTILS)
    // ========================================================
    function setCookie(name, value, days = 365) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    function eraseCookie(name) {
        document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
    }

    // ========================================================
    // 1. PANEL TAB SWITCHER (CAM FİZİĞİ, AURORA MOTORU, JSON KAYIT)
    // ========================================================
    const panelTabBtns = document.querySelectorAll('.panel-tab-btn');
    const tabContentGlass = document.getElementById('tab-content-glass');
    const tabContentAurora = document.getElementById('tab-content-aurora');
    const tabContentSaved = document.getElementById('tab-content-saved');

    panelTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            panelTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-panel-tab');
            tabContentGlass.classList.toggle('active', targetTab === 'glass');
            tabContentAurora.classList.toggle('active', targetTab === 'aurora');
            tabContentSaved.classList.toggle('active', targetTab === 'saved');
        });
    });

    // ========================================================
    // 2. CAM FİZİĞİ PARAMETRELERİ
    // ========================================================
    const paramOpacity = document.getElementById('param-opacity');
    const paramBlur = document.getElementById('param-blur');
    const paramSpecular = document.getElementById('param-specular');
    const paramInnerGlow = document.getElementById('param-inner-glow');
    const paramRadius = document.getElementById('param-radius');

    const valOpacity = document.getElementById('val-opacity');
    const valBlur = document.getElementById('val-blur');
    const valSpecular = document.getElementById('val-specular');
    const valInnerGlow = document.getElementById('val-inner-glow');
    const valRadius = document.getElementById('val-radius');

    const cssOutputPreview = document.getElementById('css-output-preview');
    const copyCssBtn = document.getElementById('copy-css-btn');
    const resetParamsBtn = document.getElementById('reset-params-btn');

    const PRESETS = {
        visionos: {
            opacity: 35,
            blur: 20,
            specular: 85,
            innerGlow: 65,
            radius: 9999,
            color: '#2563eb',
            rgb: '37, 99, 235'
        },
        sapphire: {
            opacity: 50,
            blur: 25,
            specular: 95,
            innerGlow: 75,
            radius: 9999,
            color: '#2563eb',
            rgb: '37, 99, 235'
        },
        emerald: {
            opacity: 30,
            blur: 18,
            specular: 90,
            innerGlow: 70,
            radius: 9999,
            color: '#10b981',
            rgb: '16, 185, 129'
        },
        cyberpunk: {
            opacity: 45,
            blur: 30,
            specular: 100,
            innerGlow: 85,
            radius: 12,
            color: '#8b5cf6',
            rgb: '139, 92, 246'
        },
        crystal: {
            opacity: 15,
            blur: 12,
            specular: 95,
            innerGlow: 80,
            radius: 9999,
            color: '#ffffff',
            rgb: '255, 255, 255'
        },
        frost: {
            opacity: 65,
            blur: 40,
            specular: 50,
            innerGlow: 40,
            radius: 18,
            color: '#64748b',
            rgb: '100, 116, 139'
        }
    };

    let currentAccentRGB = '37, 99, 235';
    let currentAccentHex = '#2563eb';

    function updateGlassEngine() {
        const op = parseInt(paramOpacity.value, 10);
        const bl = parseInt(paramBlur.value, 10);
        const sp = parseInt(paramSpecular.value, 10);
        const ig = parseInt(paramInnerGlow.value, 10);
        const rd = parseInt(paramRadius.value, 10);

        valOpacity.textContent = `${op}%`;
        valBlur.textContent = `${bl}px`;
        valSpecular.textContent = `${sp}%`;
        valInnerGlow.textContent = `${ig}%`;
        valRadius.textContent = rd >= 9000 ? '9999px (Hap)' : `${rd}px`;

        const root = document.documentElement;
        root.style.setProperty('--glass-opacity', (op / 100).toFixed(2));
        root.style.setProperty('--glass-blur', `${bl}px`);
        root.style.setProperty('--glass-specular-alpha', (sp / 100).toFixed(2));
        root.style.setProperty('--glass-inner-glow-alpha', (ig / 100).toFixed(2));
        root.style.setProperty('--glass-radius', rd >= 9000 ? '9999px' : `${rd}px`);
        root.style.setProperty('--glass-accent-color', currentAccentHex);
        root.style.setProperty('--glass-accent-rgb', currentAccentRGB);

        const radiusStr = rd >= 9000 ? '9999px' : `${rd}px`;
        const cssCode = `.liquid-glass-element {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.10) 100%), rgba(${currentAccentRGB}, ${(op / 100).toFixed(2)});
  backdrop-filter: blur(${bl}px) saturate(200%);
  -webkit-backdrop-filter: blur(${bl}px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-top: 1.5px solid rgba(255, 255, 255, ${(sp / 100).toFixed(2)});
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: ${radiusStr};
  box-shadow: 
    inset 0 1.5px 2px rgba(255, 255, 255, ${(ig / 100).toFixed(2)}),
    inset 0 -1px 1.5px rgba(0, 0, 0, 0.30),
    0 0 20px rgba(${currentAccentRGB}, 0.30),
    0 6px 18px rgba(0, 0, 0, 0.30);
}`;
        cssOutputPreview.textContent = cssCode;
    }

    [paramOpacity, paramBlur, paramSpecular, paramInnerGlow, paramRadius].forEach(slider => {
        slider.addEventListener('input', () => {
            document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
            updateGlassEngine();
        });
    });

    document.querySelectorAll('.preset-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');

            const presetKey = btn.getAttribute('data-preset');
            const conf = PRESETS[presetKey];
            if (conf) {
                paramOpacity.value = conf.opacity;
                paramBlur.value = conf.blur;
                paramSpecular.value = conf.specular;
                paramInnerGlow.value = conf.innerGlow;
                paramRadius.value = conf.radius;
                currentAccentHex = conf.color;
                currentAccentRGB = conf.rgb;

                document.querySelectorAll('.color-dot').forEach(dot => {
                    dot.classList.toggle('active', dot.getAttribute('data-color') === conf.color);
                });

                updateGlassEngine();
            }
        });
    });

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            currentAccentHex = dot.getAttribute('data-color');
            const hex = currentAccentHex.replace('#', '');
            let r = 255, g = 255, b = 255;
            if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
            currentAccentRGB = `${r}, ${g}, ${b}`;
            updateGlassEngine();
        });
    });

    copyCssBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(cssOutputPreview.textContent);
            copyCssBtn.textContent = '✓ Kopyalandı!';
            setTimeout(() => {
                copyCssBtn.textContent = '📋 Kopyala';
            }, 1800);
        } catch (e) {
            console.error('Clipboard error:', e);
        }
    });

    resetParamsBtn.addEventListener('click', () => {
        const defaultPreset = document.querySelector('.preset-pill[data-preset="visionos"]');
        if (defaultPreset) defaultPreset.click();
    });

    // ========================================================
    // 3. AURORA IŞIKLARI & GALAKSİ MOTORU KONTROLCÜSÜ
    // ========================================================
    const sliderAuroraSpeed = document.getElementById('aurora-speed');
    const sliderGalaxyRadius = document.getElementById('galaxy-radius');
    const sliderGalaxyTilt = document.getElementById('galaxy-tilt');
    const sliderAuroraScale = document.getElementById('aurora-scale');
    const sliderAuroraIntensity = document.getElementById('aurora-intensity');
    const sliderAuroraBlur = document.getElementById('aurora-blur');
    const checkboxMouseFollow = document.getElementById('aurora-mouse-follow');
    const resetAuroraBtn = document.getElementById('reset-aurora-btn');

    const valAuroraSpeed = document.getElementById('val-aurora-speed');
    const valGalaxyRadius = document.getElementById('val-galaxy-radius');
    const valGalaxyTilt = document.getElementById('val-galaxy-tilt');
    const valAuroraScale = document.getElementById('val-aurora-scale');
    const valAuroraIntensity = document.getElementById('val-aurora-intensity');
    const valAuroraBlur = document.getElementById('val-aurora-blur');

    const bodyEl = document.body;
    let currentMotionClass = 'motion-galaxy';
    let currentPivotMode = 'center';
    let currentAuroraTheme = 'cosmic';

    bodyEl.classList.add(currentMotionClass);
    bodyEl.classList.add(`theme-${currentAuroraTheme}`);

    function updateAuroraEngine() {
        const spd = parseInt(sliderAuroraSpeed.value, 10);
        const rad = parseInt(sliderGalaxyRadius.value, 10);
        const tlt = parseInt(sliderGalaxyTilt.value, 10);
        const scl = parseFloat(sliderAuroraScale.value);
        const int = parseInt(sliderAuroraIntensity.value, 10);
        const blr = parseInt(sliderAuroraBlur.value, 10);

        valAuroraSpeed.textContent = spd <= 4 ? `${spd}s (Çok Hızlı)` : spd >= 24 ? `${spd}s (Sinematik)` : `${spd}s (Akıcı)`;
        valGalaxyRadius.textContent = `${rad}px`;
        valGalaxyTilt.textContent = `${tlt}° (${tlt === 0 ? 'Düz' : tlt > 50 ? 'Derin Uzay' : 'Uzay Diski'})`;
        valAuroraScale.textContent = `${scl.toFixed(1)}x`;
        valAuroraIntensity.textContent = `${int}%`;
        valAuroraBlur.textContent = `${blr}px`;

        const root = document.documentElement;
        root.style.setProperty('--aurora-speed', `${spd}s`);
        root.style.setProperty('--galaxy-radius', `${rad}px`);
        root.style.setProperty('--galaxy-tilt', `${tlt}deg`);
        root.style.setProperty('--aurora-scale', scl);
        root.style.setProperty('--aurora-intensity', (int / 100).toFixed(2));
        root.style.setProperty('--aurora-blur', `${blr}px`);

        updatePivotCoordinates();
    }

    function updatePivotCoordinates() {
        const root = document.documentElement;
        if (currentPivotMode === 'center') {
            root.style.setProperty('--galaxy-pivot-x', '50vw');
            root.style.setProperty('--galaxy-pivot-y', '50vh');
        } else if (currentPivotMode === 'card') {
            root.style.setProperty('--galaxy-pivot-x', '65vw');
            root.style.setProperty('--galaxy-pivot-y', '40vh');
        } else if (currentPivotMode === 'topleft') {
            root.style.setProperty('--galaxy-pivot-x', '20vw');
            root.style.setProperty('--galaxy-pivot-y', '20vh');
        } else if (currentPivotMode === 'topright') {
            root.style.setProperty('--galaxy-pivot-x', '80vw');
            root.style.setProperty('--galaxy-pivot-y', '25vh');
        } else if (currentPivotMode === 'bottom') {
            root.style.setProperty('--galaxy-pivot-x', '50vw');
            root.style.setProperty('--galaxy-pivot-y', '85vh');
        }
    }

    [sliderAuroraSpeed, sliderGalaxyRadius, sliderGalaxyTilt, sliderAuroraScale, sliderAuroraIntensity, sliderAuroraBlur].forEach(slider => {
        slider.addEventListener('input', updateAuroraEngine);
    });

    document.querySelectorAll('.motion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.motion-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.getAttribute('data-motion');
            bodyEl.classList.remove('motion-galaxy', 'motion-clockwise', 'motion-counter', 'motion-wave', 'motion-pulse', 'motion-vortex');
            currentMotionClass = `motion-${mode}`;
            bodyEl.classList.add(currentMotionClass);
        });
    });

    document.querySelectorAll('.pivot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pivot-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentPivotMode = btn.getAttribute('data-pivot');
            updatePivotCoordinates();
        });
    });

    document.querySelectorAll('.aurora-theme-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aurora-theme-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const theme = btn.getAttribute('data-aurora-theme');
            currentAuroraTheme = theme;
            bodyEl.classList.remove('theme-cosmic', 'theme-cyber', 'theme-fire', 'theme-ocean', 'theme-emerald', 'theme-monochrome');
            bodyEl.classList.add(`theme-${theme}`);
        });
    });

    resetAuroraBtn.addEventListener('click', () => {
        sliderAuroraSpeed.value = 12;
        sliderGalaxyRadius.value = 280;
        sliderGalaxyTilt.value = 35;
        sliderAuroraScale.value = 1.2;
        sliderAuroraIntensity.value = 65;
        sliderAuroraBlur.value = 80;
        
        const defaultMotion = document.querySelector('.motion-btn[data-motion="galaxy"]');
        if (defaultMotion) defaultMotion.click();

        const defaultPivot = document.querySelector('.pivot-btn[data-pivot="center"]');
        if (defaultPivot) defaultPivot.click();

        const defaultTheme = document.querySelector('.aurora-theme-pill[data-aurora-theme="cosmic"]');
        if (defaultTheme) defaultTheme.click();

        updateAuroraEngine();
    });

    // 4. Interactive Mouse Tracking
    let mouseTargetX = 0, mouseTargetY = 0;
    let mouseCurrentX = 0, mouseCurrentY = 0;

    window.addEventListener('mousemove', (e) => {
        if (currentPivotMode === 'mouse') {
            document.documentElement.style.setProperty('--galaxy-pivot-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--galaxy-pivot-y', `${e.clientY}px`);
        }

        if (!checkboxMouseFollow.checked) return;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mouseTargetX = ((e.clientX - cx) / cx) * 35;
        mouseTargetY = ((e.clientY - cy) / cy) * 35;
    });

    function renderMouseParallax() {
        if (checkboxMouseFollow.checked) {
            mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.08;
            mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.08;
            document.documentElement.style.setProperty('--aurora-mouse-x', `${mouseCurrentX.toFixed(2)}px`);
            document.documentElement.style.setProperty('--aurora-mouse-y', `${mouseCurrentY.toFixed(2)}px`);
        } else {
            document.documentElement.style.setProperty('--aurora-mouse-x', `0px`);
            document.documentElement.style.setProperty('--aurora-mouse-y', `0px`);
        }
        requestAnimationFrame(renderMouseParallax);
    }
    renderMouseParallax();

    // ========================================================
    // 5. 💾 JSON KAYIT & ÇEREZ SAYACI YÖNETİMİ
    // ========================================================
    const COOKIE_SEQ_KEY = 'liquid_glass_seq_num';
    const LOCAL_PRESETS_KEY = 'liquid_glass_presets_db';

    const headerSeqBadge = document.getElementById('header-seq-badge');
    const currentCookieSeqDisplay = document.getElementById('current-cookie-seq-display');
    const saveBtnLabel = document.getElementById('save-btn-label');
    const savePresetNameInput = document.getElementById('save-preset-name-input');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const resetCookieSeqBtn = document.getElementById('reset-cookie-seq-btn');
    const importJsonInput = document.getElementById('import-json-input');
    const exportAllJsonBtn = document.getElementById('export-all-json-btn');
    const savedPresetsListEl = document.getElementById('saved-presets-list');
    const savedPresetsCountEl = document.getElementById('saved-presets-count');
    const saveToastMsg = document.getElementById('save-toast-msg');

    // Get current sequence counter from cookie or localStorage
    function getNextSequenceNumber() {
        let cookieVal = getCookie(COOKIE_SEQ_KEY);
        if (!cookieVal) {
            cookieVal = localStorage.getItem(COOKIE_SEQ_KEY) || '1';
        }
        return parseInt(cookieVal, 10) || 1;
    }

    function updateSequenceUI() {
        const nextSeq = getNextSequenceNumber();
        headerSeqBadge.textContent = `#${nextSeq}`;
        currentCookieSeqDisplay.textContent = `#${nextSeq}`;
        saveBtnLabel.textContent = `💾 JSON Olarak Kaydet & İndir (#${nextSeq})`;
    }

    function showToast(message) {
        saveToastMsg.textContent = message;
        saveToastMsg.style.display = 'block';
        setTimeout(() => {
            saveToastMsg.style.display = 'none';
        }, 3200);
    }

    // Get presets DB from localStorage
    function getStoredPresets() {
        try {
            const raw = localStorage.getItem(LOCAL_PRESETS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Presets parse error:', e);
            return [];
        }
    }

    function saveStoredPresets(presets) {
        localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(presets));
        renderSavedPresetsList();
    }

    // Render Saved Presets Cards
    function renderSavedPresetsList() {
        const presets = getStoredPresets();
        savedPresetsCountEl.textContent = `${presets.length} Kayıt`;

        if (presets.length === 0) {
            savedPresetsListEl.innerHTML = `
                <div style="text-align: center; color: #64748b; font-size: 11.5px; padding: 20px 0;">
                    Henüz kayıtlı bir JSON şablonu bulunmuyor.<br>Yukarıdaki butona tıklayarak ilk şablonunu kaydet!
                </div>`;
            return;
        }

        savedPresetsListEl.innerHTML = presets.map((p, index) => {
            return `
                <div class="saved-preset-card" data-preset-id="${p.configId}">
                    <div class="preset-card-header">
                        <div class="preset-card-title">
                            <span class="preset-card-seq">#${p.sequenceNumber}</span>
                            <span>${escapeHtml(p.name)}</span>
                        </div>
                        <span class="preset-card-date">${p.formattedDate || ''}</span>
                    </div>
                    <div class="preset-card-tags">
                        <span class="preset-tag" style="color: ${p.glassPhysics?.accentColor || '#60a5fa'};">● ${p.glassPhysics?.accentColor || '#2563eb'}</span>
                        <span class="preset-tag">Cam: %${Math.round((p.glassPhysics?.opacity || 0.35) * 100)}</span>
                        <span class="preset-tag">Blur: ${p.glassPhysics?.blur || 20}px</span>
                        <span class="preset-tag">Mod: ${p.auroraGalaxy?.motionMode || 'galaxy'}</span>
                    </div>
                    <div class="preset-card-actions">
                        <button class="preset-action-btn btn-apply-preset" data-index="${index}">⚡ Yükle</button>
                        <button class="preset-action-btn btn-download-preset" data-index="${index}">📥 JSON</button>
                        <button class="preset-delete-btn btn-delete-preset" data-index="${index}" title="Sil">🗑️</button>
                    </div>
                </div>`;
        }).join('');

        // Attach Card Events
        savedPresetsListEl.querySelectorAll('.btn-apply-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const p = presets[idx];
                if (p) applyConfigurationPayload(p);
            });
        });

        savedPresetsListEl.querySelectorAll('.btn-download-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const p = presets[idx];
                if (p) triggerJsonDownload(p, `liquid_glass_config_#${String(p.sequenceNumber).padStart(3, '0')}.json`);
            });
        });

        savedPresetsListEl.querySelectorAll('.btn-delete-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                presets.splice(idx, 1);
                saveStoredPresets(presets);
                showToast('✓ Şablon silindi.');
            });
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Helper: Trigger JSON file download in browser
    function triggerJsonDownload(dataObj, filename) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    // Helper: Apply loaded configuration to all sliders and engines
    function applyConfigurationPayload(config) {
        if (!config) return;

        // 1. Glass Physics
        if (config.glassPhysics) {
            paramOpacity.value = Math.round((config.glassPhysics.opacity || 0.35) * 100);
            paramBlur.value = config.glassPhysics.blur ?? 20;
            paramSpecular.value = Math.round((config.glassPhysics.specularAlpha || 0.85) * 100);
            paramInnerGlow.value = Math.round((config.glassPhysics.innerGlowAlpha || 0.65) * 100);
            
            const rawRadius = config.glassPhysics.radius || '9999px';
            paramRadius.value = rawRadius.includes('9999') ? 9999 : parseInt(rawRadius, 10) || 16;
            currentAccentHex = config.glassPhysics.accentColor || '#2563eb';
            currentAccentRGB = config.glassPhysics.accentRGB || '37, 99, 235';

            document.querySelectorAll('.color-dot').forEach(dot => {
                dot.classList.toggle('active', dot.getAttribute('data-color') === currentAccentHex);
            });
            updateGlassEngine();
        }

        // 2. Aurora / Galaxy Engine
        if (config.auroraGalaxy) {
            sliderAuroraSpeed.value = config.auroraGalaxy.speedSeconds || 12;
            sliderGalaxyRadius.value = config.auroraGalaxy.galaxyRadius || 280;
            sliderGalaxyTilt.value = config.auroraGalaxy.galaxyTiltDegrees || 35;
            sliderAuroraScale.value = config.auroraGalaxy.scale || 1.2;
            sliderAuroraIntensity.value = Math.round((config.auroraGalaxy.intensity || 0.65) * 100);
            sliderAuroraBlur.value = config.auroraGalaxy.blur || 80;
            checkboxMouseFollow.checked = config.auroraGalaxy.mouseFollow !== false;

            const mode = config.auroraGalaxy.motionMode || 'galaxy';
            const motionBtn = document.querySelector(`.motion-btn[data-motion="${mode}"]`);
            if (motionBtn) motionBtn.click();

            const pivot = config.auroraGalaxy.pivotMode || 'center';
            const pivotBtn = document.querySelector(`.pivot-btn[data-pivot="${pivot}"]`);
            if (pivotBtn) pivotBtn.click();

            const theme = config.auroraGalaxy.theme || 'cosmic';
            const themeBtn = document.querySelector(`.aurora-theme-pill[data-aurora-theme="${theme}"]`);
            if (themeBtn) themeBtn.click();

            updateAuroraEngine();
        }

        showToast(`✓ #${config.sequenceNumber || 1} Nolu Şablon Başarıyla Yüklendi!`);
    }

    // Save JSON Action
    saveJsonBtn.addEventListener('click', () => {
        const seqNum = getNextSequenceNumber();
        const customName = savePresetNameInput.value.trim() || `Sıvı Cam Konfigürasyonu #${seqNum}`;
        const now = new Date();

        const configPayload = {
            sequenceNumber: seqNum,
            configId: `LIQUID_GLASS_PRESET_${String(seqNum).padStart(3, '0')}`,
            name: customName,
            savedAt: now.toISOString(),
            formattedDate: now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            glassPhysics: {
                opacity: parseFloat((parseInt(paramOpacity.value, 10) / 100).toFixed(2)),
                blur: parseInt(paramBlur.value, 10),
                specularAlpha: parseFloat((parseInt(paramSpecular.value, 10) / 100).toFixed(2)),
                innerGlowAlpha: parseFloat((parseInt(paramInnerGlow.value, 10) / 100).toFixed(2)),
                radius: parseInt(paramRadius.value, 10) >= 9000 ? '9999px' : `${paramRadius.value}px`,
                accentColor: currentAccentHex,
                accentRGB: currentAccentRGB
            },
            auroraGalaxy: {
                motionMode: currentMotionClass.replace('motion-', ''),
                pivotMode: currentPivotMode,
                speedSeconds: parseInt(sliderAuroraSpeed.value, 10),
                galaxyRadius: parseInt(sliderGalaxyRadius.value, 10),
                galaxyTiltDegrees: parseInt(sliderGalaxyTilt.value, 10),
                scale: parseFloat(sliderAuroraScale.value),
                intensity: parseFloat((parseInt(sliderAuroraIntensity.value, 10) / 100).toFixed(2)),
                blur: parseInt(sliderAuroraBlur.value, 10),
                theme: currentAuroraTheme,
                mouseFollow: checkboxMouseFollow.checked
            },
            cssCode: cssOutputPreview.textContent,
            platform: "TradeChart Pro Liquid Glass Studio 2.0"
        };

        // 1. Increment and Save Sequence Counter to Cookies and LocalStorage
        const nextSeq = seqNum + 1;
        setCookie(COOKIE_SEQ_KEY, nextSeq.toString(), 365);
        localStorage.setItem(COOKIE_SEQ_KEY, nextSeq.toString());
        updateSequenceUI();

        // 2. Add to Local Presets Database
        const presets = getStoredPresets();
        presets.unshift(configPayload);
        saveStoredPresets(presets);

        // 3. Trigger JSON File Download
        const filename = `liquid_glass_config_#${String(seqNum).padStart(3, '0')}.json`;
        triggerJsonDownload(configPayload, filename);

        // 4. Feedback Toast
        savePresetNameInput.value = '';
        showToast(`✓ #${seqNum} Nolu Konfigürasyon Çerezlere Kaydedildi & İndirildi!`);
    });

    // Reset Cookie Sequence Counter
    resetCookieSeqBtn.addEventListener('click', () => {
        if (confirm('Kayıt sayacını (#1) sıfırlamak istiyor musunuz?')) {
            setCookie(COOKIE_SEQ_KEY, '1', 365);
            localStorage.setItem(COOKIE_SEQ_KEY, '1');
            updateSequenceUI();
            showToast('✓ Sayaç #1 olarak sıfırlandı.');
        }
    });

    // Import JSON File
    importJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (Array.isArray(parsed)) {
                    // Bulk array import
                    const current = getStoredPresets();
                    const combined = [...parsed, ...current];
                    saveStoredPresets(combined);
                    if (parsed.length > 0) applyConfigurationPayload(parsed[0]);
                    showToast(`✓ ${parsed.length} adet şablon içe aktarıldı!`);
                } else {
                    // Single configuration import
                    applyConfigurationPayload(parsed);
                    const presets = getStoredPresets();
                    presets.unshift(parsed);
                    saveStoredPresets(presets);
                }
            } catch (err) {
                console.error('Import error:', err);
                alert('Geçersiz JSON dosyası formatı!');
            }
        };
        reader.readAsText(file);
        importJsonInput.value = '';
    });

    // Export All Presets to Single JSON
    exportAllJsonBtn.addEventListener('click', () => {
        const presets = getStoredPresets();
        if (presets.length === 0) {
            alert('Henüz kayıtlı bir şablon bulunmuyor!');
            return;
        }
        triggerJsonDownload(presets, `liquid_glass_presets_all_${Date.now()}.json`);
        showToast(`✓ Tüm şablonlar (${presets.length} adet) paketlendi!`);
    });

    // ========================================================
    // 6. ARKA PLAN STAGE DEĞİŞTİRİCİ
    // ========================================================
    const bgStage = document.getElementById('lab-bg-stage');
    document.querySelectorAll('.lab-pill-btn[data-bg]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lab-pill-btn[data-bg]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const bgMode = btn.getAttribute('data-bg');
            if (bgMode === 'aurora') {
                bgStage.innerHTML = `
                    <div class="lab-bg-canvas">
                        <div class="aurora-orb orb-1"></div>
                        <div class="aurora-orb orb-2"></div>
                        <div class="aurora-orb orb-3"></div>
                        <div class="aurora-orb orb-4"></div>
                        <div class="lab-grid-overlay"></div>
                    </div>`;
            } else if (bgMode === 'candles') {
                bgStage.innerHTML = `
                    <div class="lab-bg-canvas" style="background: #060913;">
                        <iframe src="../indikator_sablonu.html" style="width: 100%; height: 100%; border: none; pointer-events: none; opacity: 0.85;"></iframe>
                        <div class="lab-grid-overlay"></div>
                    </div>`;
            } else if (bgMode === 'mesh') {
                bgStage.innerHTML = `
                    <div class="lab-bg-canvas" style="background: radial-gradient(circle at 20% 20%, #ec4899 0%, transparent 40%), radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 40%), #090d16;">
                        <div class="lab-grid-overlay"></div>
                    </div>`;
            } else if (bgMode === 'dark') {
                bgStage.innerHTML = `
                    <div class="lab-bg-canvas" style="background: #05070b;">
                        <div class="lab-grid-overlay" style="opacity: 0.2;"></div>
                    </div>`;
            }
        });
    });

    // 7. Interactive Tabs & Steppers in Demo Area
    document.querySelectorAll('.dynamic-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            tab.parentElement.querySelectorAll('.dynamic-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    document.querySelectorAll('.seg-item').forEach(item => {
        item.addEventListener('click', () => {
            item.parentElement.querySelectorAll('.seg-item').forEach(s => s.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Initial Engine Start
    updateGlassEngine();
    updateAuroraEngine();
    updateSequenceUI();
    renderSavedPresetsList();
});
