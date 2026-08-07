import { test, expect } from '@playwright/test';

test.describe('PhotoCalia App', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PhotoCalia/);
  });

  test('should display the header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('should display the converter upload area', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-converter')).toBeVisible();
  });

  test('should display the footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-footer')).toBeVisible();
  });

  test('should navigate to how-it-works page', async ({ page }) => {
    await page.goto('/how-it-works');
    await expect(page).toHaveTitle(/How It Works/);
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy/);
  });

  test('should navigate to terms page', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle(/Terms/);
  });

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveTitle(/PhotoCalia/);
  });
});

test.describe('Converter', () => {
  test('should require sign-in before uploading a file', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /AI Calendar Converter/i })).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });

  test('should explain the free allowance before sign-in', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-subtitle')).toContainText(/3 free conversions per month/i);
  });
});
