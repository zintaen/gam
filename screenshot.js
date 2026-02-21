const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto('http://localhost:5173');
    // Wait for the app to load
    await page.waitForSelector('.app-container');
    await new Promise(r => setTimeout(r, 500));

    // Function to create an alias
    const createAlias = async (name, command) => {
        await page.click('.btn-primary'); // "Add Alias"
        await page.waitForSelector('.modal');
        await page.type('textarea[placeholder*="checkout, status"]', command);
        await page.type('input[placeholder*="co, st, lg"]', name);
        // Click submit
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 500)); // wait for modal to close
    };

    await createAlias('co', 'checkout');
    await createAlias('st', 'status -sb');
    await createAlias('lg', 'log --oneline --graph --decorate');

    // Dashboard screenshot
    await page.waitForSelector('.alias-row');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'docs/screenshots/dashboard.png' });

    // Open Form for alias-form.png
    await page.click('.btn-primary');
    await page.waitForSelector('.modal');
    await new Promise(r => setTimeout(r, 500));

    await page.type('textarea[placeholder*="checkout, status"]', 'checkout branch');
    await new Promise(r => setTimeout(r, 1000)); // wait for suggestions
    await page.screenshot({ path: 'docs/screenshots/alias-form.png' });

    await browser.close();
})();
