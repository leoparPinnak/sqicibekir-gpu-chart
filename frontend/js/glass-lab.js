/**
 * 🧪 LIQUID GLASS UI STUDIO & COMPONENT LAB CONTROLLER
 * Real-time reactive parameter binding & CSS code generator
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Parameter Sliders & Value Labels
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

    // 2. Presets Database
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

    // Helper: Update CSS Variables & UI
    function updateGlassEngine() {
        const op = parseInt(paramOpacity.value, 10);
        const bl = parseInt(paramBlur.value, 10);
        const sp = parseInt(paramSpecular.value, 10);
        const ig = parseInt(paramInnerGlow.value, 10);
        const rd = parseInt(paramRadius.value, 10);

        // Update Labels
        valOpacity.textContent = `${op}%`;
        valBlur.textContent = `${bl}px`;
        valSpecular.textContent = `${sp}%`;
        valInnerGlow.textContent = `${ig}%`;
        valRadius.textContent = rd >= 9000 ? '9999px (Hap / Pill)' : `${rd}px`;

        // Update Root CSS Variables
        const root = document.documentElement;
        root.style.setProperty('--glass-opacity', (op / 100).toFixed(2));
        root.style.setProperty('--glass-blur', `${bl}px`);
        root.style.setProperty('--glass-specular-alpha', (sp / 100).toFixed(2));
        root.style.setProperty('--glass-inner-glow-alpha', (ig / 100).toFixed(2));
        root.style.setProperty('--glass-radius', rd >= 9000 ? '9999px' : `${rd}px`);
        root.style.setProperty('--glass-accent-color', currentAccentHex);
        root.style.setProperty('--glass-accent-rgb', currentAccentRGB);

        // Generate Exportable CSS String
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

    // Attach Slider Event Listeners
    [paramOpacity, paramBlur, paramSpecular, paramInnerGlow, paramRadius].forEach(slider => {
        slider.addEventListener('input', () => {
            // Remove active preset highlight if user manually adjusts
            document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
            updateGlassEngine();
        });
    });

    // Preset Buttons
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

                // Sync color dots
                document.querySelectorAll('.color-dot').forEach(dot => {
                    dot.classList.toggle('active', dot.getAttribute('data-color') === conf.color);
                });

                updateGlassEngine();
            }
        });
    });

    // Color Palette
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            currentAccentHex = dot.getAttribute('data-color');
            // Convert hex to rgb
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

    // Copy CSS Button
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

    // Reset Button
    resetParamsBtn.addEventListener('click', () => {
        const defaultPreset = document.querySelector('.preset-pill[data-preset="visionos"]');
        if (defaultPreset) defaultPreset.click();
    });

    // 3. Background Stage Switcher
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

    // 4. Interactive Tabs & Steppers in Demo Area
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
});
