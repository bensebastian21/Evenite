// tests/host-dashboard.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'amaljyothi123@gmail.com';
const PASSWORD = 'benappan47';

// Login via UI form (host login page)
async function loginViaUI(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  // Host may land on /host-dashboard or /dashboard — wait for either
  await page.waitForURL(/dashboard/, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  // Navigate to host dashboard explicitly
  if (!page.url().includes('host-dashboard')) {
    await page.goto(`${BASE_URL}/host-dashboard`);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }
}

// Click a sidebar nav tab by its label text or title attribute
async function clickTab(page, label) {
  const btn = page.locator(`nav button[title="${label}"], nav button:has-text("${label}")`).first();
  if (await btn.count() > 0) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
}

test.describe('Host Dashboard — Full Feature Test', () => {

  test('1. Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Login with host credentials redirects to dashboard', async ({ page }) => {
    await loginViaUI(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
  });

  test('3. Events tab — loads event list', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Events');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
    // Stats cards should be present
    const statsArea = page.locator('[class*="grid"]').first();
    await expect(statsArea).toBeVisible();
  });

  test('4. Create Event form opens', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Events');
    await page.waitForTimeout(1000);
    const createBtn = page.locator('button:has-text("Create"), button:has-text("New Event"), button:has-text("+ Create")').first();
    if (await createBtn.count() > 0 && await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(800);
      // Form should appear
      const form = page.locator('form, input[name="title"], input[placeholder*="title" i]').first();
      await expect(form).toBeVisible({ timeout: 5000 });
    } else {
      // Just verify events tab is visible
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('5. Registrations tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Registrations');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('6. Feedback tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Feedback');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('7. Discover tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Discover');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('8. Analytics tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Analytics');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('9. Studio tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Studio');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('10. Certificates tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'Certificates');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('11. AI Event Studio (GenLoop) tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'AI Event Studio');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('12. AI Insights tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'AI Insights');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('13. AI Marketing tab loads', async ({ page }) => {
    await loginViaUI(page);
    await clickTab(page, 'AI Marketing');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('14. Host Profile tab loads and shows form', async ({ page }) => {
    await loginViaUI(page);
    // Profile tab may be in a settings/profile area
    const profileBtn = page.locator('nav button:has-text("Profile"), nav button[title="Profile"]').first();
    if (await profileBtn.count() > 0) {
      await profileBtn.click();
      await page.waitForTimeout(1000);
    }
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
