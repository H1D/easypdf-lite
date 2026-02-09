import { test, expect } from '@playwright/test';

test.describe('Content Security Policy', () => {
  test('server returns strict CSP header', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const headers = response!.headers();
    const csp = headers['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("frame-src blob:");
    expect(csp).toContain("object-src blob:");
    expect(csp).toContain("form-action 'none'");
  });

  test('server returns additional security headers', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const headers = response!.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
  });

  test('page loads without CSP violations', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Content-Security-Policy') || msg.text().includes('CSP')) {
        violations.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      violations.push(err.message);
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="items-container"]');

    // Give time for any async CSP violations
    await page.waitForTimeout(500);
    expect(violations).toHaveLength(0);
  });

  test('no inline styles in served HTML', async ({ request }) => {
    const res = await request.get('/');
    const html = await res.text();
    // Only check body content, not SVG attributes
    const bodyMatch = html.match(/<body[\s\S]*<\/body>/);
    const body = bodyMatch?.[0] || '';
    // Should not have style= attributes (except in SVG which use presentation attributes)
    const inlineStyles = body.match(/ style="/g);
    expect(inlineStyles).toBeNull();
  });
});
