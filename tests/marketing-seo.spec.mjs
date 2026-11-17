import { test, expect } from '@playwright/test';
test('social preview metadata is consistent', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(title).toContain('Loop Control OS');
  expect(description?.length).toBeGreaterThan(40);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content','pl_PL');
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content','Loop Control OS');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content',title);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content',description);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://loopcontrolos.pl/');
});
test('search engine discovery files are present', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Sitemap: https://loopcontrolos.pl/sitemap.xml');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain('<loc>https://loopcontrolos.pl/</loc>');
});
