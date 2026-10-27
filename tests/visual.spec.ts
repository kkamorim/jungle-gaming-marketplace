import { expect, test } from '@playwright/test';

test('home visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await expect(page).toHaveScreenshot('home.png', { fullPage: false });
});


