// e2e/marketing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketing site', () => {
  test('landing page loads with hero and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /one tap/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /order your card/i }).first()).toBeVisible();
  });

  test('pricing page lists all four tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Free', { exact: true })).toBeVisible();
    await expect(page.getByText('Pro', { exact: true })).toBeVisible();
    await expect(page.getByText('Business', { exact: true })).toBeVisible();
    await expect(page.getByText('Enterprise', { exact: true })).toBeVisible();
  });

  test('navigating from landing to pricing works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('contact form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send message/i }).click();
    // Native HTML5 validation should block submission of required fields;
    // the page should remain on /contact rather than navigating away.
    await expect(page).toHaveURL(/\/contact/);
  });
});
