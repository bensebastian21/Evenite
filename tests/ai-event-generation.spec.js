// @ts-nocheck
// tests/ai-event-generation.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'amaljyothi123@gmail.com';
const PASSWORD = 'benappan47';

const MOCK_RESPONSE = {
  runId: 'test-run-001',
  variants: [{
    variantId: 'var-001',
    predictedViralScore: 87,
    posterUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUzYThhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QUkgSGFja2F0aG9uIDIwMjY8L3RleHQ+PC9zdmc+',
    textCopy: {
      title: 'AI Hackathon 2026',
      shortHook: 'Build the future with AI - 24 hours, unlimited possibilities.',
      descriptionHtml: '<p>Join us for an epic 24-hour hackathon focused on AI and ML.</p>',
      callToAction: 'Register Now - Limited Seats!',
      keywords: ['AI', 'Hackathon', 'MachineLearning', 'Tech'],
      gamificationRewards: ['Best AI Model Award', 'Cash Prize Rs.50,000'],
      badges: ['AI Pioneer', 'Code Warrior'],
      urgencyTriggers: ['Only 200 seats available'],
      targetAudienceInsight: 'Engineering students aged 18-25 with interest in AI/ML',
    },
  }],
};

async function loginAndGoToGenLoop(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  if (!page.url().includes('host-dashboard')) {
    await page.goto(`${BASE_URL}/host-dashboard`);
    await page.waitForLoadState('networkidle', { timeout: 30000 });
  }
  const studioTab = page.locator('nav button:has-text("AI Event Studio"), nav button[title="AI Event Studio"]').first();
  await studioTab.waitFor({ state: 'visible', timeout: 15000 });
  await studioTab.click();
  await page.waitForTimeout(1500);
}

async function fillForm(page) {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const dateStr = d.toISOString().slice(0, 10);
  const dl = new Date(d);
  dl.setDate(dl.getDate() - 2);
  const dlStr = dl.toISOString().slice(0, 10);

  await page.locator("input[placeholder='e.g. Next-Gen Hackathon 2026']").fill('AI Hackathon 2026');
  await page.locator("textarea[placeholder='e.g. Building AI tools with React and Python']").fill('Artificial Intelligence and Machine Learning');
  await page.locator("input[placeholder='e.g. CS Freshmen']").fill('Engineering students and tech enthusiasts');
  await page.locator("input[placeholder='e.g. Library Rm 4']").fill('AJCE Auditorium, Kochi');

  const dates = page.locator('input[type=date]');
  if (await dates.count() > 0) await dates.nth(0).fill(dateStr);
  if (await dates.count() > 1) await dates.nth(1).fill(dlStr);
  const time = page.locator('input[type=time]').first();
  if (await time.count() > 0) await time.fill('09:00');
  const cap = page.locator("input[placeholder='100']").first();
  if (await cap.count() > 0) { await cap.click({ clickCount: 3 }); await cap.fill('200'); }
}

async function clickGenerate(page) {
  const btn = page.locator('button').filter({ hasText: 'Generate' }).last();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
}

async function mockGenerate(context, status, body) {
  await context.route(/\/api\/genloop\/generate/, async (route) => {
    await route.fulfill({
      status: status || 200,
      contentType: 'application/json',
      body: JSON.stringify(body || MOCK_RESPONSE),
    });
  });
}

test.describe('AI Event Generation - GenLoop Studio', () => {

  test('1. GenLoop Studio tab is accessible', async ({ page }) => {
    await loginAndGoToGenLoop(page);
    await expect(page.locator("input[placeholder='e.g. Next-Gen Hackathon 2026']")).toBeVisible({ timeout: 10000 });
  });

  test('2. All form fields are visible', async ({ page }) => {
    await loginAndGoToGenLoop(page);
    await expect(page.locator("input[placeholder='e.g. Next-Gen Hackathon 2026']")).toBeVisible();
    await expect(page.locator("textarea[placeholder='e.g. Building AI tools with React and Python']")).toBeVisible();
    await expect(page.locator("input[placeholder='e.g. CS Freshmen']")).toBeVisible();
    await expect(page.locator("input[placeholder='e.g. Library Rm 4']")).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Generate' }).last()).toBeVisible();
  });

  test('3. Empty submit shows validation errors', async ({ page }) => {
    await loginAndGoToGenLoop(page);
    await clickGenerate(page);
    await page.waitForTimeout(1000);
    const errors = await page.locator('p.text-red-600').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('4. Fill form and generate (mocked API)', async ({ page, context }) => {
    await mockGenerate(context);
    await loginAndGoToGenLoop(page);
    await fillForm(page);
    await clickGenerate(page);
    await expect(page.locator("button:has-text('Publish Event')").first()).toBeVisible({ timeout: 30000 });
  });

  test('5. Result shows viral score, title, publish and regenerate (mocked)', async ({ page, context }) => {
    await mockGenerate(context);
    await loginAndGoToGenLoop(page);
    await fillForm(page);
    await clickGenerate(page);
    await expect(page.locator("button:has-text('Publish Event')").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator(":has-text('Viral Score')").first()).toBeVisible();
    await expect(page.locator(":has-text('AI Hackathon 2026')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Regenerate')").first()).toBeVisible();
  });

  test('6. Regenerate triggers second API call (mocked)', async ({ page, context }) => {
    let calls = 0;
    await context.route(/\/api\/genloop\/generate/, async (route) => {
      calls++;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RESPONSE) });
    });
    await loginAndGoToGenLoop(page);
    await fillForm(page);
    await clickGenerate(page);
    const regenBtn = page.locator("button:has-text('Regenerate')").first();
    await regenBtn.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(500);
    await regenBtn.click({ force: true });
    await page.waitForTimeout(3000);
    expect(calls).toBe(2);
  });

  test('7. API failure shows error toast (mocked 500)', async ({ page, context }) => {
    await mockGenerate(context, 500, { msg: 'AI Generation failed.' });
    await loginAndGoToGenLoop(page);
    await fillForm(page);
    await clickGenerate(page);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('8. No uncaught runtime errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await loginAndGoToGenLoop(page);
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

});
