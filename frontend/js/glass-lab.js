/**
 * 🧪 LIQUID GLASS UI STUDIO & COMPONENT LAB CONTROLLER
 * Real-time reactive parameter binding & CSS code generator
 */

document.addEventListener('DOMContentLoaded', () => {
    // ========================================================
    // 1. PANEL TAB SWITCHER (CAM FİZİĞİ vs AURORA MOTORU)
    // ========================================================
    const panelTabBtns = document.querySelectorAll('.panel-tab-btn');
    const tabContentGlass = document.getElementById('tab-content-glass');
    const tabContentAurora = document.getElementById('tab-content-aurora');

    panelTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            panelTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-panel-tab');
            if (targetTab === 'glass') {
                tabContentGlass.classList.add('active');
                tabContentAurora.classList.remove('active');
            } else if (targetTab === 'aurora') {
                tabContentGlass.classList.remove('active');
                tabContentAurora.classList.add('active');
            }
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

    // Set initial motion class on body
    bodyEl.classList.remove('motion-clockwise', 'motion-counter', 'motion-wave', 'motion-pulse', 'motion-vortex');
    bodyEl.classList.add(currentMotionClass);

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

    // Motion Mode Buttons (Galaxy, Clockwise, Counter, Wave, Pulse, Vortex)
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

    // Galactic Core Pivot Buttons (Center, Card, Mouse, TopLeft, TopRight, Bottom)
    document.querySelectorAll('.pivot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pivot-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentPivotMode = btn.getAttribute('data-pivot');
            updatePivotCoordinates();
        });
    });

    // Aurora Themes (Cosmic, Cyber, Fire, Ocean, Emerald, Monochrome)
    document.querySelectorAll('.aurora-theme-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aurora-theme-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const theme = btn.getAttribute('data-aurora-theme');
            bodyEl.classList.remove('theme-cosmic', 'theme-cyber', 'theme-fire', 'theme-ocean', 'theme-emerald', 'theme-monochrome');
            bodyEl.classList.add(`theme-${theme}`);
        });
    });

    // Reset Aurora Button
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

    // 4. Interactive Mouse Tracking & Galactic Core Following
    let mouseTargetX = 0, mouseTargetY = 0;
    let mouseCurrentX = 0, mouseCurrentY = 0;

    window.addEventListener('mousemove', (e) => {
        // If mouse is chosen as Galactic Core, rotate around the cursor!
        if (currentPivotMode === 'mouse') {
            document.documentElement.style.setProperty('--galaxy-pivot-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--galaxy-pivot-y', `${e.clientY}px`);
        }

        if (!checkboxMouseFollow.checked) return;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mouseTargetX = ((e.clientX - cx) / cx) * 35; // max 35px parallax
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
    // 5. ARKA PLAN STAGE DEĞİŞTİRİCİ
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

    // 6. Interactive Tabs & Steppers in Demo Area
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
});
