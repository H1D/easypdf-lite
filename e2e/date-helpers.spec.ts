import { test, expect } from '@playwright/test';

test.describe('Date helper buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="items-container"]');
  });

  test('"Set to today" button sets date of issue to today', async ({ page }) => {
    // Clear the date first to ensure the button actually works
    await page.locator('[data-testid="date-of-issue-input"]').fill('2020-01-01');

    await page.locator('[data-testid="set-today-issue"]').click();

    const value = await page.locator('[data-testid="date-of-issue-input"]').inputValue();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(value).toBe(todayStr);
  });

  test('"Set to month end" button sets date of service to end of current month', async ({ page }) => {
    // Clear the date first
    await page.locator('[data-testid="date-of-service-input"]').fill('2020-01-01');

    await page.locator('[data-testid="set-month-end-service"]').click();

    const value = await page.locator('[data-testid="date-of-service-input"]').inputValue();
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const expectedStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    expect(value).toBe(expectedStr);
  });

  test('"+14 days from issue" button sets payment due correctly', async ({ page }) => {
    // Set a known issue date
    await page.locator('[data-testid="date-of-issue-input"]').fill('2026-01-15');

    await page.locator('[data-testid="set-14-days"]').click();

    const value = await page.locator('[data-testid="payment-due-input"]').inputValue();
    // 2026-01-15 + 14 days = 2026-01-29
    expect(value).toBe('2026-01-29');
  });

  test('"+14 days" uses today when issue date is empty', async ({ page }) => {
    // Clear the issue date
    await page.locator('[data-testid="date-of-issue-input"]').fill('');

    await page.locator('[data-testid="set-14-days"]').click();

    const value = await page.locator('[data-testid="payment-due-input"]').inputValue();

    // When issue date is empty, it uses today() + 14 days
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(expected.getDate() + 14);
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`;
    expect(value).toBe(expectedStr);
  });

  test('"+14 days" crossing month boundary works', async ({ page }) => {
    // Set issue date near end of month
    await page.locator('[data-testid="date-of-issue-input"]').fill('2026-02-20');

    await page.locator('[data-testid="set-14-days"]').click();

    const value = await page.locator('[data-testid="payment-due-input"]').inputValue();
    // 2026-02-20 + 14 days = 2026-03-06
    expect(value).toBe('2026-03-06');
  });

  test('date warning appears when date of issue is in the past', async ({ page }) => {
    const warning = page.locator('[data-testid="date-warning"]');

    // Set issue date to the past
    await page.locator('[data-testid="date-of-issue-input"]').fill('2020-01-01');
    await page.locator('[data-testid="date-of-issue-input"]').dispatchEvent('change');

    await expect(warning).not.toHaveClass(/hidden/);
  });

  test('date warning is hidden when date of issue is today', async ({ page }) => {
    const warning = page.locator('[data-testid="date-warning"]');

    // Set to today using the helper button (guarantees today's date)
    await page.locator('[data-testid="set-today-issue"]').click();
    // Trigger change event explicitly for date check
    await page.locator('[data-testid="date-of-issue-input"]').dispatchEvent('change');

    await expect(warning).toHaveClass(/hidden/);
  });

  test('"Update all dates" button sets all three dates', async ({ page }) => {
    // Set all dates to old values
    await page.locator('[data-testid="date-of-issue-input"]').fill('2020-01-01');
    await page.locator('[data-testid="date-of-service-input"]').fill('2020-01-31');
    await page.locator('[data-testid="payment-due-input"]').fill('2020-02-14');
    await page.locator('[data-testid="date-of-issue-input"]').dispatchEvent('change');

    // The warning should now be visible
    const warning = page.locator('[data-testid="date-warning"]');
    await expect(warning).not.toHaveClass(/hidden/);

    // Click "Update all dates"
    await page.locator('[data-testid="update-all-dates-button"]').click();

    // Issue date should be today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const issueVal = await page.locator('[data-testid="date-of-issue-input"]').inputValue();
    expect(issueVal).toBe(todayStr);

    // Service date should be end of current month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfMonthStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    const serviceVal = await page.locator('[data-testid="date-of-service-input"]').inputValue();
    expect(serviceVal).toBe(endOfMonthStr);

    // Payment due should be today + 14 days
    const due = new Date(now);
    due.setDate(due.getDate() + 14);
    const dueStr = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
    const dueVal = await page.locator('[data-testid="payment-due-input"]').inputValue();
    expect(dueVal).toBe(dueStr);

    // Warning should be hidden
    await expect(warning).toHaveClass(/hidden/);
  });
});
