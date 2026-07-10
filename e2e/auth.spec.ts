// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders the email step first', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /log in or sign up/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test('submitting a valid email advances to the code step', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('e2e-test@example.com');
    await page.getByRole('button', { name: /send code/i }).click();

    await expect(page.getByRole('heading', { name: /enter your code/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('accessing the dashboard while logged out redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing admin while logged out redirects to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
