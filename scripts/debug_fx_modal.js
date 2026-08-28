import { chromium } from 'playwright';

async function debugFxModal() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const res = await page.evaluate(() => {
        try {
            console.log('Calling openIndicatorModal()...');
            window.openIndicatorModal();
            const modal = document.getElementById('fx-modal-backdrop');
            return {
                modalFound: !!modal,
                hasClassActive: modal ? modal.classList.contains('active') : false,
                bodyInnerHtml: document.getElementById('fx-modal-body') ? document.getElementById('fx-modal-body').innerHTML.length : 0
            };
        } catch (e) {
            return { error: e.message, stack: e.stack };
        }
    });

    console.log('Result:', res);
    await browser.close();
}

debugFxModal().catch(console.error);
