import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3002/admin/login');
    
    // Login
    console.log("Logging in...");
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'kasakranthikiran@3324');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    console.log("Checking if login successful...");
    let url = page.url();
    if (url.includes('/login')) {
      console.log("Login failed with first password, trying second...");
      await page.fill('input[type="password"]', 'Kranthi@11046');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    console.log("Navigated to:", page.url());

    console.log("Test finished successfully.");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
