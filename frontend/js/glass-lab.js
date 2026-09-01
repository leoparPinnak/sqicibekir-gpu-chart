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
    // 2. MODÜLER BİLEŞEN CAM FİZİĞİ MOTORU
    // ========================================================
    
    // 🔘 BUTON KONTROLLERİ
    const paramBtnOpacity = document.getElementById('param-btn-opacity');
    const paramBtnBlur = document.getElementById('param-btn-blur');
    const paramBtnSpecular = document.getElementById('param-btn-specular');
    const paramBtnSpecularWidth = document.getElementById('param-btn-specular-width');
    const paramBtnSpecularTaper = document.getElementById('param-btn-specular-taper');
    const paramBtnInnerGlow = document.getElementById('param-btn-inner-glow');
    const paramBtnInnerGlowSpread = document.getElementById('param-btn-inner-glow-spread');
    const paramBtnRadius = document.getElementById('param-btn-radius');

    const valBtnOpacity = document.getElementById('val-btn-opacity');
    const valBtnBlur = document.getElementById('val-btn-blur');
    const valBtnSpecular = document.getElementById('val-btn-specular');
    const valBtnSpecularWidth = document.getElementById('val-btn-specular-width');
    const valBtnSpecularTaper = document.getElementById('val-btn-specular-taper');
    const valBtnInnerGlow = document.getElementById('val-btn-inner-glow');
    const valBtnInnerGlowSpread = document.getElementById('val-btn-inner-glow-spread');
    const valBtnRadius = document.getElementById('val-btn-radius');

    // ⌨️ GİRDİ KONTROLLERİ (8 PARAMETRE)
    const paramInputOpacity = document.getElementById('param-input-opacity');
    const paramInputBlur = document.getElementById('param-input-blur');
    const paramInputSpecular = document.getElementById('param-input-specular');
    const paramInputSpecularWidth = document.getElementById('param-input-specular-width');
    const paramInputSpecularTaper = document.getElementById('param-input-specular-taper');
    const paramInputInnerGlow = document.getElementById('param-input-inner-glow');
    const paramInputInnerGlowSpread = document.getElementById('param-input-inner-glow-spread');
    const paramInputRadius = document.getElementById('param-input-radius');

    const valInputOpacity = document.getElementById('val-input-opacity');
    const valInputBlur = document.getElementById('val-input-blur');
    const valInputSpecular = document.getElementById('val-input-specular');
    const valInputSpecularWidth = document.getElementById('val-input-specular-width');
    const valInputSpecularTaper = document.getElementById('val-input-specular-taper');
    const valInputInnerGlow = document.getElementById('val-input-inner-glow');
    const valInputInnerGlowSpread = document.getElementById('val-input-inner-glow-spread');
    const valInputRadius = document.getElementById('val-input-radius');

    // 📑 SEKME & ROZET KONTROLLERİ (8 PARAMETRE)
    const paramTabOpacity = document.getElementById('param-tab-opacity');
    const paramTabBlur = document.getElementById('param-tab-blur');
    const paramTabSpecular = document.getElementById('param-tab-specular');
    const paramTabSpecularWidth = document.getElementById('param-tab-specular-width');
    const paramTabSpecularTaper = document.getElementById('param-tab-specular-taper');
    const paramTabInnerGlow = document.getElementById('param-tab-inner-glow');
    const paramTabInnerGlowSpread = document.getElementById('param-tab-inner-glow-spread');
    const paramTabRadius = document.getElementById('param-tab-radius');

    const valTabOpacity = document.getElementById('val-tab-opacity');
    const valTabBlur = document.getElementById('val-tab-blur');
    const valTabSpecular = document.getElementById('val-tab-specular');
    const valTabSpecularWidth = document.getElementById('val-tab-specular-width');
    const valTabSpecularTaper = document.getElementById('val-tab-specular-taper');
    const valTabInnerGlow = document.getElementById('val-tab-inner-glow');
    const valTabInnerGlowSpread = document.getElementById('val-tab-inner-glow-spread');
    const valTabRadius = document.getElementById('val-tab-radius');

    // 🖼️ KONTEYNIR & KART KONTROLLERİ (8 PARAMETRE)
    const paramCardOpacity = document.getElementById('param-card-opacity');
    const paramCardBlur = document.getElementById('param-card-blur');
    const paramCardSpecular = document.getElementById('param-card-specular');
    const paramCardSpecularWidth = document.getElementById('param-card-specular-width');
    const paramCardSpecularTaper = document.getElementById('param-card-specular-taper');
    const paramCardInnerGlow = document.getElementById('param-card-inner-glow');
    const paramCardInnerGlowSpread = document.getElementById('param-card-inner-glow-spread');
    const paramCardRadius = document.getElementById('param-card-radius');

    const valCardOpacity = document.getElementById('val-card-opacity');
    const valCardBlur = document.getElementById('val-card-blur');
    const valCardSpecular = document.getElementById('val-card-specular');
    const valCardSpecularWidth = document.getElementById('val-card-specular-width');
    const valCardSpecularTaper = document.getElementById('val-card-specular-taper');
    const valCardInnerGlow = document.getElementById('val-card-inner-glow');
    const valCardInnerGlowSpread = document.getElementById('val-card-inner-glow-spread');
    const valCardRadius = document.getElementById('val-card-radius');

    const quickPresetSelect = document.getElementById('quick-preset-select');
    const quickPresetCount = document.getElementById('quick-preset-count');

    const cssOutputPreview = document.getElementById('css-output-preview');
    const copyCssBtn = document.getElementById('copy-css-btn');
    const resetParamsBtn = document.getElementById('reset-params-btn');

    // Renk Durumları (Her bileşen için bağımsız)
    const compColors = {
        btn: { hex: '#2563eb', rgb: '37, 99, 235' },
        input: { hex: '#2563eb', rgb: '37, 99, 235' },
        tab: { hex: '#2563eb', rgb: '37, 99, 235' },
        card: { hex: '#2563eb', rgb: '37, 99, 235' }
    };

    // Bileşen Bazlı Renk Paletleri
    document.querySelectorAll('.comp-color-palette').forEach(palette => {
        const comp = palette.getAttribute('data-comp');
        palette.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                palette.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');

                const hex = dot.getAttribute('data-color');
                const rawHex = hex.replace('#', '');
                let r = 255, g = 255, b = 255;
                if (rawHex.length === 6) {
                    r = parseInt(rawHex.substring(0, 2), 16);
                    g = parseInt(rawHex.substring(2, 4), 16);
                    b = parseInt(rawHex.substring(4, 6), 16);
                }
                if (compColors[comp]) {
                    compColors[comp].hex = hex;
                    compColors[comp].rgb = `${r}, ${g}, ${b}`;
                }
                updateGlassEngine();
            });
        });
    });

    const PRESETS = {
        visionos: {
            btn: { opacity: 35, blur: 20, specular: 100, specWidth: 1.5, taper: 80, innerGlow: 65, spread: 6, radius: 9999, color: '#2563eb', rgb: '37, 99, 235' },
            input: { opacity: 25, blur: 20, specular: 90, specWidth: 1.5, taper: 80, innerGlow: 50, spread: 5, radius: 9999, color: '#2563eb', rgb: '37, 99, 235' },
            tab: { opacity: 40, blur: 16, specular: 120, specWidth: 1.5, taper: 80, innerGlow: 60, spread: 6, radius: 9999, color: '#2563eb', rgb: '37, 99, 235' },
            card: { opacity: 20, blur: 0, specular: 80, specWidth: 1.5, taper: 80, innerGlow: 40, spread: 8, radius: 24, color: '#2563eb', rgb: '37, 99, 235' }
        },
        sapphire: {
            btn: { opacity: 50, blur: 25, specular: 140, specWidth: 2.0, taper: 85, innerGlow: 110, spread: 8, radius: 9999, color: '#2563eb', rgb: '37, 99, 235' },
            input: { opacity: 35, blur: 25, specular: 110, specWidth: 2.0, taper: 85, innerGlow: 70, spread: 6, radius: 9999, color: '#2563eb', rgb: '37, 99, 235' },
            tab: { opacity: 55, blur: 20, specular: 140, specWidth: 2.0, taper: 85, innerGlow: 80, spread: 7, radius: 9999, color: '#2563eb', rgb: '37, 99, 235' },
            card: { opacity: 28, blur: 0, specular: 110, specWidth: 2.0, taper: 85, innerGlow: 60, spread: 10, radius: 26, color: '#2563eb', rgb: '37, 99, 235' }
        },
        emerald: {
            btn: { opacity: 30, blur: 18, specular: 120, specWidth: 1.5, taper: 75, innerGlow: 95, spread: 6, radius: 9999, color: '#10b981', rgb: '16, 185, 129' },
            input: { opacity: 20, blur: 18, specular: 85, specWidth: 1.5, taper: 75, innerGlow: 45, spread: 5, radius: 9999, color: '#10b981', rgb: '16, 185, 129' },
            tab: { opacity: 35, blur: 14, specular: 115, specWidth: 1.5, taper: 75, innerGlow: 55, spread: 5, radius: 9999, color: '#10b981', rgb: '16, 185, 129' },
            card: { opacity: 18, blur: 0, specular: 75, specWidth: 1.5, taper: 75, innerGlow: 35, spread: 7, radius: 22, color: '#10b981', rgb: '16, 185, 129' }
        },
        cyberpunk: {
            btn: { opacity: 45, blur: 30, specular: 180, specWidth: 2.5, taper: 90, innerGlow: 140, spread: 12, radius: 12, color: '#8b5cf6', rgb: '139, 92, 246' },
            input: { opacity: 30, blur: 30, specular: 140, specWidth: 2.0, taper: 90, innerGlow: 80, spread: 8, radius: 12, color: '#8b5cf6', rgb: '139, 92, 246' },
            tab: { opacity: 50, blur: 24, specular: 160, specWidth: 2.0, taper: 90, innerGlow: 90, spread: 9, radius: 12, color: '#8b5cf6', rgb: '139, 92, 246' },
            card: { opacity: 25, blur: 0, specular: 130, specWidth: 2.0, taper: 90, innerGlow: 70, spread: 12, radius: 20, color: '#8b5cf6', rgb: '139, 92, 246' }
        },
        crystal: {
            btn: { opacity: 15, blur: 12, specular: 150, specWidth: 1.0, taper: 70, innerGlow: 120, spread: 7, radius: 9999, color: '#ffffff', rgb: '255, 255, 255' },
            input: { opacity: 10, blur: 12, specular: 100, specWidth: 1.0, taper: 70, innerGlow: 40, spread: 4, radius: 9999, color: '#ffffff', rgb: '255, 255, 255' },
            tab: { opacity: 20, blur: 10, specular: 130, specWidth: 1.0, taper: 70, innerGlow: 50, spread: 5, radius: 9999, color: '#ffffff', rgb: '255, 255, 255' },
            card: { opacity: 12, blur: 0, specular: 90, specWidth: 1.0, taper: 70, innerGlow: 30, spread: 6, radius: 24, color: '#ffffff', rgb: '255, 255, 255' }
        },
        frost: {
            btn: { opacity: 65, blur: 40, specular: 70, specWidth: 1.5, taper: 60, innerGlow: 50, spread: 5, radius: 18, color: '#64748b', rgb: '100, 116, 139' },
            input: { opacity: 50, blur: 40, specular: 60, specWidth: 1.5, taper: 60, innerGlow: 35, spread: 4, radius: 18, color: '#64748b', rgb: '100, 116, 139' },
            tab: { opacity: 60, blur: 35, specular: 80, specWidth: 1.5, taper: 60, innerGlow: 45, spread: 5, radius: 18, color: '#64748b', rgb: '100, 116, 139' },
            card: { opacity: 40, blur: 0, specular: 50, specWidth: 1.5, taper: 60, innerGlow: 25, spread: 6, radius: 24, color: '#64748b', rgb: '100, 116, 139' }
        }
    };

    function updateGlassEngine() {
        // 1. BUTONLAR (8 PARAMETRE)
        const btnOp = parseInt(paramBtnOpacity ? paramBtnOpacity.value : 35, 10);
        const btnBl = parseInt(paramBtnBlur ? paramBtnBlur.value : 20, 10);
        const btnSp = parseInt(paramBtnSpecular ? paramBtnSpecular.value : 100, 10);
        const btnSpWidth = parseFloat(paramBtnSpecularWidth ? paramBtnSpecularWidth.value : 1.5);
        const btnTpr = parseInt(paramBtnSpecularTaper ? paramBtnSpecularTaper.value : 80, 10);
        const btnIg = parseInt(paramBtnInnerGlow ? paramBtnInnerGlow.value : 65, 10);
        const btnIgSpread = parseInt(paramBtnInnerGlowSpread ? paramBtnInnerGlowSpread.value : 6, 10);
        const btnRd = parseInt(paramBtnRadius ? paramBtnRadius.value : 9999, 10);

        if (valBtnOpacity) valBtnOpacity.textContent = `${btnOp}%`;
        if (valBtnBlur) valBtnBlur.textContent = btnBl === 0 ? '0px (Kristal Net)' : btnBl >= 35 ? `${btnBl}px (Buzlu Cam)` : `${btnBl}px`;
        if (valBtnSpecular) valBtnSpecular.textContent = btnSp > 100 ? `${btnSp}% (Süper Parlak)` : `${btnSp}%`;
        if (valBtnSpecularWidth) valBtnSpecularWidth.textContent = `${btnSpWidth.toFixed(1)}px`;
        if (valBtnSpecularTaper) valBtnSpecularTaper.textContent = btnTpr >= 80 ? `${btnTpr}% (İpeksi)` : `${btnTpr}%`;
        if (valBtnInnerGlow) valBtnInnerGlow.textContent = btnIg > 100 ? `${btnIg}% (Süper)` : `${btnIg}%`;
        if (valBtnInnerGlowSpread) valBtnInnerGlowSpread.textContent = `${btnIgSpread}px`;
        if (valBtnRadius) valBtnRadius.textContent = btnRd >= 9000 ? '9999px (Hap)' : `${btnRd}px`;

        const btnSpecAlpha = Math.min(btnSp / 100, 1.0).toFixed(2);
        const btnBloomPx = btnSp > 100 ? Math.round((btnSp - 100) * 0.08) : 0;
        const btnIgAlpha = (btnIg / 100).toFixed(2);
        const btnRadiusStr = btnRd >= 9000 ? '9999px' : `${btnRd}px`;

        // 2. GİRDİLER (8 PARAMETRE)
        const inputOp = parseInt(paramInputOpacity ? paramInputOpacity.value : 25, 10);
        const inputBl = parseInt(paramInputBlur ? paramInputBlur.value : 20, 10);
        const inputSp = parseInt(paramInputSpecular ? paramInputSpecular.value : 90, 10);
        const inputSpWidth = parseFloat(paramInputSpecularWidth ? paramInputSpecularWidth.value : 1.5);
        const inputTpr = parseInt(paramInputSpecularTaper ? paramInputSpecularTaper.value : 80, 10);
        const inputIg = parseInt(paramInputInnerGlow ? paramInputInnerGlow.value : 50, 10);
        const inputIgSpread = parseInt(paramInputInnerGlowSpread ? paramInputInnerGlowSpread.value : 5, 10);
        const inputRd = parseInt(paramInputRadius ? paramInputRadius.value : 9999, 10);

        if (valInputOpacity) valInputOpacity.textContent = `${inputOp}%`;
        if (valInputBlur) valInputBlur.textContent = inputBl === 0 ? '0px (Kristal)' : `${inputBl}px`;
        if (valInputSpecular) valInputSpecular.textContent = `${inputSp}%`;
        if (valInputSpecularWidth) valInputSpecularWidth.textContent = `${inputSpWidth.toFixed(1)}px`;
        if (valInputSpecularTaper) valInputSpecularTaper.textContent = `${inputTpr}%`;
        if (valInputInnerGlow) valInputInnerGlow.textContent = `${inputIg}%`;
        if (valInputInnerGlowSpread) valInputInnerGlowSpread.textContent = `${inputIgSpread}px`;
        if (valInputRadius) valInputRadius.textContent = inputRd >= 9000 ? '9999px (Hap)' : `${inputRd}px`;

        const inputSpecAlpha = Math.min(inputSp / 100, 1.0).toFixed(2);
        const inputBloomPx = inputSp > 100 ? Math.round((inputSp - 100) * 0.06) : 0;
        const inputIgAlpha = (inputIg / 100).toFixed(2);
        const inputRadiusStr = inputRd >= 9000 ? '9999px' : `${inputRd}px`;

        // 3. SEKMELER (8 PARAMETRE)
        const tabOp = parseInt(paramTabOpacity ? paramTabOpacity.value : 40, 10);
        const tabBl = parseInt(paramTabBlur ? paramTabBlur.value : 16, 10);
        const tabSp = parseInt(paramTabSpecular ? paramTabSpecular.value : 120, 10);
        const tabSpWidth = parseFloat(paramTabSpecularWidth ? paramTabSpecularWidth.value : 1.5);
        const tabTpr = parseInt(paramTabSpecularTaper ? paramTabSpecularTaper.value : 80, 10);
        const tabIg = parseInt(paramTabInnerGlow ? paramTabInnerGlow.value : 60, 10);
        const tabIgSpread = parseInt(paramTabInnerGlowSpread ? paramTabInnerGlowSpread.value : 6, 10);
        const tabRd = parseInt(paramTabRadius ? paramTabRadius.value : 9999, 10);

        if (valTabOpacity) valTabOpacity.textContent = `${tabOp}%`;
        if (valTabBlur) valTabBlur.textContent = `${tabBl}px`;
        if (valTabSpecular) valTabSpecular.textContent = `${tabSp}%`;
        if (valTabSpecularWidth) valTabSpecularWidth.textContent = `${tabSpWidth.toFixed(1)}px`;
        if (valTabSpecularTaper) valTabSpecularTaper.textContent = `${tabTpr}%`;
        if (valTabInnerGlow) valTabInnerGlow.textContent = `${tabIg}%`;
        if (valTabInnerGlowSpread) valTabInnerGlowSpread.textContent = `${tabIgSpread}px`;
        if (valTabRadius) valTabRadius.textContent = tabRd >= 9000 ? '9999px (Hap)' : `${tabRd}px`;

        const tabSpecAlpha = Math.min(tabSp / 100, 1.0).toFixed(2);
        const tabBloomPx = tabSp > 100 ? Math.round((tabSp - 100) * 0.06) : 0;
        const tabIgAlpha = (tabIg / 100).toFixed(2);
        const tabRadiusStr = tabRd >= 9000 ? '9999px' : `${tabRd}px`;

        // 4. KONTEYNIR (8 PARAMETRE)
        const cardOp = parseInt(paramCardOpacity ? paramCardOpacity.value : 20, 10);
        const cardBl = parseInt(paramCardBlur ? paramCardBlur.value : 0, 10);
        const cardSp = parseInt(paramCardSpecular ? paramCardSpecular.value : 80, 10);
        const cardSpWidth = parseFloat(paramCardSpecularWidth ? paramCardSpecularWidth.value : 1.5);
        const cardTpr = parseInt(paramCardSpecularTaper ? paramCardSpecularTaper.value : 80, 10);
        const cardIg = parseInt(paramCardInnerGlow ? paramCardInnerGlow.value : 40, 10);
        const cardIgSpread = parseInt(paramCardInnerGlowSpread ? paramCardInnerGlowSpread.value : 8, 10);
        const cardRd = parseInt(paramCardRadius ? paramCardRadius.value : 24, 10);

        if (valCardOpacity) valCardOpacity.textContent = `${cardOp}%`;
        if (valCardBlur) valCardBlur.textContent = cardBl === 0 ? '0px (Net)' : `${cardBl}px`;
        if (valCardSpecular) valCardSpecular.textContent = `${cardSp}%`;
        if (valCardSpecularWidth) valCardSpecularWidth.textContent = `${cardSpWidth.toFixed(1)}px`;
        if (valCardSpecularTaper) valCardSpecularTaper.textContent = `${cardTpr}%`;
        if (valCardInnerGlow) valCardInnerGlow.textContent = `${cardIg}%`;
        if (valCardInnerGlowSpread) valCardInnerGlowSpread.textContent = `${cardIgSpread}px`;
        if (valCardRadius) valCardRadius.textContent = `${cardRd}px`;

        const cardSpecAlpha = Math.min(cardSp / 100, 1.0).toFixed(2);
        const cardBloomPx = cardSp > 100 ? Math.round((cardSp - 100) * 0.05) : 0;
        const cardIgAlpha = (cardIg / 100).toFixed(2);

        // Apply CSS Variables to Root
        const root = document.documentElement;

        // Button Vars
        root.style.setProperty('--btn-glass-opacity', (btnOp / 100).toFixed(2));
        root.style.setProperty('--btn-glass-blur', `${btnBl}px`);
        root.style.setProperty('--btn-glass-specular-alpha', btnSpecAlpha);
        root.style.setProperty('--btn-glass-specular-width', `${btnSpWidth}px`);
        root.style.setProperty('--btn-glass-specular-bloom', `${btnBloomPx}px`);
        root.style.setProperty('--btn-glass-specular-taper', `${btnTpr}%`);
        root.style.setProperty('--btn-glass-inner-glow-alpha', btnIgAlpha);
        root.style.setProperty('--btn-glass-inner-glow-spread', `${btnIgSpread}px`);
        root.style.setProperty('--btn-glass-radius', btnRadiusStr);
        root.style.setProperty('--btn-glass-accent-color', compColors.btn.hex);
        root.style.setProperty('--btn-glass-accent-rgb', compColors.btn.rgb);

        // Input Vars
        root.style.setProperty('--input-glass-opacity', (inputOp / 100).toFixed(2));
        root.style.setProperty('--input-glass-blur', `${inputBl}px`);
        root.style.setProperty('--input-glass-specular-alpha', inputSpecAlpha);
        root.style.setProperty('--input-glass-specular-width', `${inputSpWidth}px`);
        root.style.setProperty('--input-glass-specular-bloom', `${inputBloomPx}px`);
        root.style.setProperty('--input-glass-specular-taper', `${inputTpr}%`);
        root.style.setProperty('--input-glass-inner-glow-alpha', inputIgAlpha);
        root.style.setProperty('--input-glass-inner-glow-spread', `${inputIgSpread}px`);
        root.style.setProperty('--input-glass-radius', inputRadiusStr);
        root.style.setProperty('--input-glass-accent-color', compColors.input.hex);
        root.style.setProperty('--input-glass-accent-rgb', compColors.input.rgb);

        // Tab Vars
        root.style.setProperty('--tab-glass-opacity', (tabOp / 100).toFixed(2));
        root.style.setProperty('--tab-glass-blur', `${tabBl}px`);
        root.style.setProperty('--tab-glass-specular-alpha', tabSpecAlpha);
        root.style.setProperty('--tab-glass-specular-width', `${tabSpWidth}px`);
        root.style.setProperty('--tab-glass-specular-bloom', `${tabBloomPx}px`);
        root.style.setProperty('--tab-glass-specular-taper', `${tabTpr}%`);
        root.style.setProperty('--tab-glass-inner-glow-alpha', tabIgAlpha);
        root.style.setProperty('--tab-glass-inner-glow-spread', `${tabIgSpread}px`);
        root.style.setProperty('--tab-glass-radius', tabRadiusStr);
        root.style.setProperty('--tab-glass-accent-color', compColors.tab.hex);
        root.style.setProperty('--tab-glass-accent-rgb', compColors.tab.rgb);

        // Card Vars
        root.style.setProperty('--card-glass-opacity', (cardOp / 100).toFixed(2));
        root.style.setProperty('--card-glass-blur', `${cardBl}px`);
        root.style.setProperty('--card-glass-specular-alpha', cardSpecAlpha);
        root.style.setProperty('--card-glass-specular-width', `${cardSpWidth}px`);
        root.style.setProperty('--card-glass-specular-bloom', `${cardBloomPx}px`);
        root.style.setProperty('--card-glass-specular-taper', `${cardTpr}%`);
        root.style.setProperty('--card-glass-inner-glow-alpha', cardIgAlpha);
        root.style.setProperty('--card-glass-inner-glow-spread', `${cardIgSpread}px`);
        root.style.setProperty('--card-glass-radius', `${cardRd}px`);
        root.style.setProperty('--card-glass-accent-color', compColors.card.hex);
        root.style.setProperty('--card-glass-accent-rgb', compColors.card.rgb);

        // Fallback root vars
        root.style.setProperty('--glass-opacity', (btnOp / 100).toFixed(2));
        root.style.setProperty('--glass-blur', `${btnBl}px`);
        root.style.setProperty('--glass-radius', btnRadiusStr);
        root.style.setProperty('--glass-accent-color', compColors.btn.hex);
        root.style.setProperty('--glass-accent-rgb', compColors.btn.rgb);

        // Master CSS Code Block
        const cssCode = `/* 🎯 1. SIVI CAM BUTONLAR (LIQUID GLASS BUTTONS) */
.dynamic-glass-btn {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.10) 100%), rgba(${compColors.btn.rgb}, ${(btnOp / 100).toFixed(2)});
  backdrop-filter: blur(${btnBl}px) saturate(200%);
  -webkit-backdrop-filter: blur(${btnBl}px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: ${btnRadiusStr};
  box-shadow: 
    inset 0 2px ${btnIgSpread}px rgba(255, 255, 255, ${btnIgAlpha}),
    inset 0 -2px ${(btnIgSpread * 0.75).toFixed(1)}px rgba(0, 0, 0, 0.40),
    inset 0 0 ${(btnIgSpread * 2.5).toFixed(1)}px rgba(${compColors.btn.rgb}, ${(parseFloat(btnIgAlpha) * 0.45).toFixed(2)}),
    0 0 20px rgba(${compColors.btn.rgb}, 0.30),
    0 6px 18px rgba(0, 0, 0, 0.30);
}
.dynamic-glass-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: ${btnSpWidth}px;
  background: radial-gradient(
    ellipse ${btnTpr}% 70% at 50% -5%,
    rgba(255, 255, 255, ${btnSpecAlpha}) 0%,
    rgba(255, 255, 255, ${(btnSpecAlpha * 0.70).toFixed(2)}) 25%,
    rgba(255, 255, 255, ${(btnSpecAlpha * 0.20).toFixed(2)}) 60%,
    rgba(255, 255, 255, 0.02) 85%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* ⌨️ 2. GİRDİ ALANLARI (INPUTS & STEPPERS) */
.dynamic-glass-input {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(18, 24, 38, ${(inputOp / 100).toFixed(2)});
  backdrop-filter: blur(${inputBl}px) saturate(200%);
  -webkit-backdrop-filter: blur(${inputBl}px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: ${inputRadiusStr};
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, ${inputIgAlpha}), 0 4px 16px rgba(0, 0, 0, 0.35);
}

/* 📑 3. SEKMELER & ŞALTERLER (TABS & SWITCHES) */
.dynamic-tab.active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.15) 100%), rgba(${compColors.tab.rgb}, ${(tabOp / 100).toFixed(2)});
  backdrop-filter: blur(${tabBl}px) saturate(200%);
  border-radius: ${tabRadiusStr};
  border-top: 1.5px solid rgba(255, 255, 255, ${tabSpecAlpha});
  box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.60), 0 0 20px rgba(${compColors.tab.rgb}, 0.40);
}

/* 🖼️ 4. ANA KONTEYNIR & KART ÇERÇEVESİ (CONTAINER CARDS) */
.component-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.005) 100%), rgba(10, 15, 28, ${(cardOp / 100).toFixed(2)});
  backdrop-filter: blur(${cardBl}px) saturate(200%);
  -webkit-backdrop-filter: blur(${cardBl}px) saturate(200%);
  border: ${cardSpWidth}px solid rgba(255, 255, 255, 0.12);
  border-radius: ${cardRd}px;
  box-shadow: inset 0 2px 8px rgba(255, 255, 255, ${cardIgAlpha}), 0 20px 50px rgba(0, 0, 0, 0.45);
}

.component-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: ${cardSpWidth}px;
  background: radial-gradient(
    ellipse ${cardTpr}% 70% at 50% -5%,
    rgba(255, 255, 255, ${cardSpecAlpha}) 0%,
    rgba(255, 255, 255, ${(cardSpecAlpha * 0.70).toFixed(2)}) 25%,
    rgba(255, 255, 255, ${(cardSpecAlpha * 0.20).toFixed(2)}) 60%,
    rgba(255, 255, 255, 0.02) 85%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 2;
}`;
        cssOutputPreview.textContent = cssCode;
    }

    const allGlassSliders = [
        paramBtnOpacity, paramBtnBlur, paramBtnSpecular, paramBtnSpecularWidth, paramBtnSpecularTaper, paramBtnInnerGlow, paramBtnInnerGlowSpread, paramBtnRadius,
        paramInputOpacity, paramInputBlur, paramInputSpecular, paramInputSpecularWidth, paramInputSpecularTaper, paramInputInnerGlow, paramInputInnerGlowSpread, paramInputRadius,
        paramTabOpacity, paramTabBlur, paramTabSpecular, paramTabSpecularWidth, paramTabSpecularTaper, paramTabInnerGlow, paramTabInnerGlowSpread, paramTabRadius,
        paramCardOpacity, paramCardBlur, paramCardSpecular, paramCardSpecularWidth, paramCardSpecularTaper, paramCardInnerGlow, paramCardInnerGlowSpread, paramCardRadius
    ].filter(Boolean);

    allGlassSliders.forEach(slider => {
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
                // 1. Buttons
                if (conf.btn) {
                    if (paramBtnOpacity) paramBtnOpacity.value = conf.btn.opacity;
                    if (paramBtnBlur) paramBtnBlur.value = conf.btn.blur;
                    if (paramBtnSpecular) paramBtnSpecular.value = conf.btn.specular;
                    if (paramBtnSpecularWidth) paramBtnSpecularWidth.value = conf.btn.specWidth;
                    if (paramBtnSpecularTaper) paramBtnSpecularTaper.value = conf.btn.taper;
                    if (paramBtnInnerGlow) paramBtnInnerGlow.value = conf.btn.innerGlow;
                    if (paramBtnInnerGlowSpread) paramBtnInnerGlowSpread.value = conf.btn.spread;
                    if (paramBtnRadius) paramBtnRadius.value = conf.btn.radius;
                    compColors.btn.hex = conf.btn.color;
                    compColors.btn.rgb = conf.btn.rgb;
                }

                // 2. Inputs (8 params)
                if (conf.input) {
                    if (paramInputOpacity) paramInputOpacity.value = conf.input.opacity;
                    if (paramInputBlur) paramInputBlur.value = conf.input.blur;
                    if (paramInputSpecular) paramInputSpecular.value = conf.input.specular;
                    if (paramInputSpecularWidth) paramInputSpecularWidth.value = conf.input.specWidth;
                    if (paramInputSpecularTaper) paramInputSpecularTaper.value = conf.input.taper || 80;
                    if (paramInputInnerGlow) paramInputInnerGlow.value = conf.input.innerGlow;
                    if (paramInputInnerGlowSpread) paramInputInnerGlowSpread.value = conf.input.spread || 5;
                    if (paramInputRadius) paramInputRadius.value = conf.input.radius;
                    compColors.input.hex = conf.input.color;
                    compColors.input.rgb = conf.input.rgb;
                }

                // 3. Tabs (8 params)
                if (conf.tab) {
                    if (paramTabOpacity) paramTabOpacity.value = conf.tab.opacity;
                    if (paramTabBlur) paramTabBlur.value = conf.tab.blur;
                    if (paramTabSpecular) paramTabSpecular.value = conf.tab.specular;
                    if (paramTabSpecularWidth) paramTabSpecularWidth.value = conf.tab.specWidth || 1.5;
                    if (paramTabSpecularTaper) paramTabSpecularTaper.value = conf.tab.taper || 80;
                    if (paramTabInnerGlow) paramTabInnerGlow.value = conf.tab.innerGlow || 60;
                    if (paramTabInnerGlowSpread) paramTabInnerGlowSpread.value = conf.tab.spread || 6;
                    if (paramTabRadius) paramTabRadius.value = conf.tab.radius;
                    compColors.tab.hex = conf.tab.color;
                    compColors.tab.rgb = conf.tab.rgb;
                }

                // 4. Cards (8 params)
                if (conf.card) {
                    if (paramCardOpacity) paramCardOpacity.value = conf.card.opacity;
                    if (paramCardBlur) paramCardBlur.value = conf.card.blur;
                    if (paramCardSpecular) paramCardSpecular.value = conf.card.specular;
                    if (paramCardSpecularWidth) paramCardSpecularWidth.value = conf.card.specWidth;
                    if (paramCardSpecularTaper) paramCardSpecularTaper.value = conf.card.taper || 80;
                    if (paramCardInnerGlow) paramCardInnerGlow.value = conf.card.innerGlow;
                    if (paramCardInnerGlowSpread) paramCardInnerGlowSpread.value = conf.card.spread || 8;
                    if (paramCardRadius) paramCardRadius.value = conf.card.radius;
                    compColors.card.hex = conf.card.color;
                    compColors.card.rgb = conf.card.rgb;
                }

                // Synchronize color dots
                document.querySelectorAll('.comp-color-palette').forEach(pal => {
                    const comp = pal.getAttribute('data-comp');
                    const curHex = compColors[comp]?.hex || '#2563eb';
                    pal.querySelectorAll('.color-dot').forEach(dot => {
                        dot.classList.toggle('active', dot.getAttribute('data-color') === curHex);
                    });
                });

                updateGlassEngine();
            }
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

    // Sub-Nav In-Situ Section Smooth Scroller & Active Spy
    const subnavPills = document.querySelectorAll('.subnav-pill');
    subnavPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            subnavPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const targetId = pill.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Scroll Spy for Subnav Dock
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 140;
        const sections = [
            '#section-buttons-studio',
            '#section-inputs-studio',
            '#section-tabs-studio',
            '#section-cards-studio',
            '#section-login-studio',
            '#section-markets-studio',
            '#section-aurora-studio',
            '#section-saved-studio'
        ];

        for (let i = sections.length - 1; i >= 0; i--) {
            const sec = document.querySelector(sections[i]);
            if (sec && sec.offsetTop <= scrollPos) {
                subnavPills.forEach(p => {
                    p.classList.toggle('active', p.getAttribute('href') === sections[i]);
                });
                break;
            }
        }
    }, { passive: true });

    // Mock Market Table Dynamic Filtering
    const mockMarketData = [
        { id: 1, symbol: 'THYAO', name: 'Türk Hava Yolları', exchange: 'BIST', cat: 'bist', price: '₺314.50', change: '+3.75%', isPos: true, vol: '₺4.82 M', icon: 'THY', bg: '#dc2626', spark: 'M0 24 L20 20 L40 22 L60 14 L80 16 L100 8 L120 4' },
        { id: 2, symbol: 'EREGL', name: 'Ereğli Demir Çelik', exchange: 'BIST', cat: 'bist', price: '₺52.40', change: '+1.85%', isPos: true, vol: '₺2.15 M', icon: 'ERE', bg: '#0284c7', spark: 'M0 20 L25 18 L50 12 L75 14 L100 8 L120 5' },
        { id: 3, symbol: 'BTC / USDT', name: 'Bitcoin', exchange: 'Binance', cat: 'crypto', price: '$78,650.00', change: '+4.18%', isPos: true, vol: '$24.5 B', icon: '₿', bg: '#f59e0b', spark: 'M0 22 L20 18 L40 19 L60 12 L80 15 L100 6 L120 2' },
        { id: 4, symbol: 'ETH / USDT', name: 'Ethereum', exchange: 'Binance', cat: 'crypto', price: '$3,420.50', change: '+2.90%', isPos: true, vol: '$12.8 B', icon: 'Ξ', bg: '#6366f1', spark: 'M0 20 L20 16 L40 18 L60 10 L80 14 L100 8 L120 3' },
        { id: 5, symbol: 'NVDA', name: 'NVIDIA Corp', exchange: 'NASDAQ', cat: 'stocks', price: '$142.80', change: '+2.80%', isPos: true, vol: '$18.2 B', icon: 'NVDA', bg: '#16a34a', spark: 'M0 20 L25 16 L50 18 L75 10 L100 12 L120 5' },
        { id: 6, symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', cat: 'stocks', price: '$232.15', change: '+1.15%', isPos: true, vol: '$11.4 B', icon: 'AAPL', bg: '#475569', spark: 'M0 18 L25 15 L50 14 L75 12 L100 8 L120 4' },
        { id: 7, symbol: 'XAU / USD', name: 'Ons Altın Spot', exchange: 'Forex', cat: 'fx', price: '$2,748.60', change: '-0.42%', isPos: false, vol: '$9.45 B', icon: 'AU', bg: '#d97706', spark: 'M0 6 L25 8 L50 14 L75 12 L100 20 L120 22' },
        { id: 8, symbol: 'EUR / USD', name: 'Euro / Dolar', exchange: 'Forex', cat: 'fx', price: '1.0845', change: '+0.12%', isPos: true, vol: '$32.1 B', icon: '€', bg: '#2563eb', spark: 'M0 16 L25 15 L50 13 L75 14 L100 11 L120 8' }
    ];

    let currentMarketTab = 'all';
    let currentMarketSearch = '';

    function renderMockMarketTable() {
        const tbody = document.getElementById('mock-market-tbody');
        if (!tbody) return;

        const filtered = mockMarketData.filter(item => {
            const matchesTab = currentMarketTab === 'all' || item.cat === currentMarketTab;
            const q = currentMarketSearch.toLowerCase().trim();
            const matchesSearch = !q || item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
            return matchesTab && matchesSearch;
        });

        tbody.innerHTML = filtered.map((item, idx) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 14px 16px; text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
                <td style="padding: 14px 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${item.bg}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; box-shadow: 0 0 10px ${item.bg}55;">
                            ${item.icon}
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #fff;">${item.symbol}</div>
                            <div style="font-size: 11px; color: #94a3b8;">${item.name} · <span style="color: #60a5fa;">${item.exchange}</span></div>
                        </div>
                    </div>
                </td>
                <td style="padding: 14px 16px; text-align: right; font-weight: 700; color: #fff; font-family: var(--font-mono);">${item.price}</td>
                <td style="padding: 14px 16px; text-align: right;">
                    <span class="dynamic-badge ${item.isPos ? 'positive' : 'negative'}">${item.isPos ? '▲' : '▼'} ${item.change}</span>
                </td>
                <td style="padding: 14px 16px; text-align: right; color: #cbd5e1; font-weight: 600;">${item.vol}</td>
                <td style="padding: 14px 16px; text-align: center;">
                    <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
                        <path d="${item.spark}" stroke="${item.isPos ? '#10b981' : '#ef4444'}" stroke-width="2" stroke-linecap="round"/>
                        <path d="${item.spark} V 28 H 0 Z" fill="${item.isPos ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}"/>
                    </svg>
                </td>
                <td style="padding: 14px 16px; text-align: right;">
                    <button class="dynamic-glass-btn btn-sm"><span>İncele</span> <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
                </td>
            </tr>
        `).join('');
    }

    document.querySelectorAll('.mock-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mock-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMarketTab = btn.getAttribute('data-market-tab');
            renderMockMarketTable();
        });
    });

    const marketSearchInput = document.getElementById('mock-market-search');
    if (marketSearchInput) {
        marketSearchInput.addEventListener('input', (e) => {
            currentMarketSearch = e.target.value;
            renderMockMarketTable();
        });
    }

    renderMockMarketTable();

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
    // 5. 💾 JSON & CSS KAYIT, AÇIKLAMA & ÇEREZ SAYACI YÖNETİMİ
    // ========================================================
    const COOKIE_SEQ_KEY = 'liquid_glass_seq_num';
    const COOKIE_PRESETS_KEY = 'liquid_glass_presets_cookie';
    const LOCAL_PRESETS_KEY = 'liquid_glass_presets_db';

    const headerSeqBadge = document.getElementById('header-seq-badge');
    const liveCookieBadge = document.getElementById('live-cookie-badge');
    const inlineCookieSeq = document.getElementById('inline-cookie-seq');
    const currentCookieSeqDisplay = document.getElementById('current-cookie-seq-display');
    const saveBtnLabel = document.getElementById('save-btn-label');
    const savePresetNameInput = document.getElementById('save-preset-name-input');
    const savePresetDescInput = document.getElementById('save-preset-desc-input');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const saveCssFileBtn = document.getElementById('save-css-file-btn');
    const downloadLiveCssBtn = document.getElementById('download-live-css-btn');
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
        if (headerSeqBadge) headerSeqBadge.textContent = `#${nextSeq}`;
        if (liveCookieBadge) liveCookieBadge.textContent = `#${nextSeq}`;
        if (inlineCookieSeq) inlineCookieSeq.textContent = `#${nextSeq}`;
        if (currentCookieSeqDisplay) currentCookieSeqDisplay.textContent = `#${nextSeq}`;
        if (saveBtnLabel) saveBtnLabel.textContent = `🍪 Çerezlere & JSON Kaydet (#${nextSeq})`;
    }

    function showToast(message) {
        if (!saveToastMsg) return;
        saveToastMsg.textContent = message;
        saveToastMsg.style.display = 'block';
        setTimeout(() => {
            saveToastMsg.style.display = 'none';
        }, 3400);
    }

    // Get presets DB from Cookie or localStorage
    function getStoredPresets() {
        try {
            // Check cookie first
            const cookieRaw = getCookie(COOKIE_PRESETS_KEY);
            if (cookieRaw) {
                const parsed = JSON.parse(decodeURIComponent(cookieRaw));
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
            // Fallback to localStorage
            const localRaw = localStorage.getItem(LOCAL_PRESETS_KEY);
            return localRaw ? JSON.parse(localRaw) : [];
        } catch (e) {
            console.error('Presets parse error:', e);
            try {
                const localRaw = localStorage.getItem(LOCAL_PRESETS_KEY);
                return localRaw ? JSON.parse(localRaw) : [];
            } catch (err) {
                return [];
            }
        }
    }

    function saveStoredPresets(presets) {
        const jsonStr = JSON.stringify(presets);
        localStorage.setItem(LOCAL_PRESETS_KEY, jsonStr);
        
        // Save to cookie (compact top 15 presets to adhere to 4KB cookie payload)
        try {
            const compactPresets = presets.slice(0, 15);
            setCookie(COOKIE_PRESETS_KEY, encodeURIComponent(JSON.stringify(compactPresets)), 365);
        } catch (e) {
            console.warn('Cookie storage limit reached for presets, saved to localStorage', e);
        }

        renderSavedPresetsList();
    }

    // Generate Beautiful CSS File with Header & User Notes
    function generateFormattedCssFile(config) {
        const dateStr = config.formattedDate || new Date().toLocaleString('tr-TR');
        const descComment = config.description ? `\n * 📝 AÇIKLAMA / NOTLAR:\n * ${config.description.replace(/\n/g, '\n * ')}\n *` : '';

        return `/**
 * =====================================================================
 * 💎 LIQUID GLASS DESIGN SYSTEM - STYLESHEET
 * =====================================================================
 * 🏷️ ŞABLON ADI: ${config.name || 'Liquid Glass Preset'}
 * 🔢 KAYIT SIRA NO: #${config.sequenceNumber || 1}
 * 🆔 KONFİGÜRASYON ID: ${config.configId || 'LIQUID_GLASS_PRESET'}
 * 📅 OLUŞTURULMA TARİHİ: ${dateStr}${descComment}
 * 🌐 PLATFORM: TradeChart Pro Liquid Glass UI Studio
 * =====================================================================
 */

${config.cssCode || cssOutputPreview.textContent}
`;
    }

    // Helper: Trigger File Download
    function triggerFileDownload(content, filename, mimeType = "text/plain") {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", url);
        downloadAnchor.setAttribute("download", filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // Render Saved Presets Cards with Description
    function renderSavedPresetsList() {
        const presets = getStoredPresets();
        savedPresetsCountEl.textContent = `${presets.length} Kayıt`;
        if (quickPresetCount) quickPresetCount.textContent = `${presets.length} Kayıt`;

        // Update Quick Preset Select Dropdown in Tab 1
        if (quickPresetSelect) {
            if (presets.length === 0) {
                quickPresetSelect.innerHTML = `<option value="">-- Henüz Kayıtlı Şablon Yok --</option>`;
            } else {
                quickPresetSelect.innerHTML = `
                    <option value="">-- 📂 Kayıtlı Şablon Seç (${presets.length}) --</option>
                    ${presets.map((p, idx) => `
                        <option value="${idx}">#${p.sequenceNumber} - ${escapeHtml(p.name)} (${p.formattedDate || ''})</option>
                    `).join('')}
                `;
            }
        }

        if (presets.length === 0) {
            savedPresetsListEl.innerHTML = `
                <div style="text-align: center; color: #64748b; font-size: 11.5px; padding: 20px 0;">
                    Henüz kayıtlı bir JSON/CSS şablonu bulunmuyor.<br>Yukarıdaki butona tıklayarak ilk şablonunu ve tasarım notunu kaydet!
                </div>`;
            return;
        }

        savedPresetsListEl.innerHTML = presets.map((p, index) => {
            const descHtml = p.description ? `
                <div style="font-size: 11px; color: #cbd5e1; font-style: italic; background: rgba(255,255,255,0.03); padding: 5px 8px; border-radius: 6px; border-left: 2px solid #3b82f6;">
                    "${escapeHtml(p.description)}"
                </div>` : '';

            return `
                <div class="saved-preset-card" data-preset-id="${p.configId}">
                    <div class="preset-card-header">
                        <div class="preset-card-title">
                            <span class="preset-card-seq">#${p.sequenceNumber}</span>
                            <span>${escapeHtml(p.name)}</span>
                        </div>
                        <span class="preset-card-date">${p.formattedDate || ''}</span>
                    </div>
                    ${descHtml}
                    <div class="preset-card-tags">
                        <span class="preset-tag" style="color: ${p.glassPhysics?.accentColor || '#60a5fa'};">● ${p.glassPhysics?.accentColor || '#2563eb'}</span>
                        <span class="preset-tag">Cam: %${Math.round((p.glassPhysics?.opacity || 0.35) * 100)}</span>
                        <span class="preset-tag">Kalınlık: ${p.glassPhysics?.specularWidth || 1.5}px</span>
                        <span class="preset-tag">Işıltı: %${p.glassPhysics?.specularAlphaRaw || Math.round((p.glassPhysics?.specularAlpha || 0.85) * 100)}</span>
                        <span class="preset-tag">Mod: ${p.auroraGalaxy?.motionMode || 'galaxy'}</span>
                    </div>
                    <div class="preset-card-actions">
                        <button class="preset-action-btn btn-apply-preset" data-index="${index}">⚡ Yükle</button>
                        <button class="preset-action-btn btn-download-css" data-index="${index}" style="background: rgba(16,185,129,0.25); border-color: #10b981; color: #6ee7b7;">🎨 CSS</button>
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
                if (p) {
                    if (quickPresetSelect) quickPresetSelect.value = idx.toString();
                    applyConfigurationPayload(p);
                }
            });
        });

        savedPresetsListEl.querySelectorAll('.btn-download-css').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const p = presets[idx];
                if (p) {
                    const cssContent = generateFormattedCssFile(p);
                    triggerFileDownload(cssContent, `liquid_glass_style_#${String(p.sequenceNumber).padStart(3, '0')}.css`, 'text/css');
                    showToast(`✓ #${p.sequenceNumber} Nolu CSS Dosyası İndirildi!`);
                }
            });
        });

        savedPresetsListEl.querySelectorAll('.btn-download-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const p = presets[idx];
                if (p) triggerFileDownload(JSON.stringify(p, null, 2), `liquid_glass_config_#${String(p.sequenceNumber).padStart(3, '0')}.json`, 'application/json');
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

    // Helper: Apply loaded configuration to all sliders and engines
    function applyConfigurationPayload(config) {
        if (!config) return;

        // Set inputs if present
        if (savePresetNameInput && config.name) savePresetNameInput.value = config.name;
        if (savePresetDescInput && config.description) savePresetDescInput.value = config.description;

        // 1. Modüler Cam Fiziği
        if (config.glassModules) {
            const m = config.glassModules;
            
            // Buttons (8 params)
            if (m.btn) {
                if (paramBtnOpacity) paramBtnOpacity.value = Math.round((m.btn.opacity || 0.35) * 100);
                if (paramBtnBlur) paramBtnBlur.value = m.btn.blur ?? 20;
                if (paramBtnSpecular) paramBtnSpecular.value = m.btn.specularRaw || Math.round((m.btn.specularAlpha || 1.0) * 100);
                if (paramBtnSpecularWidth) paramBtnSpecularWidth.value = m.btn.specularWidth ?? 1.5;
                if (paramBtnSpecularTaper) paramBtnSpecularTaper.value = m.btn.specularTaper ?? 80;
                if (paramBtnInnerGlow) paramBtnInnerGlow.value = m.btn.innerGlowRaw || Math.round((m.btn.innerGlowAlpha || 0.65) * 100);
                if (paramBtnInnerGlowSpread) paramBtnInnerGlowSpread.value = m.btn.innerGlowSpread ?? 6;
                if (paramBtnRadius) paramBtnRadius.value = (m.btn.radius || '').includes('9999') ? 9999 : parseInt(m.btn.radius, 10) || 9999;
                if (m.btn.color) compColors.btn.hex = m.btn.color;
                if (m.btn.rgb) compColors.btn.rgb = m.btn.rgb;
            }

            // Inputs (8 params)
            if (m.input) {
                if (paramInputOpacity) paramInputOpacity.value = Math.round((m.input.opacity || 0.25) * 100);
                if (paramInputBlur) paramInputBlur.value = m.input.blur ?? 20;
                if (paramInputSpecular) paramInputSpecular.value = m.input.specularRaw || Math.round((m.input.specularAlpha || 0.90) * 100);
                if (paramInputSpecularWidth) paramInputSpecularWidth.value = m.input.specularWidth ?? 1.5;
                if (paramInputSpecularTaper) paramInputSpecularTaper.value = m.input.specularTaper ?? 80;
                if (paramInputInnerGlow) paramInputInnerGlow.value = m.input.innerGlowRaw || Math.round((m.input.innerGlowAlpha || 0.50) * 100);
                if (paramInputInnerGlowSpread) paramInputInnerGlowSpread.value = m.input.innerGlowSpread ?? 5;
                if (paramInputRadius) paramInputRadius.value = (m.input.radius || '').includes('9999') ? 9999 : parseInt(m.input.radius, 10) || 9999;
                if (m.input.color) compColors.input.hex = m.input.color;
                if (m.input.rgb) compColors.input.rgb = m.input.rgb;
            }

            // Tabs (8 params)
            if (m.tab) {
                if (paramTabOpacity) paramTabOpacity.value = Math.round((m.tab.opacity || 0.40) * 100);
                if (paramTabBlur) paramTabBlur.value = m.tab.blur ?? 16;
                if (paramTabSpecular) paramTabSpecular.value = m.tab.specularRaw || Math.round((m.tab.specularAlpha || 1.20) * 100);
                if (paramTabSpecularWidth) paramTabSpecularWidth.value = m.tab.specularWidth ?? 1.5;
                if (paramTabSpecularTaper) paramTabSpecularTaper.value = m.tab.specularTaper ?? 80;
                if (paramTabInnerGlow) paramTabInnerGlow.value = m.tab.innerGlowRaw || Math.round((m.tab.innerGlowAlpha || 0.60) * 100);
                if (paramTabInnerGlowSpread) paramTabInnerGlowSpread.value = m.tab.innerGlowSpread ?? 6;
                if (paramTabRadius) paramTabRadius.value = (m.tab.radius || '').includes('9999') ? 9999 : parseInt(m.tab.radius, 10) || 9999;
                if (m.tab.color) compColors.tab.hex = m.tab.color;
                if (m.tab.rgb) compColors.tab.rgb = m.tab.rgb;
            }

            // Cards (8 params)
            if (m.card) {
                if (paramCardOpacity) paramCardOpacity.value = Math.round((m.card.opacity || 0.20) * 100);
                if (paramCardBlur) paramCardBlur.value = m.card.blur ?? 0;
                if (paramCardSpecular) paramCardSpecular.value = m.card.specularRaw || Math.round((m.card.specularAlpha || 0.80) * 100);
                if (paramCardSpecularWidth) paramCardSpecularWidth.value = m.card.specularWidth ?? 1.5;
                if (paramCardSpecularTaper) paramCardSpecularTaper.value = m.card.specularTaper ?? 80;
                if (paramCardInnerGlow) paramCardInnerGlow.value = m.card.innerGlowRaw || Math.round((m.card.innerGlowAlpha || 0.40) * 100);
                if (paramCardInnerGlowSpread) paramCardInnerGlowSpread.value = m.card.innerGlowSpread ?? 8;
                if (paramCardRadius) paramCardRadius.value = parseInt(m.card.radius, 10) || 24;
                if (m.card.color) compColors.card.hex = m.card.color;
                if (m.card.rgb) compColors.card.rgb = m.card.rgb;
            }

            // Sync color palettes
            document.querySelectorAll('.comp-color-palette').forEach(pal => {
                const comp = pal.getAttribute('data-comp');
                const curHex = compColors[comp]?.hex || '#2563eb';
                pal.querySelectorAll('.color-dot').forEach(dot => {
                    dot.classList.toggle('active', dot.getAttribute('data-color') === curHex);
                });
            });

            updateGlassEngine();
        } else if (config.glassPhysics) {
            // Legacy format fallback
            if (paramBtnOpacity) paramBtnOpacity.value = Math.round((config.glassPhysics.opacity || 0.35) * 100);
            if (paramBtnBlur) paramBtnBlur.value = config.glassPhysics.blur ?? 20;
            if (paramBtnSpecular) paramBtnSpecular.value = config.glassPhysics.specularAlphaRaw || Math.round((config.glassPhysics.specularAlpha || 0.85) * 100);
            if (paramBtnInnerGlow) paramBtnInnerGlow.value = config.glassPhysics.innerGlowRaw || Math.round((config.glassPhysics.innerGlowAlpha || 0.65) * 100);
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

        showToast(`✓ #${config.sequenceNumber || 1} Nolu Modüler Şablon Başarıyla Yüklendi!`);
    }

    // Build Current Configuration Object
    function buildCurrentConfigPayload(seqNum) {
        const customName = (savePresetNameInput && savePresetNameInput.value.trim()) || `Sıvı Cam Konfigürasyonu #${seqNum}`;
        const customDesc = (savePresetDescInput && savePresetDescInput.value.trim()) || '';
        const now = new Date();

        return {
            sequenceNumber: seqNum,
            configId: `LIQUID_GLASS_PRESET_${String(seqNum).padStart(3, '0')}`,
            name: customName,
            description: customDesc,
            savedAt: now.toISOString(),
            formattedDate: now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            glassModules: {
                btn: {
                    opacity: parseFloat((parseInt(paramBtnOpacity.value, 10) / 100).toFixed(2)),
                    blur: parseInt(paramBtnBlur.value, 10),
                    specularAlpha: parseFloat((parseInt(paramBtnSpecular.value, 10) / 100).toFixed(2)),
                    specularRaw: parseInt(paramBtnSpecular.value, 10),
                    specularWidth: parseFloat(paramBtnSpecularWidth ? paramBtnSpecularWidth.value : 1.5),
                    specularTaper: parseInt(paramBtnSpecularTaper ? paramBtnSpecularTaper.value : 80, 10),
                    innerGlowAlpha: parseFloat((parseInt(paramBtnInnerGlow.value, 10) / 100).toFixed(2)),
                    innerGlowRaw: parseInt(paramBtnInnerGlow.value, 10),
                    innerGlowSpread: parseInt(paramBtnInnerGlowSpread ? paramBtnInnerGlowSpread.value : 6, 10),
                    radius: parseInt(paramBtnRadius.value, 10) >= 9000 ? '9999px' : `${paramBtnRadius.value}px`,
                    color: compColors.btn.hex,
                    rgb: compColors.btn.rgb
                },
                input: {
                    opacity: parseFloat((parseInt(paramInputOpacity.value, 10) / 100).toFixed(2)),
                    blur: parseInt(paramInputBlur.value, 10),
                    specularAlpha: parseFloat((parseInt(paramInputSpecular.value, 10) / 100).toFixed(2)),
                    specularRaw: parseInt(paramInputSpecular.value, 10),
                    specularWidth: parseFloat(paramInputSpecularWidth ? paramInputSpecularWidth.value : 1.5),
                    specularTaper: parseInt(paramInputSpecularTaper ? paramInputSpecularTaper.value : 80, 10),
                    innerGlowAlpha: parseFloat((parseInt(paramInputInnerGlow.value, 10) / 100).toFixed(2)),
                    innerGlowRaw: parseInt(paramInputInnerGlow.value, 10),
                    innerGlowSpread: parseInt(paramInputInnerGlowSpread ? paramInputInnerGlowSpread.value : 5, 10),
                    radius: parseInt(paramInputRadius.value, 10) >= 9000 ? '9999px' : `${paramInputRadius.value}px`,
                    color: compColors.input.hex,
                    rgb: compColors.input.rgb
                },
                tab: {
                    opacity: parseFloat((parseInt(paramTabOpacity.value, 10) / 100).toFixed(2)),
                    blur: parseInt(paramTabBlur.value, 10),
                    specularAlpha: parseFloat((parseInt(paramTabSpecular.value, 10) / 100).toFixed(2)),
                    specularRaw: parseInt(paramTabSpecular.value, 10),
                    specularWidth: parseFloat(paramTabSpecularWidth ? paramTabSpecularWidth.value : 1.5),
                    specularTaper: parseInt(paramTabSpecularTaper ? paramTabSpecularTaper.value : 80, 10),
                    innerGlowAlpha: parseFloat((parseInt(paramTabInnerGlow.value, 10) / 100).toFixed(2)),
                    innerGlowRaw: parseInt(paramTabInnerGlow.value, 10),
                    innerGlowSpread: parseInt(paramTabInnerGlowSpread ? paramTabInnerGlowSpread.value : 6, 10),
                    radius: parseInt(paramTabRadius.value, 10) >= 9000 ? '9999px' : `${paramTabRadius.value}px`,
                    color: compColors.tab.hex,
                    rgb: compColors.tab.rgb
                },
                card: {
                    opacity: parseFloat((parseInt(paramCardOpacity.value, 10) / 100).toFixed(2)),
                    blur: parseInt(paramCardBlur.value, 10),
                    specularAlpha: parseFloat((parseInt(paramCardSpecular.value, 10) / 100).toFixed(2)),
                    specularRaw: parseInt(paramCardSpecular.value, 10),
                    specularWidth: parseFloat(paramCardSpecularWidth ? paramCardSpecularWidth.value : 1.5),
                    specularTaper: parseInt(paramCardSpecularTaper ? paramCardSpecularTaper.value : 80, 10),
                    innerGlowAlpha: parseFloat((parseInt(paramCardInnerGlow.value, 10) / 100).toFixed(2)),
                    innerGlowRaw: parseInt(paramCardInnerGlow.value, 10),
                    innerGlowSpread: parseInt(paramCardInnerGlowSpread ? paramCardInnerGlowSpread.value : 8, 10),
                    radius: `${paramCardRadius.value}px`,
                    color: compColors.card.hex,
                    rgb: compColors.card.rgb
                }
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
    }

    // Direct Download Live CSS Button in Tab 1
    if (downloadLiveCssBtn) {
        downloadLiveCssBtn.addEventListener('click', () => {
            const seqNum = getNextSequenceNumber();
            const config = buildCurrentConfigPayload(seqNum);
            const cssContent = generateFormattedCssFile(config);
            triggerFileDownload(cssContent, `liquid_glass_live_#${String(seqNum).padStart(3, '0')}.css`, 'text/css');
            showToast(`✓ Canlı CSS Dosyası İndirildi!`);
        });
    }

    // Save CSS File Action in Tab 3
    if (saveCssFileBtn) {
        saveCssFileBtn.addEventListener('click', () => {
            const seqNum = getNextSequenceNumber();
            const config = buildCurrentConfigPayload(seqNum);

            // Increment sequence
            const nextSeq = seqNum + 1;
            setCookie(COOKIE_SEQ_KEY, nextSeq.toString(), 365);
            localStorage.setItem(COOKIE_SEQ_KEY, nextSeq.toString());
            updateSequenceUI();

            // Save to DB
            const presets = getStoredPresets();
            presets.unshift(config);
            saveStoredPresets(presets);

            // Download CSS
            const cssContent = generateFormattedCssFile(config);
            triggerFileDownload(cssContent, `liquid_glass_style_#${String(seqNum).padStart(3, '0')}.css`, 'text/css');
            showToast(`✓ #${seqNum} Nolu CSS Dosyası ve Açıklaması Kaydedildi & İndirildi!`);
        });
    }

    // Save JSON Action in Tab 3
    saveJsonBtn.addEventListener('click', () => {
        const seqNum = getNextSequenceNumber();
        const configPayload = buildCurrentConfigPayload(seqNum);

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
        triggerFileDownload(JSON.stringify(configPayload, null, 2), filename, 'application/json');

        // 4. Feedback Toast
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
        triggerFileDownload(JSON.stringify(presets, null, 2), `liquid_glass_presets_all_${Date.now()}.json`, 'application/json');
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

    // Quick Preset Select Dropdown Handler
    if (quickPresetSelect) {
        quickPresetSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === '') return;
            const idx = parseInt(val, 10);
            const presets = getStoredPresets();
            const p = presets[idx];
            if (p) {
                applyConfigurationPayload(p);
                showToast(`✓ #${p.sequenceNumber} - ${p.name} Başarıyla Yüklendi!`);
            }
        });
    }

    // Initial Engine Start
    updateGlassEngine();
    updateAuroraEngine();
    updateSequenceUI();
    renderSavedPresetsList();
});
