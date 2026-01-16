import { expect, test } from '@playwright/test';

test.describe('Navbar and Footer Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('navbar is visible and readable on mobile', async ({ page }) => {
    await page.goto('/');

    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();

    // Check logo is visible
    const logo = page.locator('header a').first();
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('calview');

    // Check About link is visible
    const aboutLink = page.locator('header a[href="/about"]');
    await expect(aboutLink).toBeVisible();
  });

  test('footer is visible and readable on mobile', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check footer links are present
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
    await expect(page.locator('footer a[href="/contact"]')).toBeVisible();
  });

  test('navbar links are tappable on mobile', async ({ page }) => {
    await page.goto('/');

    const aboutLink = page.locator('header a[href="/about"]');
    await expect(aboutLink).toBeVisible();

    // Verify link is clickable
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('footer links are tappable on mobile', async ({ page }) => {
    await page.goto('/');

    const privacyLink = page.locator('footer a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();

    // Verify link is clickable
    await privacyLink.click();
    await expect(page).toHaveURL(/\/privacy/);
  });
});

test.describe('Navbar and Footer Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('navbar has full text labels on desktop', async ({ page }) => {
    await page.goto('/');

    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();

    // Check About and Help links are visible with text
    await expect(page.locator('header a[href="/about"]')).toBeVisible();
    await expect(page.locator('header a[href="/help"]')).toBeVisible();
  });
});
