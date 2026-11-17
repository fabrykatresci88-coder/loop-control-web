import { test, expect } from '@playwright/test';
const widths = [320, 360, 390, 432, 768, 1280];
const views = ['crm', 'sales', 'leads', 'content'];
for (const width of widths) {
  test('demo layout at ' + width + 'px', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    for (const view of views) {
      await page.locator('[data-view="' + view + '"]').click();
      const dimensions = await page.evaluate(() => {
        const table = document.querySelector('.demo-table');
        const wrap = document.querySelector('.demo-tablewrap');
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          tableWidth: table.getBoundingClientRect().width,
          containerWidth: wrap.getBoundingClientRect().width,
          labels: [...table.querySelectorAll('tbody tr:first-child td')].map(td => td.dataset.label)
        };
      });
      expect(dimensions.documentWidth, view + ': page overflow').toBeLessThanOrEqual(dimensions.viewportWidth + 1);
      expect(dimensions.tableWidth, view + ': table overflow').toBeLessThanOrEqual(dimensions.containerWidth + 1);
      expect(dimensions.labels).toHaveLength(3);
      expect(dimensions.labels.every(Boolean)).toBeTruthy();
    }
    expect(errors).toEqual([]);
    await page.close();
  });
}
test('official contact address is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="mailto:kontakt@loopcontrolos.pl"]')).toHaveCount(1);
  await expect(page.locator('a[href^="mailto:kontakt@loopcontrolos.pl?subject="]')).toHaveCount(1);
});
