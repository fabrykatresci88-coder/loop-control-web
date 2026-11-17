import { test, expect } from '@playwright/test';
test('website structured data is valid and aligned with canonical', async ({ page }) => {
  await page.goto('/');
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(json);
  expect(data['@context']).toBe('https://schema.org');
  expect(data['@type']).toBe('WebSite');
  expect(data.name).toBe('Loop Control OS');
  expect(data.url).toBe('https://loopcontrolos.pl/');
  expect(data.inLanguage).toBe('pl-PL');
  expect(data.description).toBe(await page.locator('meta[name="description"]').getAttribute('content'));
});
