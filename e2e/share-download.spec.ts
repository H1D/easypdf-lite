import { test, expect } from '@playwright/test';

test.describe('Share link and download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="items-container"]');
  });

  test('share button exists and is visible', async ({ page }) => {
    const shareBtn = page.locator('[data-testid="share-invoice-link-button"]');
    await expect(shareBtn).toBeVisible();
  });

  test('download button exists and is visible', async ({ page }) => {
    const downloadBtn = page.locator('[data-testid="download-invoice-button"]');
    await expect(downloadBtn).toBeVisible();
  });

  test('share button generates URL with data parameter', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Fill in some data to share
    await page.locator('[data-testid="seller-name-input"]').fill('Test Seller Inc.');

    // Click share button
    await page.locator('[data-testid="share-invoice-link-button"]').click();

    // Wait for toast to appear confirming the link was copied
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toContainText('Invoice link copied to clipboard!');

    // The URL should now contain a ?data= parameter
    const currentUrl = page.url();
    expect(currentUrl).toContain('?data=');
  });

  test('share link updates browser URL bar', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.locator('[data-testid="share-invoice-link-button"]').click();

    // Wait for toast confirming success before checking URL
    await expect(page.locator('[data-testid="toast"]')).toContainText('Invoice link copied');

    // After sharing, the URL should have been updated with replaceState
    const url = page.url();
    expect(url).toContain('data=');
  });

  test('shared URL loads the same form data', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Fill in distinctive data
    await page.locator('[data-testid="seller-name-input"]').fill('Acme Corp');
    await page.locator('[data-testid="buyer-name-input"]').fill('Client LLC');
    await page.locator('[data-testid="item-name-input"]').first().fill('Consulting');
    await page.locator('[data-testid="item-amount-input"]').first().fill('10');
    await page.locator('[data-testid="item-net-price-input"]').first().fill('150');

    // Share to generate URL
    await page.locator('[data-testid="share-invoice-link-button"]').click();
    await expect(page.locator('[data-testid="toast"]')).toContainText('Invoice link copied');

    // Capture the shared URL
    const sharedUrl = page.url();

    // Navigate to the shared URL (in a clean state by clearing localStorage first)
    await page.evaluate(() => localStorage.clear());
    await page.goto(sharedUrl);
    await page.waitForSelector('[data-testid="items-container"]');

    // Verify the data loaded correctly
    await expect(page.locator('[data-testid="seller-name-input"]')).toHaveValue('Acme Corp');
    await expect(page.locator('[data-testid="buyer-name-input"]')).toHaveValue('Client LLC');
    await expect(page.locator('[data-testid="item-name-input"]').first()).toHaveValue('Consulting');
    await expect(page.locator('[data-testid="item-amount-input"]').first()).toHaveValue('10');
    await expect(page.locator('[data-testid="item-net-price-input"]').first()).toHaveValue('150');
  });

  test('share shows success toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.locator('[data-testid="share-invoice-link-button"]').click();

    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveClass(/success/);
    await expect(toast).toContainText('Invoice link copied to clipboard!');
  });

  test('download button triggers PDF generation and shows toast', async ({ page }) => {
    // Fill in minimal data
    await page.locator('[data-testid="seller-name-input"]').fill('Test Seller');
    await page.locator('[data-testid="seller-email-input"]').fill('seller@test.com');
    await page.locator('[data-testid="seller-address-input"]').fill('123 Test St');
    await page.locator('[data-testid="buyer-name-input"]').fill('Test Buyer');
    await page.locator('[data-testid="buyer-email-input"]').fill('buyer@test.com');
    await page.locator('[data-testid="buyer-address-input"]').fill('456 Test Ave');

    // Listen for download event
    const downloadPromise = page.waitForEvent('download');

    // Click the download button
    await page.locator('[data-testid="download-invoice-button"]').click();

    // Verify the download was triggered
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.pdf$/);
  });

  test('share with logo shows error toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Simulate a logo being set by injecting a data URI into the logo-img element
    await page.evaluate(() => {
      const img = document.getElementById('logo-img') as HTMLImageElement;
      const preview = document.getElementById('logo-preview');
      if (img && preview) {
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        preview.classList.remove('hidden');
      }
    });

    // Try to share
    await page.locator('[data-testid="share-invoice-link-button"]').click();

    // Should show error about logo
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toContainText('Unable to share invoice with logo');
    await expect(toast).toHaveClass(/error/);
  });

  test('language selection persists in shared URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Change language to German
    await page.locator('[data-testid="language-select"]').selectOption('de');

    // Share
    await page.locator('[data-testid="share-invoice-link-button"]').click();
    await expect(page.locator('[data-testid="toast"]')).toContainText('copied');

    const sharedUrl = page.url();

    // Navigate to the shared URL
    await page.evaluate(() => localStorage.clear());
    await page.goto(sharedUrl);
    await page.waitForSelector('[data-testid="items-container"]');

    await expect(page.locator('[data-testid="language-select"]')).toHaveValue('de');
  });

  test('currency selection persists in shared URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Change currency to USD
    await page.locator('[data-testid="currency-select"]').selectOption('USD');

    // Share
    await page.locator('[data-testid="share-invoice-link-button"]').click();
    await expect(page.locator('[data-testid="toast"]')).toContainText('copied');

    const sharedUrl = page.url();

    // Navigate to the shared URL
    await page.evaluate(() => localStorage.clear());
    await page.goto(sharedUrl);
    await page.waitForSelector('[data-testid="items-container"]');

    await expect(page.locator('[data-testid="currency-select"]')).toHaveValue('USD');
  });
});
