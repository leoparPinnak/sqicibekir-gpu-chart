import fs from 'fs';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 1. Generating Strictly Locked Bundle for "sizin-alan-adiniz.com"...');

const sourceHtml = fs.readFileSync('indikator_sablonu.html', 'utf8');
const scriptMatch = sourceHtml.match(/<script>([\s\S]*?)<\/script>/i);
const originalJs = scriptMatch[1];

// 🛑 SADECE 'sizin-alan-adiniz.com' İÇİN KİLİTLİ OBFUSCATION
const lockedResult = JavaScriptObfuscator.obfuscate(originalJs, {
    target: 'browser',
    compact: true,
    controlFlowFlattening: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    domainLock: ['sizin-alan-adiniz.com'], // 🌟 SADECE BU DOMAINDE ÇALIŞIR!
    domainLockRedirectUrl: 'about:blank'
});

const strictlyLockedHtml = sourceHtml.replace(/<script>([\s\S]*?)<\/script>/i, () => `<script>\n${lockedResult.getObfuscatedCode()}\n</script>`);
fs.writeFileSync('dist-secured/strictly_locked_demo.html', strictlyLockedHtml, 'utf8');
console.log('✓ Created: dist-secured/strictly_locked_demo.html');

console.log('\n🖥️ 2. Launching Visible Browser to Test Unauthorized Opening...');
const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--start-maximized']
});

const page = await browser.newPage();
const fileUrl = `file:///${path.resolve(__dirname, '../dist-secured/strictly_locked_demo.html').replace(/\\/g, '/')}`;

console.log(`Trying to open locked file locally / on unauthorized domain: ${fileUrl}`);
await page.goto(fileUrl);
await page.waitForTimeout(3000);

const currentUrl = page.url();
console.log(`\nResulting Browser URL: ${currentUrl}`);
console.log(currentUrl === 'about:blank' ? '🛑 BAŞARILI: Sayfa başka domainde/bilgisayarda açıldığı için kendini anında KAPATTI (about:blank)!' : 'Açık');

await page.waitForTimeout(3000);
await browser.close();
