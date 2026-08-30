import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function redTeamStealEngine() {
    console.log('================================================================');
    console.log('🏴‍☠️ [RED-TEAM ATTACK SIMULATION] Attempting to Steal the Engine');
    console.log('================================================================\n');

    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle', '--allow-file-access-from-files']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    // =========================================================================
    // ⚔️ ATTACK VECTOR 1: WebGL Context Hooking & Shader Interception
    // Attacker injects prototype hooks BEFORE any page script runs!
    // =========================================================================
    const stolenShaders = [];
    const stolenGLCalls = [];

    await page.addInitScript(() => {
        window.__STOLEN_DATA__ = {
            shaders: [],
            buffers: [],
            textures: [],
            indicatorFunctions: {}
        };

        // Hook WebGL2 Shader Source
        const originalShaderSource = WebGL2RenderingContext.prototype.shaderSource;
        WebGL2RenderingContext.prototype.shaderSource = function(shader, source) {
            window.__STOLEN_DATA__.shaders.push(source);
            return originalShaderSource.apply(this, arguments);
        };

        // Hook WebGL2 Texture Data
        const originalTexImage2D = WebGL2RenderingContext.prototype.texImage2D;
        WebGL2RenderingContext.prototype.texImage2D = function() {
            window.__STOLEN_DATA__.textures.push({
                target: arguments[0],
                level: arguments[1],
                internalformat: arguments[2],
                width: arguments[3],
                height: arguments[4]
            });
            return originalTexImage2D.apply(this, arguments);
        };
    });

    const targetUrl = `file:///${path.resolve(__dirname, '../dist-secured/index.html').replace(/\\/g, '/')}`;
    console.log(`[Target] Loading secured bundle: ${targetUrl}\n`);
    await page.goto(targetUrl);
    await page.waitForTimeout(2000);

    // =========================================================================
    // ⚔️ ATTACK VECTOR 2: Memory & Window Object Scraping
    // =========================================================================
    console.log('--- [VECTOR 1] Inspecting Global `window` Namespace ---');
    const windowInspection = await page.evaluate(() => {
        const suspiciousKeys = [];
        for (const key in window) {
            if (!key.startsWith('webkit') && !key.startsWith('on') && typeof window[key] === 'function') {
                suspiciousKeys.push(key);
            }
        }
        return {
            totalKeys: Object.keys(window).length,
            suspiciousFunctions: suspiciousKeys.slice(0, 20),
            hasDirectCandleData: typeof window.candleData !== 'undefined',
            hasDirectIndicatorEngine: typeof window.calculateIndicators !== 'undefined'
        };
    });
    console.log('Global window scan result:', windowInspection);

    // =========================================================================
    // ⚔️ ATTACK VECTOR 3: Extract Intercepted WebGL Shaders
    // =========================================================================
    console.log('\n--- [VECTOR 2] Intercepting WebGL GPU Shaders via Driver Hooking ---');
    const interceptedData = await page.evaluate(() => window.__STOLEN_DATA__);
    console.log(`Intercepted Shaders Count: ${interceptedData.shaders.length}`);
    if (interceptedData.shaders.length > 0) {
        console.log('⚠️ [VULNERABILITY DETECTED]: GPU Shader Source extracted from WebGL driver!');
        fs.writeFileSync('scripts/stolen_shader_dump.glsl', interceptedData.shaders.join('\n\n/* --- NEXT SHADER --- */\n\n'));
        console.log('Saved stolen shaders to: scripts/stolen_shader_dump.glsl');
    }

    // =========================================================================
    // ⚔️ ATTACK VECTOR 4: Reverse-Engineering Obfuscated JS AST
    // =========================================================================
    console.log('\n--- [VECTOR 3] Attempting Automated String Table & AST Recovery ---');
    const pageHtml = fs.readFileSync('dist-secured/index.html', 'utf8');
    const scriptMatch = pageHtml.match(/<script>([\s\S]*?)<\/script>/i);
    const rawJs = scriptMatch ? scriptMatch[1] : '';

    // Check if variables or strings can be easily grepped
    const ichimokuMatches = (rawJs.match(/Ichimoku/gi) || []).length;
    const kijunMatches = (rawJs.match(/Kijun/gi) || []).length;
    const naturalLogMatches = (rawJs.match(/Math\.exp/gi) || []).length;
    const rsiMatches = (rawJs.match(/RSI/gi) || []).length;

    console.log(`AST Scan Results in Obfuscated Bundle:`);
    console.log(`- "Ichimoku" occurrences: ${ichimokuMatches}`);
    console.log(`- "Kijun" occurrences: ${kijunMatches}`);
    console.log(`- "RSI" occurrences: ${rsiMatches}`);
    console.log(`- Clear Math formulas exposed: ${naturalLogMatches}`);

    // =========================================================================
    // ⚔️ ATTACK VECTOR 5: Canvas Frame Scraping & Clone Replay Attack
    // =========================================================================
    console.log('\n--- [VECTOR 4] Cloning Entire Bundle & Running Offline Sandbox ---');
    const clonedHtmlPath = 'scripts/cloned_stolen_engine.html';
    fs.writeFileSync(clonedHtmlPath, pageHtml, 'utf8');
    console.log(`Attacker cloned the full bundle to: ${clonedHtmlPath}`);

    const clonedPage = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await clonedPage.goto(`file:///${path.resolve(__dirname, '../scripts/cloned_stolen_engine.html').replace(/\\/g, '/')}`);
    await clonedPage.waitForTimeout(1500);

    const isCloneRunning = await clonedPage.evaluate(() => {
        return typeof window.smoothMinPrice !== 'undefined' || !!document.querySelector('canvas');
    });

    console.log(`Did the cloned offline copy execute successfully? ${isCloneRunning ? 'YES ⚠️ (Clone can run offline)' : 'NO 🔒 (Blocked by domain/license lock)'}`);

    await browser.close();
    console.log('\n================================================================');
    console.log('🏁 [PENETRATION TEST COMPLETE] Report Ready!');
    console.log('================================================================');
}

redTeamStealEngine().catch(err => {
    console.error(err);
    process.exit(1);
});
