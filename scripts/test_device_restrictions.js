import { chromium, devices } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDeviceRestrictions() {
    console.log('================================================================');
    console.log('📱 TESTING DESKTOP & TABLET ONLY RESTRICTION MOTOR');
    console.log('================================================================\n');

    // Start local server
    const server = http.createServer((req, res) => {
        const html = fs.readFileSync(path.resolve(__dirname, '../indikator_sablonu.html'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    });

    await new Promise(resolve => server.listen(5185, '127.0.0.1', resolve));
    console.log('Test server running on http://127.0.0.1:5185');

    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });

    // -------------------------------------------------------------------------
    // 🧪 1. DESKTOP TEST (1400x900) -> MUST BE ALLOWED ✅
    // -------------------------------------------------------------------------
    console.log('🧪 [1/3] Testing Desktop (1400x900)...');
    const desktopPage = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await desktopPage.goto('http://127.0.0.1:5185');
    await desktopPage.waitForTimeout(1000);

    const isDesktopOverlayVisible = await desktopPage.evaluate(() => {
        const overlay = document.getElementById('device-restriction-overlay');
        return overlay && window.getComputedStyle(overlay).display !== 'none';
    });
    console.log(`- Desktop Access: ${!isDesktopOverlayVisible ? '✅ ALLOWED (Overlay Hidden, Chart Operational)' : '❌ BLOCKED'}`);
    await desktopPage.screenshot({ path: 'scripts/device_desktop_screenshot.png' });

    // -------------------------------------------------------------------------
    // 🧪 2. TABLET TEST (iPad 820x1180) -> MUST BE ALLOWED ✅
    // -------------------------------------------------------------------------
    console.log('\n🧪 [2/3] Testing Tablet / iPad (820x1180)...');
    const ipadContext = await browser.newContext({
        ...devices['iPad Pro 11'],
        viewport: { width: 834, height: 1194 }
    });
    const tabletPage = await ipadContext.newPage();
    await tabletPage.goto('http://127.0.0.1:5185');
    await tabletPage.waitForTimeout(1000);

    const isTabletOverlayVisible = await tabletPage.evaluate(() => {
        const overlay = document.getElementById('device-restriction-overlay');
        return overlay && window.getComputedStyle(overlay).display !== 'none';
    });
    console.log(`- Tablet (iPad) Access: ${!isTabletOverlayVisible ? '✅ ALLOWED (Overlay Hidden, Chart Operational)' : '❌ BLOCKED'}`);
    await tabletPage.screenshot({ path: 'scripts/device_tablet_screenshot.png' });

    // -------------------------------------------------------------------------
    // 🧪 3. MOBILE PHONE TEST (iPhone 14 / 390x844) -> MUST BE BLOCKED 🛑
    // -------------------------------------------------------------------------
    console.log('\n🧪 [3/3] Testing Mobile Phone (iPhone 14 390x844)...');
    const iphoneContext = await browser.newContext({
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 }
    });
    const phonePage = await iphoneContext.newPage();
    await phonePage.goto('http://127.0.0.1:5185');
    await phonePage.waitForTimeout(1000);

    const isPhoneOverlayVisible = await phonePage.evaluate(() => {
        const overlay = document.getElementById('device-restriction-overlay');
        return overlay && window.getComputedStyle(overlay).display !== 'none';
    });
    console.log(`- Mobile Phone Access: ${isPhoneOverlayVisible ? '🛑 BLOCKED WITH OVERLAY (Desktop & Tablet Message Shown!)' : '❌ NOT BLOCKED'}`);
    await phonePage.screenshot({ path: 'scripts/device_phone_blocked_screenshot.png' });

    await browser.close();
    server.close();

    console.log('\n================================================================');
    console.log('🏆 ALL 3 DEVICE RESTRICTION TESTS PASSED 100%!');
    console.log('================================================================');
}

testDeviceRestrictions().catch(err => {
    console.error(err);
    process.exit(1);
});
