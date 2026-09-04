import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

    console.log('Testing root access at http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const title = await page.title();
    const currentUrl = page.url();
    console.log('Page Title:', title);
    console.log('Page URL:', currentUrl);

    // Verify that the landing portal elements exist
    const hasLandingPortal = await page.$('#landing-portal') !== null;
    const hasCentralCard = await page.$('.portal-glass-card') !== null;
    const hasExploreSection = await page.$('#explore-section') !== null;

    console.log('Checks:');
    console.log('- Has Landing Portal:', hasLandingPortal);
    console.log('- Has Central Glass Card:', hasCentralCard);
    console.log('- Has Market Explore Section:', hasExploreSection);

    await page.screenshot({ path: 'scripts/screenshot_root_domain_routing.png' });
    console.log('Screenshot saved: scripts/screenshot_root_domain_routing.png');

    if (hasLandingPortal && hasCentralCard) {
        console.log('🎉 SUCCESS: Root domain (http://localhost:5173/) correctly opens the Liquid Glass Landing Page!');
    } else {
        console.error('❌ FAILED: Landing page elements missing on root domain.');
    }

    await browser.close();
})();
