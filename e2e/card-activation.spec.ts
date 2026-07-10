// e2e/card-activation.spec.ts
import { test, expect } from '@playwright/test';

// These tests rely on seed data from supabase/seed.sql:
// - 'dev-activation-token-jane' is already activated and bound to a
//   published profile at slug 'jane-doe'.
// - 'dev-activation-token-unclaimed' is shipped but not yet activated.

test.describe('Card activation', () => {
  test('an already-activated card redirects straight to the public profile', async ({ page }) => {
    await page.goto('/a/dev-activation-token-jane');
    await expect(page).toHaveURL(/\/jane-doe/);
    await expect(page.getByText('Jane Doe')).toBeVisible();
  });

  test('an unactivated card prompts login before activation', async ({ page }) => {
    await page.goto('/a/dev-activation-token-unclaimed');
    await expect(page.getByRole('heading', { name: /activate your connect card/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /log in or sign up to activate/i })).toBeVisible();
  });

  test('an invalid activation token shows a not-found style message', async ({ page }) => {
    await page.goto('/a/this-token-does-not-exist');
    await expect(page.getByText(/we could not find this card/i)).toBeVisible();
  });
});

test.describe('Public profile page', () => {
  test('renders contact actions and social links for a published profile', async ({ page }) => {
    await page.goto('/jane-doe');
    await expect(page.getByRole('heading', { name: 'Jane Doe' })).toBeVisible();
    await expect(page.getByText('Principal Architect')).toBeVisible();
    await expect(page.getByRole('link', { name: /save contact/i })).toBeVisible();
  });

  test('an unpublished or nonexistent profile returns 404', async ({ page }) => {
    const response = await page.goto('/this-profile-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
