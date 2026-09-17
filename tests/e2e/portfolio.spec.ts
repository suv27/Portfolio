import { expect, test } from '@playwright/test';

test('portfolio loads and shows the security command center', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Security Software Engineer/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible();
});
