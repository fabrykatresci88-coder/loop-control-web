import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [320, 390, 1280]) {
  test(`landing accessibility WCAG 2.1 AA at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 850 } });
    const page = await context.newPage();
    await page.goto('/');
    for (const view of ['crm','sales','leads','content']) {
      await page.locator(`[data-view="${view}"]`).click();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      expect(results.violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n=>n.target)})), `${width}px / ${view}`).toEqual([]);
    }
    await context.close();
  });
}

