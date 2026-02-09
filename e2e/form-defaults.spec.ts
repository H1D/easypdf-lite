import { test, expect } from '@playwright/test';

test.describe('Form loads with correct defaults', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="items-container"]');
  });

  test('language select defaults to English', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-select"]');
    await expect(langSelect).toHaveValue('en');
  });

  test('language select has all 10 supported languages', async ({ page }) => {
    const options = page.locator('[data-testid="language-select"] option');
    await expect(options).toHaveCount(10);

    const expectedLanguages = ['en', 'pl', 'de', 'es', 'pt', 'ru', 'uk', 'fr', 'it', 'nl'];
    for (const lang of expectedLanguages) {
      await expect(page.locator(`[data-testid="language-select"] option[value="${lang}"]`)).toBeAttached();
    }
  });

  test('currency dropdown is populated with options', async ({ page }) => {
    const currencySelect = page.locator('[data-testid="currency-select"]');
    await expect(currencySelect).toHaveValue('EUR');

    const optionCount = await page.locator('[data-testid="currency-select"] option').count();
    // SUPPORTED_CURRENCIES has 62 entries
    expect(optionCount).toBeGreaterThanOrEqual(50);
  });

  test('currency options contain code, symbol, and label', async ({ page }) => {
    // Check that the first option (EUR) has the expected format
    const firstOption = page.locator('[data-testid="currency-select"] option').first();
    const text = await firstOption.textContent();
    expect(text).toContain('EUR');
    expect(text).toContain('\u20AC'); // Euro symbol
    expect(text).toContain('Euro');
  });

  test('date format select defaults to YYYY-MM-DD', async ({ page }) => {
    const dateFormatSelect = page.locator('[data-testid="date-format-select"]');
    await expect(dateFormatSelect).toHaveValue('YYYY-MM-DD');
  });

  test('date format select has all 8 supported formats', async ({ page }) => {
    const options = page.locator('[data-testid="date-format-select"] option');
    await expect(options).toHaveCount(8);
  });

  test('tax label defaults to VAT', async ({ page }) => {
    const taxLabel = page.locator('[data-testid="tax-label-input"]');
    await expect(taxLabel).toHaveValue('VAT');
  });

  test('invoice number label defaults to Invoice', async ({ page }) => {
    const invoiceLabel = page.locator('[data-testid="invoice-number-label-input"]');
    await expect(invoiceLabel).toHaveValue('Invoice');
  });

  test('invoice number value defaults to 1/2024', async ({ page }) => {
    const invoiceValue = page.locator('[data-testid="invoice-number-value-input"]');
    await expect(invoiceValue).toHaveValue('1/2024');
  });

  test('dates are pre-populated with valid YYYY-MM-DD values', async ({ page }) => {
    const dateOfIssue = page.locator('[data-testid="date-of-issue-input"]');
    const dateOfService = page.locator('[data-testid="date-of-service-input"]');
    const paymentDue = page.locator('[data-testid="payment-due-input"]');

    const issueVal = await dateOfIssue.inputValue();
    const serviceVal = await dateOfService.inputValue();
    const dueVal = await paymentDue.inputValue();

    // All dates should match YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(issueVal).toMatch(dateRegex);
    expect(serviceVal).toMatch(dateRegex);
    expect(dueVal).toMatch(dateRegex);
  });

  test('date of issue is set to today', async ({ page }) => {
    const dateOfIssue = page.locator('[data-testid="date-of-issue-input"]');
    const issueVal = await dateOfIssue.inputValue();

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(issueVal).toBe(todayStr);
  });

  test('payment due is 14 days after date of issue', async ({ page }) => {
    const dateOfIssue = page.locator('[data-testid="date-of-issue-input"]');
    const paymentDue = page.locator('[data-testid="payment-due-input"]');

    const issueVal = await dateOfIssue.inputValue();
    const dueVal = await paymentDue.inputValue();

    const issueDate = new Date(issueVal + 'T00:00:00');
    const dueDate = new Date(dueVal + 'T00:00:00');
    const diffDays = Math.round((dueDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(14);
  });

  test('payment method defaults to Bank Transfer', async ({ page }) => {
    const paymentMethod = page.locator('[data-testid="payment-method-input"]');
    await expect(paymentMethod).toHaveValue('Bank Transfer');
  });

  test('one default invoice item exists', async ({ page }) => {
    const items = page.locator('[data-testid="invoice-item"]');
    await expect(items).toHaveCount(1);
  });

  test('default item has correct initial values', async ({ page }) => {
    await expect(page.locator('[data-testid="item-amount-input"]').first()).toHaveValue('1');
    await expect(page.locator('[data-testid="item-unit-input"]').first()).toHaveValue('pcs');
    await expect(page.locator('[data-testid="item-net-price-input"]').first()).toHaveValue('0');
    await expect(page.locator('[data-testid="item-vat-input"]').first()).toHaveValue('23');
    await expect(page.locator('[data-testid="item-name-input"]').first()).toHaveValue('');
  });

  test('total displays 0.00 EUR by default', async ({ page }) => {
    const totalDisplay = page.locator('#total-display');
    const totalCurrency = page.locator('#total-currency');
    await expect(totalDisplay).toHaveText('0.00');
    await expect(totalCurrency).toHaveText('EUR');
  });

  test('all four accordion sections are open by default', async ({ page }) => {
    const generalAccordion = page.locator('[data-testid="accordion-general"]');
    const sellerAccordion = page.locator('[data-testid="accordion-seller"]');
    const buyerAccordion = page.locator('[data-testid="accordion-buyer"]');
    const itemsAccordion = page.locator('[data-testid="accordion-invoiceItems"]');

    await expect(generalAccordion).toHaveAttribute('open', '');
    await expect(sellerAccordion).toHaveAttribute('open', '');
    await expect(buyerAccordion).toHaveAttribute('open', '');
    await expect(itemsAccordion).toHaveAttribute('open', '');
  });

  test('logo preview is hidden by default', async ({ page }) => {
    const logoPreview = page.locator('[data-testid="logo-preview"]');
    await expect(logoPreview).toHaveClass(/hidden/);
  });

  test('seller and buyer profile selects show default placeholder', async ({ page }) => {
    const sellerSelect = page.locator('[data-testid="seller-profile-select"]');
    const buyerSelect = page.locator('[data-testid="buyer-profile-select"]');

    await expect(sellerSelect).toHaveValue('');
    await expect(buyerSelect).toHaveValue('');
  });

  test('delete seller/buyer buttons are hidden initially', async ({ page }) => {
    const deleteSeller = page.locator('[data-testid="delete-seller-button"]');
    const deleteBuyer = page.locator('[data-testid="delete-buyer-button"]');

    await expect(deleteSeller).toHaveClass(/hidden/);
    await expect(deleteBuyer).toHaveClass(/hidden/);
  });
});
