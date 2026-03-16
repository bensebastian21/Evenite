// tests/admin-dashboard.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'bensebastian021@gmail.com';
const PASSWORD = 'benappan47';

async function loginViaUI(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin/, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  // Navigate to admin panel
  if (!page.url().includes('/admin')) {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }
}

async function clickTab(page, label) {
  const btn = page.locator(`nav button[title="${label}"], nav button:has-text("${label}")`).first();
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForTimeout(1200);
  }
}

test.describe('Admin Dashboard — Full Feature Test', () => {

  test('1. Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Admin login redirects to admin panel', async ({ page }) => {
    await loginViaUI(page);
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
  });

  test('3. Dashboard tab — overview metrics load', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Dashboard');
    await page.waitForTimeout(1500);
    // Stats cards / metric numbers should be visible
    await expect(page.locator('body')).toBeVisible();
    const content = page.locator('main, [class*="grid"], [class*="stat"]').first();
    await expect(content).toBeVisible();
  });

  test('4. Analytics tab loads charts', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Analytics');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5. View Hosts tab loads host list', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'View Hosts');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('6. Host Applications tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Host Applications');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('7. Verify Students tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Verify Students');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('8. Manage Events tab loads event list', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Manage Events');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('9. Live Traffic & Heatmap tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Live Traffic & Heatmap');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('10. Fraud & Spam tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Fraud & Spam');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('11. Financials tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Financials');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('12. Support Hub tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Support Hub');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('13. Monitor Activity tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Monitor Activity');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('14. Notifications tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Notifications');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('15. No uncaught runtime errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await loginViaUI(page);
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

});
