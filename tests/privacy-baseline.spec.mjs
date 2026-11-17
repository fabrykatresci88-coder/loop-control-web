import { test, expect } from '@playwright/test';

test('landing does not initiate third-party marketing tracking before consent', async ({ page }) => {
  const thirdParty = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) thirdParty.push(url.hostname);
  });
  await page.goto('/');
  for (const view of ['crm', 'sales', 'leads', 'content']) {
    await page.locator(`[data-view="${view}"]`).click();
  }
  expect(thirdParty, 'No external scripts, trackers or network requests before consent').toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(storage).toEqual({ local: [], session: [] });
});

test('landing does not present a nonfunctional signup form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:kontakt@loopcontrolos.pl"]')).toHaveCount(2);
});
