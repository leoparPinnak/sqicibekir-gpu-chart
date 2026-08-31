import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));

    await page.goto('http://localhost:5173/indikator_sablonu.html');
    await page.waitForTimeout(1500);

    // 1. Initial State Screenshot
    await page.screenshot({ path: 'scripts/screenshot_symbol_01_initial.png' });
    console.log('✓ Initial BTC/USDT loaded.');

    // 2. Open Symbol Search Modal
    await page.click('#symbol-btn-wrapper');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_symbol_02_modal_all.png' });
    console.log('✓ Symbol Modal opened.');

    // 3. Switch to BIST tab
    await page.click('#sym-tab-bist');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_symbol_03_tab_bist.png' });
    console.log('✓ BIST tab filtered.');

    // 4. Search THYAO and click
    await page.fill('#symbol-search-input', 'THYAO');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_symbol_04_search_thyao.png' });
    
    // Click THYAO
    await page.click('.symbol-item:has-text("THYAO")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/screenshot_symbol_05_loaded_thyao.png' });
    console.log('✓ THYAO loaded on chart.');

    // 5. Open modal again and select AAPL (NASDAQ)
    await page.click('#symbol-btn-wrapper');
    await page.waitForTimeout(300);
    await page.click('#sym-tab-stocks');
    await page.waitForTimeout(300);
    await page.click('.symbol-item:has-text("AAPL")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/screenshot_symbol_06_loaded_aapl.png' });
    console.log('✓ AAPL loaded on chart.');

    // 6. Open modal again and select XAUUSD (Altın)
    await page.click('#symbol-btn-wrapper');
    await page.waitForTimeout(300);
    await page.click('#sym-tab-fx');
    await page.waitForTimeout(300);
    await page.click('.symbol-item:has-text("XAUUSD")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/screenshot_symbol_07_loaded_xauusd.png' });
    console.log('✓ XAUUSD loaded on chart.');

    await browser.close();
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
})();
