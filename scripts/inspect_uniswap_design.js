import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    console.log('🔍 Connecting to https://app.uniswap.org/?intro=true ...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        await page.goto('https://app.uniswap.org/?intro=true', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
        console.warn('Networkidle timeout, continuing with loaded DOM...');
    }

    await page.waitForTimeout(3000);

    // Take screenshot of main landing/app
    await page.screenshot({ path: 'scripts/uniswap_01_main.png', fullPage: true });
    console.log('✓ Captured main screenshot: scripts/uniswap_01_main.png');

    // Inspect DOM, styles, tech stack
    const analysis = await page.evaluate(() => {
        const bodyStyle = window.getComputedStyle(document.body);
        
        // Detect Frameworks & Libraries
        const hasReact = !!(window.React || document.querySelector('[data-reactroot], [id="__next"], [id="root"]'));
        const hasNext = !!(window.__NEXT_DATA__ || document.querySelector('#__next'));
        
        // Extract all fonts used
        const allElements = Array.from(document.querySelectorAll('*'));
        const fontFamilies = new Set();
        const backgroundColors = new Set();
        const textColors = new Set();
        const borderRadii = new Set();

        allElements.slice(0, 300).forEach(el => {
            const cs = window.getComputedStyle(el);
            if (cs.fontFamily) fontFamilies.add(cs.fontFamily);
            if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') backgroundColors.add(cs.backgroundColor);
            if (cs.color) textColors.add(cs.color);
            if (cs.borderRadius && cs.borderRadius !== '0px') borderRadii.add(cs.borderRadius);
        });

        // Main navigation items
        const navLinks = Array.from(document.querySelectorAll('nav a, header a, header button')).map(el => ({
            text: el.innerText.trim(),
            tag: el.tagName
        })).filter(item => item.text.length > 0);

        // Header and layout container classes
        const header = document.querySelector('header, nav');
        const main = document.querySelector('main, #app-root, [class*="App"]');

        return {
            title: document.title,
            hasNext,
            hasReact,
            bodyBg: bodyStyle.backgroundColor,
            bodyColor: bodyStyle.color,
            fontFamilies: Array.from(fontFamilies).slice(0, 8),
            backgroundColors: Array.from(backgroundColors).slice(0, 15),
            textColors: Array.from(textColors).slice(0, 15),
            borderRadii: Array.from(borderRadii).slice(0, 10),
            navLinks: navLinks.slice(0, 15),
            headerHtml: header ? header.outerHTML.slice(0, 1500) : null
        };
    });

    fs.writeFileSync('scripts/uniswap_analysis.json', JSON.stringify(analysis, null, 2), 'utf8');
    console.log('✓ Analysis saved to scripts/uniswap_analysis.json');
    console.log(JSON.stringify(analysis, null, 2));

    await browser.close();
})();
