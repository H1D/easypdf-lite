import { INVOICE_PDF_TRANSLATIONS } from './i18n';
import type { TranslationSet as TranslationStrings } from './i18n';
import { formatNumber, formatDate, formatCurrency } from './utils';
import type { InvoiceData, InvoiceItem } from '../../src/types';

// jsPDF and jspdf-autotable are loaded as UMD globals via script tags
declare const jspdf: { jsPDF: any };
// Font base64 data loaded via script tags
declare const openSansRegularFont: string;
declare const openSansBoldFont: string;

// Module-level variable to track the previous preview URL for cleanup
let previousPreviewUrl: string | null = null;

/** Register Open Sans (Regular + Bold) with a jsPDF instance. */
function registerFonts(doc: any): void {
  doc.addFileToVFS('OpenSans-Regular.ttf', openSansRegularFont);
  doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
  doc.addFileToVFS('OpenSans-Bold.ttf', openSansBoldFont);
  doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
  doc.setFont('OpenSans', 'normal');
}

// A4 dimensions in points
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 30;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Colors
const BLACK = '#000000';
const DARK_GRAY = '#333333';
const MEDIUM_GRAY = '#666666';
const LIGHT_GRAY = '#e0e0e0';
const TABLE_HEADER_BG = '#f5f5f5';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format VAT value for display.
 * Numeric values get a "%" suffix, string values (like "NP") are shown as-is.
 */
function formatVatValue(vat: number | string): string {
  if (typeof vat === 'number') {
    return `${vat}%`;
  }
  return String(vat);
}

/**
 * Check if we need a new page and add one if so.
 * Returns the updated Y position.
 */
function checkPageBreak(doc: any, y: number, requiredSpace: number): number {
  if (y + requiredSpace > PAGE_HEIGHT - MARGIN - 40) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/**
 * Draw a horizontal line across the content area.
 */
function drawHLine(doc: any, y: number, color: string = LIGHT_GRAY): void {
  doc.setDrawColor(color);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section renderers
// ─────────────────────────────────────────────────────────────────────────────

function drawHeader(
  doc: any,
  data: InvoiceData,
  t: TranslationStrings,
  startY: number
): number {
  let y = startY;

  // Logo — top left, scaled to fit within 140x45pt while preserving aspect ratio
  if (data.logo) {
    try {
      const format = data.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      const maxW = 140;
      const maxH = 45;
      const imgProps = doc.getImageProperties(data.logo);
      const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
      const w = imgProps.width * ratio;
      const h = imgProps.height * ratio;
      doc.addImage(data.logo, format, MARGIN, y, w, h, undefined, 'FAST');
      y += h + 10;
    } catch (e) {
      console.warn('Failed to add logo to PDF:', e);
    }
  }

  // Invoice number — left side, bold 16pt
  const invoiceLabel = data.invoiceNumberObject?.label || t.invoiceNumber;
  const invoiceValue = data.invoiceNumberObject?.value || '';
  const invoiceTitle = `${invoiceLabel} ${invoiceValue}`;

  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(BLACK);
  doc.text(invoiceTitle, MARGIN, y + 16);

  // Invoice type — below invoice number, 8pt bold
  let leftY = y + 16;
  if (data.invoiceTypeFieldIsVisible && data.invoiceType) {
    leftY += 14;
    doc.setFont('OpenSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(data.invoiceType, MARGIN, leftY);
  }

  // Dates — right side, 7-8pt
  const rightX = PAGE_WIDTH - MARGIN;
  let rightY = y + 10;

  // Date of issue label
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MEDIUM_GRAY);
  doc.text(`${t.dateOfIssue}:`, rightX, rightY, { align: 'right' });
  rightY += 10;

  // Date of issue value
  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(DARK_GRAY);
  const formattedIssueDate = formatDate(data.dateOfIssue, data.dateFormat, data.language);
  doc.text(formattedIssueDate, rightX, rightY, { align: 'right' });
  rightY += 14;

  // Date of service label
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MEDIUM_GRAY);
  doc.text(`${t.dateOfService}:`, rightX, rightY, { align: 'right' });
  rightY += 10;

  // Date of service value
  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(DARK_GRAY);
  const formattedServiceDate = formatDate(data.dateOfService, data.dateFormat, data.language);
  doc.text(formattedServiceDate, rightX, rightY, { align: 'right' });

  y = Math.max(leftY, rightY) + 20;

  // Separator line
  drawHLine(doc, y);
  y += 15;

  return y;
}

function drawSellerBuyerInfo(
  doc: any,
  data: InvoiceData,
  t: TranslationStrings,
  startY: number
): number {
  let y = startY;
  const colWidth = CONTENT_WIDTH / 2 - 10;
  const leftX = MARGIN;
  const rightX = MARGIN + CONTENT_WIDTH / 2 + 10;

  // ── Seller Column ──────────────────────────────────────────────────────
  let sellerY = y;

  // Seller header
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MEDIUM_GRAY);
  doc.text(t.seller.name, leftX, sellerY);
  sellerY += 12;

  // Seller name
  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BLACK);
  const sellerNameLines = doc.splitTextToSize(data.seller.name, colWidth);
  doc.text(sellerNameLines, leftX, sellerY);
  sellerY += sellerNameLines.length * 12;

  // Seller address
  if (data.seller.address) {
    doc.setFont('OpenSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(DARK_GRAY);
    const addressLines = doc.splitTextToSize(data.seller.address, colWidth);
    doc.text(addressLines, leftX, sellerY);
    sellerY += addressLines.length * 10;
  }

  // Seller VAT no
  if (data.seller.vatNoFieldIsVisible && data.seller.vatNo) {
    sellerY += 4;
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    const vatNoLabel = data.seller.vatNoLabelText || t.seller.vatNo;
    doc.text(`${vatNoLabel}: ${data.seller.vatNo}`, leftX, sellerY);
    sellerY += 10;
  }

  // Seller email
  if (data.seller.email) {
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(`${t.seller.email}: ${data.seller.email}`, leftX, sellerY);
    sellerY += 10;
  }

  // Account number
  if (data.seller.accountNumberFieldIsVisible && data.seller.accountNumber) {
    sellerY += 4;
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(`${t.seller.accountNumber}: ${data.seller.accountNumber}`, leftX, sellerY);
    sellerY += 10;
  }

  // SWIFT/BIC
  if (data.seller.swiftBicFieldIsVisible && data.seller.swiftBic) {
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(`${t.seller.swiftBic}: ${data.seller.swiftBic}`, leftX, sellerY);
    sellerY += 10;
  }

  // Seller notes
  if (data.seller.notesFieldIsVisible && data.seller.notes) {
    sellerY += 4;
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    const noteLines = doc.splitTextToSize(data.seller.notes, colWidth);
    doc.text(noteLines, leftX, sellerY);
    sellerY += noteLines.length * 9;
  }

  // ── Buyer Column ───────────────────────────────────────────────────────
  let buyerY = y;

  // Buyer header
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MEDIUM_GRAY);
  doc.text(t.buyer.name, rightX, buyerY);
  buyerY += 12;

  // Buyer name
  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BLACK);
  const buyerNameLines = doc.splitTextToSize(data.buyer.name, colWidth);
  doc.text(buyerNameLines, rightX, buyerY);
  buyerY += buyerNameLines.length * 12;

  // Buyer address
  if (data.buyer.address) {
    doc.setFont('OpenSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(DARK_GRAY);
    const addressLines = doc.splitTextToSize(data.buyer.address, colWidth);
    doc.text(addressLines, rightX, buyerY);
    buyerY += addressLines.length * 10;
  }

  // Buyer VAT no
  if (data.buyer.vatNoFieldIsVisible && data.buyer.vatNo) {
    buyerY += 4;
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    const vatNoLabel = data.buyer.vatNoLabelText || t.buyer.vatNo;
    doc.text(`${vatNoLabel}: ${data.buyer.vatNo}`, rightX, buyerY);
    buyerY += 10;
  }

  // Buyer email
  if (data.buyer.email) {
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(`${t.buyer.email}: ${data.buyer.email}`, rightX, buyerY);
    buyerY += 10;
  }

  // Buyer notes
  if (data.buyer.notesFieldIsVisible && data.buyer.notes) {
    buyerY += 4;
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    const noteLines = doc.splitTextToSize(data.buyer.notes, colWidth);
    doc.text(noteLines, rightX, buyerY);
    buyerY += noteLines.length * 9;
  }

  y = Math.max(sellerY, buyerY) + 20;

  // Separator line
  drawHLine(doc, y);
  y += 15;

  return y;
}

function drawItemsTable(
  doc: any,
  data: InvoiceData,
  t: TranslationStrings,
  taxLabel: string,
  startY: number
): number {
  let y = startY;
  y = checkPageBreak(doc, y, 80);

  const firstItem = data.items[0];
  if (!firstItem) return y;

  // Visible custom columns
  const visibleCustomCols = (data.customColumns ?? []).filter(c => c.visible);

  // Build columns based on visibility flags from the first item
  type ColDef = { header: string; dataKey: string; halign: string; cellWidth?: number };
  const columns: ColDef[] = [];

  if (firstItem.invoiceItemNumberIsVisible) {
    columns.push({ header: t.invoiceItemsTable.no, dataKey: 'no', halign: 'center', cellWidth: 25 });
  }
  if (firstItem.nameFieldIsVisible) {
    columns.push({ header: t.invoiceItemsTable.nameOfGoodsService, dataKey: 'name', halign: 'left' });
  }
  if (firstItem.typeOfGTUFieldIsVisible) {
    columns.push({ header: t.invoiceItemsTable.typeOfGTU, dataKey: 'gtu', halign: 'center', cellWidth: 40 });
  }

  // Custom columns — after GTU, before amount
  for (const cc of visibleCustomCols) {
    columns.push({ header: cc.header, dataKey: `custom_${cc.id}`, halign: 'left', cellWidth: 50 });
  }

  if (firstItem.amountFieldIsVisible) {
    columns.push({ header: t.invoiceItemsTable.amount, dataKey: 'amount', halign: 'right', cellWidth: 45 });
  }
  if (firstItem.unitFieldIsVisible) {
    columns.push({ header: t.invoiceItemsTable.unit, dataKey: 'unit', halign: 'center', cellWidth: 35 });
  }
  if (firstItem.netPriceFieldIsVisible) {
    columns.push({
      header: t.invoiceItemsTable.netPrice({ customTaxLabel: taxLabel }),
      dataKey: 'netPrice',
      halign: 'right',
      cellWidth: 55,
    });
  }
  if (firstItem.vatFieldIsVisible) {
    columns.push({ header: t.invoiceItemsTable.vat({ customTaxLabel: taxLabel }), dataKey: 'vat', halign: 'center', cellWidth: 35 });
  }
  if (firstItem.netAmountFieldIsVisible) {
    columns.push({
      header: t.invoiceItemsTable.netAmount({ customTaxLabel: taxLabel }),
      dataKey: 'netAmount',
      halign: 'right',
      cellWidth: 55,
    });
  }
  if (firstItem.vatAmountFieldIsVisible) {
    columns.push({
      header: t.invoiceItemsTable.vatAmount({ customTaxLabel: taxLabel }),
      dataKey: 'vatAmount',
      halign: 'right',
      cellWidth: 55,
    });
  }
  if (firstItem.preTaxAmountFieldIsVisible) {
    columns.push({
      header: t.invoiceItemsTable.preTaxAmount({ customTaxLabel: taxLabel }),
      dataKey: 'preTaxAmount',
      halign: 'right',
      cellWidth: 60,
    });
  }

  // Track which rows are note sub-rows (for styling in didParseCell)
  const noteRowIndices = new Set<number>();

  // Build row data for each item, inserting note sub-rows where applicable
  const body: string[][] = [];
  const showItemNotes = firstItem.itemNotesFieldIsVisible ?? false;

  data.items.forEach((item: InvoiceItem, index: number) => {
    const rowValues: Record<string, string> = {
      no: String(index + 1),
      name: item.name,
      gtu: item.typeOfGTU || '',
      amount: formatNumber(item.amount),
      unit: item.unit || '',
      netPrice: formatNumber(item.netPrice),
      vat: formatVatValue(item.vat),
      netAmount: formatNumber(item.netAmount),
      vatAmount: formatNumber(item.vatAmount),
      preTaxAmount: formatNumber(item.preTaxAmount),
    };
    // Add custom field values
    for (const cc of visibleCustomCols) {
      rowValues[`custom_${cc.id}`] = item.customFields?.[cc.id] ?? '';
    }

    body.push(columns.map((col) => rowValues[col.dataKey]));

    // Insert note sub-row if item notes are visible and non-empty
    if (showItemNotes && item.itemNotes) {
      const noteRow: string[] = columns.map((_, i) => i === 0 ? item.itemNotes! : '');
      noteRowIndices.add(body.length);
      body.push(noteRow);
    }
  });

  // Sum row: last column shows "SUM: {formattedTotal}", rest are empty
  const sumRowIndex = body.length;
  const sumRow: string[] = columns.map((_col, idx) => {
    if (idx === columns.length - 1) {
      return `${t.invoiceItemsTable.sum}: ${formatNumber(data.total)}`;
    }
    return '';
  });
  body.push(sumRow);

  // Build column styles for autoTable (indexed by column position)
  const columnStyles: Record<number, any> = {};
  columns.forEach((col, idx) => {
    const style: any = { halign: col.halign };
    if (col.cellWidth) {
      style.cellWidth = col.cellWidth;
    }
    columnStyles[idx] = style;
  });

  // Generate the table using jspdf-autotable
  (doc as any).autoTable({
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [columns.map((c) => c.header)],
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: TABLE_HEADER_BG,
      textColor: DARK_GRAY,
      fontStyle: 'bold',
      fontSize: 6,
      cellPadding: 4,
      lineWidth: 0.5,
      lineColor: LIGHT_GRAY,
      font: 'OpenSans',
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 4,
      textColor: DARK_GRAY,
      lineWidth: 0.5,
      lineColor: LIGHT_GRAY,
      font: 'OpenSans',
    },
    columnStyles: columnStyles,
    didParseCell: (hookData: any) => {
      const rowIdx = hookData.row.index;
      if (hookData.section !== 'body') return;

      // Style the sum row (always last)
      if (rowIdx === sumRowIndex) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = TABLE_HEADER_BG;
        hookData.cell.styles.halign = 'right';
      }

      // Style note sub-rows: merge across all columns, italic, lighter bg
      if (noteRowIndices.has(rowIdx)) {
        if (hookData.column.index === 0) {
          hookData.cell.colSpan = columns.length;
          hookData.cell.styles.fontStyle = 'italic';
          hookData.cell.styles.fontSize = 6;
          hookData.cell.styles.fillColor = '#fafafa';
          hookData.cell.styles.textColor = MEDIUM_GRAY;
          hookData.cell.styles.cellPadding = { top: 2, bottom: 2, left: 8, right: 4 };
        } else {
          // Hide cells that are merged into the first cell
          hookData.cell.text = [];
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  return y;
}

function drawPaymentAndVatSummary(
  doc: any,
  data: InvoiceData,
  t: TranslationStrings,
  taxLabel: string,
  startY: number
): number {
  let y = startY;
  y = checkPageBreak(doc, y, 100);

  const colWidth = CONTENT_WIDTH / 2 - 10;
  const leftX = MARGIN;
  const rightX = MARGIN + CONTENT_WIDTH / 2 + 10;

  let leftY = y;
  let rightY = y;

  // ── Left: Payment Info ─────────────────────────────────────────────────
  if (data.paymentMethodFieldIsVisible && data.paymentMethod) {
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(`${t.paymentInfo.paymentMethod}:`, leftX, leftY);
    leftY += 10;

    doc.setFont('OpenSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(DARK_GRAY);
    doc.text(data.paymentMethod, leftX, leftY);
    leftY += 14;
  }

  // Payment date
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MEDIUM_GRAY);
  doc.text(`${t.paymentInfo.paymentDate}:`, leftX, leftY);
  leftY += 10;

  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(DARK_GRAY);
  const formattedPaymentDue = formatDate(data.paymentDue, data.dateFormat, data.language);
  doc.text(formattedPaymentDue, leftX, leftY);
  leftY += 14;

  // ── Right: VAT Summary Table ───────────────────────────────────────────
  if (data.vatTableSummaryIsVisible && data.items.length > 0) {
    // Group items by VAT rate
    const vatGroups: Record<string, { net: number; vat: number; preTax: number }> = {};

    for (const item of data.items) {
      const vatKey = formatVatValue(item.vat);
      if (!vatGroups[vatKey]) {
        vatGroups[vatKey] = { net: 0, vat: 0, preTax: 0 };
      }
      vatGroups[vatKey].net += item.netAmount;
      vatGroups[vatKey].vat += item.vatAmount;
      vatGroups[vatKey].preTax += item.preTaxAmount;
    }

    // Sort by VAT rate: numeric rates ascending, then string rates alphabetically
    const sortedKeys = Object.keys(vatGroups).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });

    // Build VAT summary table headers and body
    const vatHeaders = [
      t.vatSummaryTable.vatRate({ customTaxLabel: taxLabel }),
      t.vatSummaryTable.net({ customTaxLabel: taxLabel }),
      t.vatSummaryTable.vat({ customTaxLabel: taxLabel }),
      t.vatSummaryTable.preTax({ customTaxLabel: taxLabel }),
    ];

    const vatBody: string[][] = [];
    let totalNet = 0;
    let totalVat = 0;
    let totalPreTax = 0;

    for (const key of sortedKeys) {
      const group = vatGroups[key];
      totalNet += group.net;
      totalVat += group.vat;
      totalPreTax += group.preTax;
      vatBody.push([
        key,
        formatNumber(group.net),
        formatNumber(group.vat),
        formatNumber(group.preTax),
      ]);
    }

    // Total row
    vatBody.push([
      t.vatSummaryTable.total,
      formatNumber(totalNet),
      formatNumber(totalVat),
      formatNumber(totalPreTax),
    ]);

    const vatColWidth = colWidth / 4;

    (doc as any).autoTable({
      startY: rightY,
      margin: { left: rightX, right: MARGIN },
      head: [vatHeaders],
      body: vatBody,
      theme: 'grid',
      tableWidth: colWidth,
      headStyles: {
        fillColor: TABLE_HEADER_BG,
        textColor: DARK_GRAY,
        fontStyle: 'bold',
        fontSize: 6,
        cellPadding: 3,
        lineWidth: 0.5,
        lineColor: LIGHT_GRAY,
        font: 'OpenSans',
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 3,
        textColor: DARK_GRAY,
        lineWidth: 0.5,
        lineColor: LIGHT_GRAY,
        font: 'OpenSans',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: vatColWidth },
        1: { halign: 'right', cellWidth: vatColWidth },
        2: { halign: 'right', cellWidth: vatColWidth },
        3: { halign: 'right', cellWidth: vatColWidth },
      },
      didParseCell: (hookData: any) => {
        // Style the total row (last row in body)
        if (hookData.section === 'body' && hookData.row.index === vatBody.length - 1) {
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.fillColor = TABLE_HEADER_BG;
        }
      },
    });

    rightY = (doc as any).lastAutoTable.finalY;
  }

  y = Math.max(leftY, rightY) + 20;

  return y;
}

function drawPaymentTotals(
  doc: any,
  data: InvoiceData,
  t: TranslationStrings,
  startY: number
): number {
  let y = startY;
  y = checkPageBreak(doc, y, 80);

  const formattedTotal = formatNumber(data.total);
  const currencyCode = data.currency;

  // "To Pay: {total} {currency}" — bold 12pt with underline
  doc.setFont('OpenSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(BLACK);
  const toPayText = `${t.paymentTotals.toPay}: ${formattedTotal} ${currencyCode}`;
  doc.text(toPayText, MARGIN, y);

  // Underline beneath the "To Pay" text
  const toPayWidth = doc.getTextWidth(toPayText);
  doc.setDrawColor(BLACK);
  doc.setLineWidth(1);
  doc.line(MARGIN, y + 2, MARGIN + toPayWidth, y + 2);

  y += 20;

  // "Paid: 0.00 {currency}"
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(DARK_GRAY);
  doc.text(`${t.paymentTotals.paid}: ${formatNumber(0)} ${currencyCode}`, MARGIN, y);
  y += 14;

  // "Left to Pay: {total} {currency}"
  doc.text(`${t.paymentTotals.leftToPay}: ${formattedTotal} ${currencyCode}`, MARGIN, y);
  y += 20;

  return y;
}

function drawSignatureSection(
  doc: any,
  data: InvoiceData,
  t: TranslationStrings,
  startY: number
): number {
  const showReceive = data.personAuthorizedToReceiveFieldIsVisible;
  const showIssue = data.personAuthorizedToIssueFieldIsVisible;

  if (!showReceive && !showIssue) return startY;

  let y = startY;
  y = checkPageBreak(doc, y, 80);
  y += 10;

  const lineLength = 150;
  const dashPattern = [3, 3];

  if (showReceive && showIssue) {
    // Two signature areas side by side
    const leftCenterX = MARGIN + CONTENT_WIDTH * 0.25;
    const rightCenterX = MARGIN + CONTENT_WIDTH * 0.75;

    // Dashed lines
    doc.setDrawColor(MEDIUM_GRAY);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern(dashPattern, 0);
    doc.line(leftCenterX - lineLength / 2, y, leftCenterX + lineLength / 2, y);
    doc.line(rightCenterX - lineLength / 2, y, rightCenterX + lineLength / 2, y);
    doc.setLineDashPattern([], 0);

    y += 10;

    // Labels
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(t.personAuthorizedToReceive, leftCenterX, y, { align: 'center' });
    doc.text(t.personAuthorizedToIssue, rightCenterX, y, { align: 'center' });

    y += 20;
  } else {
    // Single signature area centered on the page
    const centerX = PAGE_WIDTH / 2;
    const label = showReceive ? t.personAuthorizedToReceive : t.personAuthorizedToIssue;

    doc.setDrawColor(MEDIUM_GRAY);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern(dashPattern, 0);
    doc.line(centerX - lineLength / 2, y, centerX + lineLength / 2, y);
    doc.setLineDashPattern([], 0);

    y += 10;

    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(label, centerX, y, { align: 'center' });

    y += 20;
  }

  return y;
}

function drawNotes(doc: any, data: InvoiceData, startY: number): number {
  if (!data.notesFieldIsVisible || !data.notes) return startY;

  let y = startY;
  y = checkPageBreak(doc, y, 60);

  drawHLine(doc, y);
  y += 12;

  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(MEDIUM_GRAY);
  const noteLines = doc.splitTextToSize(data.notes, CONTENT_WIDTH);
  doc.text(noteLines, MARGIN, y);
  y += noteLines.length * 9 + 10;

  return y;
}

function drawFooter(doc: any, data: InvoiceData, t: TranslationStrings): void {
  const totalPages = doc.internal.getNumberOfPages();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    const footerY = PAGE_HEIGHT - MARGIN;

    // Separator line above footer
    drawHLine(doc, footerY - 18);

    // Left side: invoice number
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(MEDIUM_GRAY);

    const invoiceLabel = data.invoiceNumberObject?.label || t.invoiceNumber;
    const invoiceValue = data.invoiceNumberObject?.value || '';
    doc.text(`${invoiceLabel} ${invoiceValue}`, MARGIN, footerY - 10);

    // Left side: total + due date
    const formattedTotal = formatNumber(data.total);
    const formattedDue = formatDate(data.paymentDue, data.dateFormat, data.language);
    doc.text(
      `${formattedTotal} ${data.currency} | ${formattedDue}`,
      MARGIN,
      footerY - 3
    );

    // Right side: "Page X of Y"
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(MEDIUM_GRAY);
    doc.text(`${pageNum} / ${totalPages}`, PAGE_WIDTH - MARGIN, footerY - 3, {
      align: 'right',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate and return the jsPDF document object.
 * Does NOT save or create blob — just returns doc.
 */
export function generatePdf(data: InvoiceData): any {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  registerFonts(doc);

  const t: TranslationStrings = INVOICE_PDF_TRANSLATIONS[data.language];
  const taxLabel = data.taxLabelText || 'VAT';

  let y = MARGIN;

  // (a) Header
  y = drawHeader(doc, data, t, y);

  // (b) Seller / Buyer Info
  y = drawSellerBuyerInfo(doc, data, t, y);

  // (c) Items Table
  y = drawItemsTable(doc, data, t, taxLabel, y);

  // (d) Payment Info + VAT Summary
  y = drawPaymentAndVatSummary(doc, data, t, taxLabel, y);

  // (e) Payment Totals
  y = drawPaymentTotals(doc, data, t, y);

  // (f) Signature Section
  y = drawSignatureSection(doc, data, t, y);

  // (g) Notes
  y = drawNotes(doc, data, y);

  // (h) Footer (on every page)
  drawFooter(doc, data, t);

  return doc;
}

/**
 * Generate the PDF and return it as a Blob.
 */
export function generatePdfBlob(data: InvoiceData): Blob {
  const doc = generatePdf(data);
  return doc.output('blob') as Blob;
}

/**
 * Generate the PDF, create a blob URL, and trigger a download.
 * Filename: invoice-{language}-{invoiceNumberValue}.pdf
 */
export function downloadPdf(data: InvoiceData): void {
  const blob = generatePdfBlob(data);
  const url = URL.createObjectURL(blob);
  const invoiceNumber = data.invoiceNumberObject?.value || 'draft';
  const filename = `invoice-${data.language}-${invoiceNumber}.pdf`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate the PDF blob, create an object URL, and set it as the src
 * on the #pdf-preview iframe. Revokes the previous URL to prevent
 * memory leaks.
 */
export function updatePreview(data: InvoiceData): void {
  const blob = generatePdfBlob(data);
  const url = URL.createObjectURL(blob);

  const iframe = document.getElementById('pdf-preview') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.src = url;
    // Once loaded, force the iframe's internal document to fill available space
    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc?.documentElement) {
          doc.documentElement.style.height = '100%';
          doc.documentElement.style.overflow = 'hidden';
        }
        if (doc?.body) {
          doc.body.style.height = '100%';
          doc.body.style.overflow = 'hidden';
          doc.body.style.margin = '0';
        }
      } catch (_) { /* cross-origin — ignore */ }
    };
  }

  // Revoke the previous URL to prevent memory leaks
  if (previousPreviewUrl) {
    URL.revokeObjectURL(previousPreviewUrl);
  }
  previousPreviewUrl = url;
}
