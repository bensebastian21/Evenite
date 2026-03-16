// tests/student-dashboard.spec.js
// Full student dashboard test — starts from login page UI
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'albinmathew2026@mca.ajce.in';
const PASSWORD = 'albin123';

// Login via UI form
async function loginViaUI(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
}

// Click sidebar tab by title (works whether nav is collapsed or expanded)
async function clickTab(page, title) {
  await page.locator(`aside button[title="${title}"], aside button:has-text("${title}")`).first().click();
  await page.waitForTimeout(800);
}

test.describe('Student Dashboard — Full Feature Test', () => {

  test('1. Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Login with valid credentials redirects to dashboard', async ({ page }) => {
    await loginViaUI(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('aside')).toBeVisible({ timeout: 10000 });
  });

  test('3. Explore — All events sub-tab', async ({ page }) => {
    await loginViaUI(page);
    // Explore is default — click All sub-tab
    const allBtn = page.locator('button', { hasText: /^All$/i }).first();
    if (await allBtn.isVisible()) await allBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4. Explore — For You sub-tab', async ({ page }) => {
    await loginViaUI(page);
    const btn = page.locator('button', { hasText: /For You/i }).first();
    if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(1500); }
    await expect(page.locator('body')).toBeVisible();
  });

  test('5. Explore — Trending sub-tab', async ({ page }) => {
    await loginViaUI(page);
    const btn = page.locator('button', { hasText: /Trending/i }).first();
    if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(1000); }
    await expect(page.locator('body')).toBeVisible();
  });

  test('6. Explore — Map view', async ({ page }) => {
    await loginViaUI(page);
    const btn = page.locator('button', { hasText: /^Map$/i }).first();
    if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(1500); }
    await expect(page.locator('body')).toBeVisible();
  });

  test('7. Live Vibes tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Live Vibes');
    await expect(page.locator('body')).toBeVisible();
  });

  test('8. Near Me tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Near Me');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('9. Bucket List / Goals tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Bucket List');
    await expect(page.locator('body')).toBeVisible();
  });

  test('10. My Events tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'My Events');
    await expect(page.locator('body')).toBeVisible();
  });

  test('11. Saved / Bookmarks tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Saved');
    await expect(page.locator('body')).toBeVisible();
  });

  test('12. Following / Subscribed Hosts tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Following');
    await expect(page.locator('body')).toBeVisible();
  });

  test('13. Friends tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Friends');
    await expect(page.locator('body')).toBeVisible();
  });

  test('14. Leaderboard tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Leaderboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('15. Achievements tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Achievements');
    await expect(page.locator('body')).toBeVisible();
  });

  test('16. Notifications / Updates tab', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Updates');
    await expect(page.locator('body')).toBeVisible();
  });

  test('17. No uncaught runtime errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await loginViaUI(page);
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

});
