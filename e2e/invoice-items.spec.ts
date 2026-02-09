import { test, expect } from '@playwright/test';

test.describe('Invoice item remove/reset button', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so we get fresh defaults
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="items-container"]');
  });

  test('single item shows reset icon (↻) instead of remove (×)', async ({ page }) => {
    const btn = page.locator('[data-testid="remove-item-button"]').first();
    await expect(btn).toHaveAttribute('title', 'Reset item');
    await expect(btn).toHaveText('↻');
  });

  test('clicking reset on single item clears fields to defaults', async ({ page }) => {
    // Fill in some values first
    const nameInput = page.locator('[data-testid="item-name-input"]').first();
    const amountInput = page.locator('[data-testid="item-amount-input"]').first();
    const netPriceInput = page.locator('[data-testid="item-net-price-input"]').first();

    await nameInput.fill('Test Service');
    await amountInput.fill('5');
    await netPriceInput.fill('100');

    // Click reset
    await page.locator('[data-testid="remove-item-button"]').first().click();

    // Fields should be reset to defaults
    await expect(nameInput).toHaveValue('');
    await expect(amountInput).toHaveValue('1');
    await expect(netPriceInput).toHaveValue('0');
    await expect(page.locator('[data-testid="item-unit-input"]').first()).toHaveValue('pcs');
    await expect(page.locator('[data-testid="item-vat-input"]').first()).toHaveValue('23');
  });

  test('single item is never removed from the DOM', async ({ page }) => {
    await page.locator('[data-testid="remove-item-button"]').first().click();

    // Item should still exist
    const items = page.locator('[data-testid="invoice-item"]');
    await expect(items).toHaveCount(1);
  });

  test('computed values reset to zero after reset', async ({ page }) => {
    // Set values to generate non-zero computed fields
    await page.locator('[data-testid="item-amount-input"]').first().fill('2');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');

    // Wait for computation
    await expect(page.locator('[data-testid="item-net-amount"]').first()).not.toHaveText('0.00');

    // Reset
    await page.locator('[data-testid="remove-item-button"]').first().click();

    // Computed values should be zero
    await expect(page.locator('[data-testid="item-net-amount"]').first()).toHaveText('0.00');
    await expect(page.locator('[data-testid="item-vat-amount"]').first()).toHaveText('0.00');
    await expect(page.locator('[data-testid="item-pre-tax-amount"]').first()).toHaveText('0.00');
  });

  test('with multiple items, buttons show remove (×)', async ({ page }) => {
    // Add a second item
    await page.locator('[data-testid="add-item-button"]').click();

    const buttons = page.locator('[data-testid="remove-item-button"]');
    await expect(buttons).toHaveCount(2);

    for (const btn of await buttons.all()) {
      await expect(btn).toHaveAttribute('title', 'Remove item');
      await expect(btn).toHaveText('×');
    }
  });

  test('removing second item switches remaining button back to reset', async ({ page }) => {
    // Add a second item
    await page.locator('[data-testid="add-item-button"]').click();
    await expect(page.locator('[data-testid="invoice-item"]')).toHaveCount(2);

    // Remove the second item
    await page.locator('[data-testid="remove-item-button"]').nth(1).click();

    // Should be back to one item with reset button
    await expect(page.locator('[data-testid="invoice-item"]')).toHaveCount(1);
    const btn = page.locator('[data-testid="remove-item-button"]').first();
    await expect(btn).toHaveAttribute('title', 'Reset item');
    await expect(btn).toHaveText('↻');
  });
});
