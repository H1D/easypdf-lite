declare const LZString: { compressToEncodedURIComponent(input: string): string; decompressFromEncodedURIComponent(input: string): string | null; };
import type { InvoiceData } from "../../src/types";

/**
 * Key compression map for URL sharing — identical to the original easy-invoice-pdf
 * for full backwards compatibility with shared URLs.
 */
export const INVOICE_KEY_COMPRESSION_MAP: Record<string, string> = {
  language: "a", dateFormat: "b", currency: "c", template: "d", logo: "e",
  invoiceNumberObject: "f", dateOfIssue: "g", dateOfService: "h", invoiceType: "i",
  invoiceTypeFieldIsVisible: "j", seller: "k", buyer: "l", items: "m", total: "n",
  vatTableSummaryIsVisible: "o", paymentMethod: "p", paymentMethodFieldIsVisible: "q",
  paymentDue: "r", stripePayOnlineUrl: "s", notes: "t", notesFieldIsVisible: "u",
  personAuthorizedToReceiveFieldIsVisible: "v", personAuthorizedToIssueFieldIsVisible: "w",
  taxLabelText: "1",
  label: "x", value: "y",
  id: "z", name: "A", address: "B", vatNo: "C", vatNoFieldIsVisible: "D",
  email: "E", accountNumber: "F", accountNumberFieldIsVisible: "G",
  swiftBic: "H", swiftBicFieldIsVisible: "I", vatNoLabelText: "2",
  invoiceItemNumberIsVisible: "J", nameFieldIsVisible: "K", typeOfGTU: "L",
  typeOfGTUFieldIsVisible: "M", amount: "N", amountFieldIsVisible: "O",
  unit: "P", unitFieldIsVisible: "Q", netPrice: "R", netPriceFieldIsVisible: "S",
  vat: "T", vatFieldIsVisible: "U", netAmount: "V", netAmountFieldIsVisible: "W",
  vatAmount: "X", vatAmountFieldIsVisible: "Y", preTaxAmount: "Z",
  preTaxAmountFieldIsVisible: "0",
  itemNotes: "3", itemNotesFieldIsVisible: "4",
  customColumns: "5", header: "6", visible: "7", customFields: "8",
};

/** Reverse map: compressed short key -> original key. Auto-generated from INVOICE_KEY_COMPRESSION_MAP. */
export const REVERSE_KEY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(INVOICE_KEY_COMPRESSION_MAP).map(([original, short]) => [short, original]),
);

/**
 * Recursively remap object keys using the compression map.
 * Arrays are traversed element-by-element; primitives pass through unchanged.
 */
export function compressKeys(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(compressKeys);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const mappedKey = INVOICE_KEY_COMPRESSION_MAP[key] ?? key;
    result[mappedKey] = compressKeys(value);
  }
  return result;
}

/**
 * Recursively restore original keys from compressed keys using the reverse map.
 * Arrays are traversed element-by-element; primitives pass through unchanged.
 */
export function restoreKeys(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(restoreKeys);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const originalKey = REVERSE_KEY_MAP[key] ?? key;
    result[originalKey] = restoreKeys(value);
  }
  return result;
}

/**
 * Generate a shareable URL from invoice data.
 *
 * Steps:
 * 1. Compress object keys using the compression map.
 * 2. JSON.stringify the compressed object.
 * 3. Compress the JSON string with lz-string's compressToEncodedURIComponent.
 * 4. Return the current page URL with a ?data= query parameter.
 */
export function generateShareUrl(data: InvoiceData): string {
  const compressed = compressKeys(data);
  const json = JSON.stringify(compressed);
  const encoded = LZString.compressToEncodedURIComponent(json);

  const url = new URL(window.location.href);
  url.searchParams.set("data", encoded);
  return url.toString();
}

/**
 * Load invoice data from the current page URL's ?data= parameter.
 *
 * Steps:
 * 1. Read the ?data= query parameter from the current URL.
 * 2. Decompress with lz-string's decompressFromEncodedURIComponent.
 * 3. JSON.parse the result.
 * 4. Restore original keys using the reverse map.
 *
 * Returns null if no ?data= param is present or if decompression/parsing fails.
 */
export function loadFromUrl(): InvoiceData | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get("data");
  if (!encoded) return null;

  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const compressed = JSON.parse(json);
    return restoreKeys(compressed) as InvoiceData;
  } catch {
    return null;
  }
}
