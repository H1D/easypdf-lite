import { describe, test, expect } from 'bun:test';
import { INVOICE_PDF_TRANSLATIONS } from '../public/js/i18n';
import type { TranslationSet } from '../public/js/i18n';

const ALL_LANGUAGES = Object.keys(INVOICE_PDF_TRANSLATIONS);

/** All function-valued translation keys that should respect customTaxLabel. */
function getTaxLabelFields(t: TranslationSet) {
  return {
    'invoiceItemsTable.vat': t.invoiceItemsTable.vat,
    'invoiceItemsTable.netPrice': t.invoiceItemsTable.netPrice,
    'invoiceItemsTable.vatAmount': t.invoiceItemsTable.vatAmount,
    'invoiceItemsTable.netAmount': t.invoiceItemsTable.netAmount,
    'invoiceItemsTable.preTaxAmount': t.invoiceItemsTable.preTaxAmount,
    'vatSummaryTable.vatRate': t.vatSummaryTable.vatRate,
    'vatSummaryTable.vat': t.vatSummaryTable.vat,
    'vatSummaryTable.net': t.vatSummaryTable.net,
    'vatSummaryTable.preTax': t.vatSummaryTable.preTax,
  };
}

describe('Tax label applies to all fields in all languages', () => {
  for (const lang of ALL_LANGUAGES) {
    const t = INVOICE_PDF_TRANSLATIONS[lang];
    const fields = getTaxLabelFields(t);

    describe(`[${lang}]`, () => {
      for (const [name, fn] of Object.entries(fields)) {
        test(`${name} is a function`, () => {
          expect(typeof fn).toBe('function');
        });
      }
    });
  }
});

describe('Custom tax label "GST" is used in output', () => {
  const customLabel = 'GST';

  for (const lang of ALL_LANGUAGES) {
    const t = INVOICE_PDF_TRANSLATIONS[lang];

    test(`[${lang}] invoiceItemsTable.vat returns "GST"`, () => {
      expect(t.invoiceItemsTable.vat({ customTaxLabel: customLabel })).toBe('GST');
    });

    test(`[${lang}] vatSummaryTable.vat returns "GST"`, () => {
      expect(t.vatSummaryTable.vat({ customTaxLabel: customLabel })).toBe('GST');
    });

    test(`[${lang}] vatSummaryTable.vatRate contains "GST"`, () => {
      expect(t.vatSummaryTable.vatRate({ customTaxLabel: customLabel })).toContain('GST');
    });

    test(`[${lang}] invoiceItemsTable.vatAmount contains "GST"`, () => {
      expect(t.invoiceItemsTable.vatAmount({ customTaxLabel: customLabel })).toContain('GST');
    });
  }
});

describe('Default fallback when customTaxLabel is empty', () => {
  for (const lang of ALL_LANGUAGES) {
    const t = INVOICE_PDF_TRANSLATIONS[lang];

    test(`[${lang}] invoiceItemsTable.vat falls back to language default`, () => {
      const result = t.invoiceItemsTable.vat({ customTaxLabel: '' });
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('');
    });

    test(`[${lang}] vatSummaryTable.vat falls back to language default`, () => {
      const result = t.vatSummaryTable.vat({ customTaxLabel: '' });
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('');
    });
  }
});
