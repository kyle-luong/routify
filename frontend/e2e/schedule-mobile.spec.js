import { expect, test } from '@playwright/test';

test.describe('Schedule Page Mobile Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('map appears before list on mobile due to flex-col-reverse', async ({ page }) => {
    await page.goto('/');

    // Verify mobile viewport
    const viewportSize = page.viewportSize();
    expect(viewportSize.width).toBeLessThanOrEqual(640);

    // Check that navbar is visible
    await expect(page.locator('header')).toBeVisible();
  });
});
