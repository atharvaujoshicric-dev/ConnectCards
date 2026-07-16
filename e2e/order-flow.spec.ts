// e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Card ordering', () => {
  test('order page shows live pricing that updates with quantity', async ({ page }) => {
    await page.goto('/order');

    const quantityInput = page.getByLabel('Quantity');
    await quantityInput.fill('5');
    await expect(page.getByText('₹1,500 each')).toBeVisible();

    await quantityInput.fill('25');
    await expect(page.getByText('₹1,300 each')).toBeVisible();
  });

  test('selecting a card color updates the summary', async ({ page }) => {
    await page.goto('/order');
    await page.getByRole('button', { name: 'Gold' }).click();
    await expect(page.getByText(/Gold/).first()).toBeVisible();
  });

  test('submitting the order form without an account redirects to login', async ({ page }) => {
    await page.goto('/order');

    await page.getByLabel('Full name').fill('E2E Test User');
    await page.getByLabel('Phone').fill('+919876543210');
    await page.getByLabel('Address line 1').fill('123 Test Street');
    await page.getByLabel('City').fill('Pune');
    await page.getByLabel('State').fill('Maharashtra');
    await page.getByLabel('Postal code').fill('411001');

    await page.getByRole('button', { name: /continue to payment/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
