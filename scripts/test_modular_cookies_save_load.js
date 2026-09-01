import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1540, height: 1000 } });
    const page = await context.newPage();

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('1. Modifying modular values across Buton, Input, Tab, and Card...');
    await page.evaluate(() => {
        // Buttons
        const btnSp = document.getElementById('param-btn-specular');
        if (btnSp) { btnSp.value = '175'; btnSp.dispatchEvent(new Event('input')); }
        const btnIg = document.getElementById('param-btn-inner-glow');
        if (btnIg) { btnIg.value = '130'; btnIg.dispatchEvent(new Event('input')); }

        // Inputs
        const inputOp = document.getElementById('param-input-opacity');
        if (inputOp) { inputOp.value = '45'; inputOp.dispatchEvent(new Event('input')); }

        // Cards
        const cardRd = document.getElementById('param-card-radius');
        if (cardRd) { cardRd.value = '32'; cardRd.dispatchEvent(new Event('input')); }

        // Set name and desc in save box
        const nameInput = document.getElementById('save-preset-name-input');
        if (nameInput) nameInput.value = 'Ozel Moduler VisionOS #1';
        const descInput = document.getElementById('save-preset-desc-input');
        if (descInput) descInput.value = 'Butonlar %175 Parlak, Kart Radius 32px';
    });

    console.log('2. Clicking Save to Cookies & Storage (#save-json-btn)...');
    await page.click('#save-json-btn');
    await page.waitForTimeout(500);

    console.log('3. Checking dropdown count...');
    const quickSelectOptions = await page.evaluate(() => {
        const sel = document.getElementById('quick-preset-select');
        return sel ? sel.options.length : 0;
    });
    console.log(`✓ Quick Presets Dropdown has ${quickSelectOptions} options`);

    console.log('4. Switching to different preset (Sapphire)...');
    await page.click('.preset-pill[data-preset="sapphire"]');
    await page.waitForTimeout(300);

    console.log('5. Reloading saved preset via Quick Presets Dropdown...');
    await page.selectOption('#quick-preset-select', { index: 1 });
    await page.waitForTimeout(400);

    const reloadedValues = await page.evaluate(() => {
        return {
            btnSpecular: document.getElementById('param-btn-specular')?.value,
            btnInnerGlow: document.getElementById('param-btn-inner-glow')?.value,
            inputOpacity: document.getElementById('param-input-opacity')?.value,
            cardRadius: document.getElementById('param-card-radius')?.value
        };
    });

    console.log('✓ Reloaded Values:', JSON.stringify(reloadedValues, null, 2));

    if (reloadedValues.btnSpecular === '175' && reloadedValues.btnInnerGlow === '130' && reloadedValues.inputOpacity === '45' && reloadedValues.cardRadius === '32') {
        console.log('🎉 Multi-component Modular Save/Load Test PASSED PERFECTLY!');
    } else {
        console.error('❌ Verification failed: Values did not match');
        process.exit(1);
    }

    await browser.close();
})();
