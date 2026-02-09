import { test, expect } from '@playwright/test';

test.describe('VAT calculations and totals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="items-container"]');
  });

  test('single item: netAmount = amount * netPrice', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('3');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');

    await expect(page.locator('[data-testid="item-net-amount"]').first()).toHaveText('300.00');
  });

  test('single item: vatAmount = netAmount * vat / 100', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('2');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');
    // VAT defaults to 23%

    // netAmount = 2 * 100 = 200
    // vatAmount = 200 * 23 / 100 = 46
    await expect(page.locator('[data-testid="item-vat-amount"]').first()).toHaveText('46.00');
  });

  test('single item: preTaxAmount = netAmount + vatAmount', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('2');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');

    // netAmount = 200, vatAmount = 46, preTaxAmount = 246
    await expect(page.locator('[data-testid="item-pre-tax-amount"]').first()).toHaveText('246.00');
  });

  test('total updates when item values change', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('5');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('200');

    // netAmount = 1000, vatAmount = 1000 * 23/100 = 230, preTaxAmount = 1230
    await expect(page.locator('#total-display')).toHaveText('1 230.00');
  });

  test('changing VAT percentage recalculates correctly', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('1');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');
    await page.locator('[data-testid="item-vat-input"]').first().fill('10');

    // netAmount = 100, vatAmount = 100 * 10/100 = 10, preTaxAmount = 110
    await expect(page.locator('[data-testid="item-net-amount"]').first()).toHaveText('100.00');
    await expect(page.locator('[data-testid="item-vat-amount"]').first()).toHaveText('10.00');
    await expect(page.locator('[data-testid="item-pre-tax-amount"]').first()).toHaveText('110.00');
    await expect(page.locator('#total-display')).toHaveText('110.00');
  });

  test('zero VAT results in vatAmount of 0', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('1');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('50');
    await page.locator('[data-testid="item-vat-input"]').first().fill('0');

    await expect(page.locator('[data-testid="item-vat-amount"]').first()).toHaveText('0.00');
    await expect(page.locator('[data-testid="item-pre-tax-amount"]').first()).toHaveText('50.00');
  });

  test('non-numeric VAT (e.g. "zw") results in vatAmount of 0', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('2');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');
    await page.locator('[data-testid="item-vat-input"]').first().fill('zw');

    // non-numeric VAT treated as 0
    await expect(page.locator('[data-testid="item-vat-amount"]').first()).toHaveText('0.00');
    await expect(page.locator('[data-testid="item-pre-tax-amount"]').first()).toHaveText('200.00');
  });

  test('multiple items: total sums all preTaxAmounts', async ({ page }) => {
    // First item: amount=2, netPrice=100, vat=23 => preTax=246
    await page.locator('[data-testid="item-amount-input"]').first().fill('2');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');

    // Add second item
    await page.locator('[data-testid="add-item-button"]').click();

    // Second item: amount=1, netPrice=50, vat=23 => preTax=61.50
    await page.locator('[data-testid="item-amount-input"]').nth(1).fill('1');
    await page.locator('[data-testid="item-net-price-input"]').nth(1).fill('50');

    // Total = 246 + 61.50 = 307.50
    await expect(page.locator('#total-display')).toHaveText('307.50');
  });

  test('removing an item updates the total', async ({ page }) => {
    // Setup first item
    await page.locator('[data-testid="item-amount-input"]').first().fill('1');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('100');

    // Add second item with different value
    await page.locator('[data-testid="add-item-button"]').click();
    await page.locator('[data-testid="item-amount-input"]').nth(1).fill('1');
    await page.locator('[data-testid="item-net-price-input"]').nth(1).fill('200');

    // Total should be (100*1.23) + (200*1.23) = 123 + 246 = 369
    await expect(page.locator('#total-display')).toHaveText('369.00');

    // Remove second item
    await page.locator('[data-testid="remove-item-button"]').nth(1).click();

    // Total should now be just 123
    await expect(page.locator('#total-display')).toHaveText('123.00');
  });

  test('decimal amounts and prices are handled', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('1.5');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('33.33');
    await page.locator('[data-testid="item-vat-input"]').first().fill('0');

    // netAmount = 1.5 * 33.33 = 49.995 (formatted as 50.00 due to rounding in formatNumber)
    await expect(page.locator('[data-testid="item-net-amount"]').first()).toHaveText('50.00');
  });

  test('total currency label updates when currency changes', async ({ page }) => {
    await expect(page.locator('#total-currency')).toHaveText('EUR');

    await page.locator('[data-testid="currency-select"]').selectOption('USD');

    // Need to trigger recalculation by changing an item value
    await page.locator('[data-testid="item-net-price-input"]').first().fill('1');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('0');

    await expect(page.locator('#total-currency')).toHaveText('USD');
  });

  test('large numbers are formatted with space separators', async ({ page }) => {
    await page.locator('[data-testid="item-amount-input"]').first().fill('100');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('1000');
    await page.locator('[data-testid="item-vat-input"]').first().fill('0');

    // 100 * 1000 = 100000 => formatted as "100 000.00"
    await expect(page.locator('[data-testid="item-net-amount"]').first()).toHaveText('100 000.00');
    await expect(page.locator('#total-display')).toHaveText('100 000.00');
  });
});
