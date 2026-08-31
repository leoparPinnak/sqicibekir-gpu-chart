import fs from 'fs';

// 1. UPDATE MAIN ENGINE FILES (indikator_sablonu.html & index.html)
function updateEngine(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const demoModeCss = `
        /* ============================================================ */
        /* 🎬 CLEAN CANVAS DEMO MODE (PURE CHART / ZERO TOOLBARS)       */
        /* ============================================================ */
        body.demo-mode .top-toolbar,
        body.demo-mode .tv-left-toolbar,
        body.demo-mode #drawing-toolbar,
        body.demo-mode .tv-floating-toolbar,
        body.demo-mode #tv-favorite-bar,
        body.demo-mode .tv-property-toolbar,
        body.demo-mode #tv-prop-toolbar,
        body.demo-mode .hud-overlay-card,
        body.demo-mode .bottom-statusbar,
        body.demo-mode .time-axis-bar,
        body.demo-mode .price-axis-sidebar,
        body.demo-mode .axis-corner-reset,
        body.demo-mode .subpanes-wrapper,
        body.demo-mode .device-restriction-overlay {
            display: none !important;
        }

        body.demo-mode,
        body.demo-mode #app-root,
        body.demo-mode .main-workspace,
        body.demo-mode .chart-body,
        body.demo-mode .chart-viewport-column,
        body.demo-mode .canvas-container {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            overflow: hidden !important;
        }

        body.demo-mode canvas {
            width: 100vw !important;
            height: 100vh !important;
        }
    `;

    const demoModeJs = `
        // 🎬 GLOBAL DEMO MODE CONTROLLER
        window.setDemoMode = function(isDemo) {
            if (isDemo) {
                document.body.classList.add('demo-mode');
            } else {
                document.body.classList.remove('demo-mode');
            }
            if (typeof resizeCanvas === 'function') {
                setTimeout(resizeCanvas, 50);
            }
        };

        // Otomatik Demo Mod Tespiti (Iframe veya URL Parametresi)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('demo') === 'true' || urlParams.get('demo') === '1' || window.self !== window.top) {
                document.body.classList.add('demo-mode');
            }
        } catch(e) {}
    `;

    // CSS enjeksiyonu
    const styleEndIdx = content.indexOf('</style>');
    if (styleEndIdx !== -1) {
        content = content.substring(0, styleEndIdx) + demoModeCss + content.substring(styleEndIdx);
    }

    // JS enjeksiyonu
    const scriptEndIdx = content.lastIndexOf('</script>');
    if (scriptEndIdx !== -1) {
        content = content.substring(0, scriptEndIdx) + demoModeJs + content.substring(scriptEndIdx);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Clean Demo Mode injected into ${filePath}`);
}

// 2. UPDATE FRONTEND (frontend/index.html)
function updateFrontendIndex() {
    const htmlPath = 'frontend/index.html';
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Update iframe src to include demo=true
    html = html.replace('src="../indikator_sablonu.html"', 'src="../indikator_sablonu.html?demo=true"');

    // Update launchTerminal & closeTerminalAndReturn functions
    const oldLaunch = `        window.launchTerminal = function() {
            if (isTerminalActive) return;
            isTerminalActive = true;

            if (cameraDirector) {
                cameraDirector.stop();
            }

            // Unblur background and allow interactive pointer events
            bgStage.className = 'unblurred';
            iframe.style.pointerEvents = 'auto';

            // Hide landing portal & glow
            portal.classList.add('hidden');
            if (glowLayer) glowLayer.style.opacity = '0';

            // Show return button
            returnBtn.style.display = 'inline-flex';
        };`;

    const newLaunch = `        window.launchTerminal = function() {
            if (isTerminalActive) return;
            isTerminalActive = true;

            if (cameraDirector) {
                cameraDirector.stop();
            }

            // Tell chart engine to leave demo mode and show full professional toolbars
            try {
                const chartWin = iframe.contentWindow;
                if (chartWin && typeof chartWin.setDemoMode === 'function') {
                    chartWin.setDemoMode(false);
                }
            } catch(e) {}

            // Unblur background and allow interactive pointer events
            bgStage.className = 'unblurred';
            iframe.style.pointerEvents = 'auto';

            // Hide landing portal & glow
            portal.classList.add('hidden');
            if (glowLayer) glowLayer.style.opacity = '0';

            // Show return button
            returnBtn.style.display = 'inline-flex';
        };`;

    html = html.replace(oldLaunch, newLaunch);

    const oldClose = `        window.closeTerminalAndReturn = function() {
            isTerminalActive = false;

            // Re-blur background and disable direct pointer events
            bgStage.className = 'blurred';
            iframe.style.pointerEvents = 'none';

            // Show landing portal & glow
            portal.classList.remove('hidden');
            if (glowLayer) glowLayer.style.opacity = '1';

            // Hide return button
            returnBtn.style.display = 'none';

            // Resume autonomous camera director
            if (cameraDirector) {
                cameraDirector.start();
            }
        };`;

    const newClose = `        window.closeTerminalAndReturn = function() {
            isTerminalActive = false;

            // Tell chart engine to enter clean canvas demo mode
            try {
                const chartWin = iframe.contentWindow;
                if (chartWin && typeof chartWin.setDemoMode === 'function') {
                    chartWin.setDemoMode(true);
                }
            } catch(e) {}

            // Re-blur background and disable direct pointer events
            bgStage.className = 'blurred';
            iframe.style.pointerEvents = 'none';

            // Show landing portal & glow
            portal.classList.remove('hidden');
            if (glowLayer) glowLayer.style.opacity = '1';

            // Hide return button
            returnBtn.style.display = 'none';

            // Resume autonomous camera director
            if (cameraDirector) {
                cameraDirector.start();
            }
        };`;

    html = html.replace(oldClose, newClose);

    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('✓ Updated frontend/index.html to seamlessly control demo mode in chart engine');
}

updateEngine('indikator_sablonu.html');
updateEngine('index.html');
updateFrontendIndex();
console.log('CLEAN DEMO MODE SETUP COMPLETED!');
