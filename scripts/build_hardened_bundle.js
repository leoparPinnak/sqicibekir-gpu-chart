import fs from 'fs';
import JavaScriptObfuscator from 'javascript-obfuscator';

console.log('🔒 =====================================================================');
console.log('🛡️ BUILDING ENTERPRISE-GRADE IRONCLAD HARDENED JAVASCRIPT BUNDLE');
console.log('🔒 =====================================================================\n');

const sourceHtmlPath = 'indikator_sablonu.html';
const outputDir = 'dist-secured';
const outputHtmlPath = `${outputDir}/index.html`;

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

let htmlContent = fs.readFileSync(sourceHtmlPath, 'utf8');

// Match the main script block
const scriptRegex = /<script>([\s\S]*?)<\/script>/i;
const match = htmlContent.match(scriptRegex);

if (!match) {
    console.error('Error: <script> block not found in HTML!');
    process.exit(1);
}

const originalJsCode = match[1];
console.log(`[1/4] Original JavaScript Engine Size: ${(originalJsCode.length / 1024).toFixed(2)} KB`);

// 🛡️ PRE-INJECT ANTI-HOOKING PROTOTYPE FREEZE (Prevents WebGL Driver Shaders Theft)
const prototypeSecurityArmor = `
// 🛑 PROTOTYPE SEALING & ANTI-HOOKING SHIELD
(function() {
    try {
        if (typeof WebGL2RenderingContext !== 'undefined') Object.freeze(WebGL2RenderingContext.prototype);
        if (typeof WebGLRenderingContext !== 'undefined') Object.freeze(WebGLRenderingContext.prototype);
        if (typeof CanvasRenderingContext2D !== 'undefined') Object.freeze(CanvasRenderingContext2D.prototype);
    } catch(e) {}
})();
`;

const jsWithArmor = prototypeSecurityArmor + '\n' + originalJsCode;

console.log('[2/4] Applying Multi-Pass Control Flow Flattening, Self-Defending & Domain Lock...');
const t0 = performance.now();

// 🛡️ ENTERPRISE MULTI-PASS OBFUSCATION CONFIGURATION
const obfuscationResult = JavaScriptObfuscator.obfuscate(jsWithArmor, {
    target: 'browser',
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: false,
    debugProtection: false, // Set true in production to freeze F12 DevTools
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true, // 🌟 ANTI-TAMPER: Any modification or beautification crashes the code!
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 6,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.80,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 0.85,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
    domainLock: ['localhost', '127.0.0.1', 'tradingchart.com.tr', 'www.tradingchart.com.tr', '.tradingchart.com.tr', 'tradechart.pro', 'ottonline1553.com.tr', 'www.ottonline1553.com.tr'], // 🌟 DOMAIN LOCK: Only runs on authorized hosts!
    domainLockRedirectUrl: 'about:blank'
});

const hardenedJsCode = obfuscationResult.getObfuscatedCode();
const durationMs = performance.now() - t0;

console.log(`[3/4] ✓ Obfuscation & Hardening Complete in ${durationMs.toFixed(2)} ms!`);
console.log(`      Secured JavaScript Size: ${(hardenedJsCode.length / 1024).toFixed(2)} KB`);

// Replace script with hardened version using a function replacer
const hardenedHtml = htmlContent.replace(scriptRegex, () => `<script>\n${hardenedJsCode}\n</script>`);

fs.writeFileSync(outputHtmlPath, hardenedHtml, 'utf8');
console.log(`[4/4] ✓ Ironclad Secured Production Bundle saved to: ${outputHtmlPath}\n`);

// Copy SEO and manifest assets to dist-secured
['robots.txt', 'sitemap.xml', 'manifest.json'].forEach(f => {
    if (fs.existsSync(f)) {
        fs.copyFileSync(f, `${outputDir}/${f}`);
        console.log(`✓ Copied ${f} to ${outputDir}/${f}`);
    }
});

