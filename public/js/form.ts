import type {
  InvoiceData,
  InvoiceItem,
  SavedSeller,
  SavedBuyer,
  SupportedCurrency,
  SupportedLanguage,
  SupportedDateFormat,
  InvoiceTemplate,
  SellerData,
  BuyerData,
} from "../../src/types";

import {
  SUPPORTED_CURRENCIES,
  CURRENCY_TO_LABEL,
  CURRENCY_SYMBOLS,
} from "../../src/types";

import { formatNumber } from "./utils";

// ── Internal state ──────────────────────────────────────────────────────────

let _onChange: () => void = () => {};

// ── Init ────────────────────────────────────────────────────────────────────

/**
 * Store the onChange callback that will be fired whenever any form field
 * changes, an item is added/removed, or a recalculation happens.
 */
export function initForm(onChange: () => void): void {
  _onChange = onChange;
}

// ── Currency dropdown ───────────────────────────────────────────────────────

/**
 * Fill the #currency <select> with all entries from SUPPORTED_CURRENCIES,
 * using CURRENCY_TO_LABEL for the visible text and CURRENCY_SYMBOLS for
 * a prefix symbol.
 */
export function populateCurrencyDropdown(): void {
  const select = document.getElementById("currency") as HTMLSelectElement | null;
  if (!select) return;

  select.innerHTML = "";

  for (const code of SUPPORTED_CURRENCIES) {
    const option = document.createElement("option");
    option.value = code;
    const symbol = CURRENCY_SYMBOLS[code] ?? "";
    const label = CURRENCY_TO_LABEL[code] ?? code;
    option.textContent = `${code} — ${symbol} — ${label}`;
    select.appendChild(option);
  }
}

// ── Populate form from InvoiceData ──────────────────────────────────────────

/**
 * Set every form field's value from the supplied InvoiceData object.
 * Also clears and re-creates invoice items and adjusts section visibility
 * based on the selected template.
 */
export function populateForm(data: InvoiceData): void {
  // Selects
  setSelectValue("template", data.template);
  setSelectValue("language", data.language);
  setSelectValue("currency", data.currency);
  setSelectValue("dateFormat", data.dateFormat);

  // General text inputs
  setInputValue("taxLabelText", data.taxLabelText);
  setInputValue("invoiceNumberLabel", data.invoiceNumberObject?.label ?? "Invoice");
  setInputValue("invoiceNumberValue", data.invoiceNumberObject?.value ?? "");
  setInputValue("invoiceType", data.invoiceType ?? "");
  setInputValue("dateOfIssue", data.dateOfIssue);
  setInputValue("dateOfService", data.dateOfService);
  setInputValue("paymentDue", data.paymentDue);

  // Stripe-specific
  setInputValue("stripePayOnlineUrl", data.stripePayOnlineUrl ?? "");

  // Seller fields
  setInputValue("sellerName", data.seller.name);
  setInputValue("sellerEmail", data.seller.email);
  setTextareaValue("sellerAddress", data.seller.address);
  setInputValue("sellerVatNo", data.seller.vatNo ?? "");
  setInputValue("sellerVatNoLabelText", data.seller.vatNoLabelText);
  setInputValue("sellerAccountNumber", data.seller.accountNumber ?? "");
  setInputValue("sellerSwiftBic", data.seller.swiftBic ?? "");
  setTextareaValue("sellerNotes", data.seller.notes ?? "");

  // Buyer fields
  setInputValue("buyerName", data.buyer.name);
  setInputValue("buyerEmail", data.buyer.email);
  setTextareaValue("buyerAddress", data.buyer.address);
  setInputValue("buyerVatNo", data.buyer.vatNo ?? "");
  setInputValue("buyerVatNoLabelText", data.buyer.vatNoLabelText);
  setTextareaValue("buyerNotes", data.buyer.notes ?? "");

  // Payment & notes
  setInputValue("paymentMethod", data.paymentMethod ?? "");
  setTextareaValue("invoiceNotes", data.notes ?? "");

  // Visibility checkboxes
  setCheckbox("invoiceTypeFieldIsVisible", data.invoiceTypeFieldIsVisible);
  setCheckbox("sellerVatNoFieldIsVisible", data.seller.vatNoFieldIsVisible);
  setCheckbox("sellerAccountNumberFieldIsVisible", data.seller.accountNumberFieldIsVisible);
  setCheckbox("sellerSwiftBicFieldIsVisible", data.seller.swiftBicFieldIsVisible);
  setCheckbox("sellerNotesFieldIsVisible", data.seller.notesFieldIsVisible);
  setCheckbox("buyerVatNoFieldIsVisible", data.buyer.vatNoFieldIsVisible);
  setCheckbox("buyerNotesFieldIsVisible", data.buyer.notesFieldIsVisible);
  setCheckbox("vatTableSummaryIsVisible", data.vatTableSummaryIsVisible);
  setCheckbox("paymentMethodFieldIsVisible", data.paymentMethodFieldIsVisible);
  setCheckbox("notesFieldIsVisible", data.notesFieldIsVisible);
  setCheckbox("personAuthorizedToReceiveFieldIsVisible", data.personAuthorizedToReceiveFieldIsVisible);
  setCheckbox("personAuthorizedToIssueFieldIsVisible", data.personAuthorizedToIssueFieldIsVisible);

  // Items — clear and re-create
  const container = document.getElementById("items-container");
  if (container) {
    container.innerHTML = "";
  }

  if (data.items.length === 0) {
    addInvoiceItem();
  } else {
    for (const item of data.items) {
      addInvoiceItem(item);
    }
  }

  // Column-visibility toggles (read from first item to set checkbox states)
  if (data.items.length > 0) {
    const first = data.items[0];
    setCheckbox("toggle-itemNumber", first.invoiceItemNumberIsVisible);
    setCheckbox("toggle-name", first.nameFieldIsVisible);
    setCheckbox("toggle-gtu", first.typeOfGTUFieldIsVisible);
    setCheckbox("toggle-amount", first.amountFieldIsVisible);
    setCheckbox("toggle-unit", first.unitFieldIsVisible);
    setCheckbox("toggle-netPrice", first.netPriceFieldIsVisible);
    setCheckbox("toggle-vat", first.vatFieldIsVisible);
    setCheckbox("toggle-netAmount", first.netAmountFieldIsVisible);
    setCheckbox("toggle-vatAmount", first.vatAmountFieldIsVisible);
    setCheckbox("toggle-preTaxAmount", first.preTaxAmountFieldIsVisible);
  }

  // Template-specific visibility
  handleTemplateChange(data.template);

  // Update column visibility after toggles are set
  updateColumnVisibility();

  // Total
  recalculateTotal();
}

// ── Extract form data ───────────────────────────────────────────────────────

/**
 * Read every form field and return a complete InvoiceData object.
 */
export function extractFormData(): InvoiceData {
  const template = getSelectValue("template") as InvoiceTemplate;
  const language = getSelectValue("language") as SupportedLanguage;
  const currency = getSelectValue("currency") as SupportedCurrency;
  const dateFormat = getSelectValue("dateFormat") as SupportedDateFormat;

  const items = extractItems();
  const total = items.reduce((sum, item) => sum + item.preTaxAmount, 0);

  const data: InvoiceData = {
    template,
    language,
    currency,
    dateFormat,
    taxLabelText: getInputValue("taxLabelText"),
    invoiceNumberObject: {
      label: getInputValue("invoiceNumberLabel"),
      value: getInputValue("invoiceNumberValue"),
    },
    invoiceType: getInputValue("invoiceType"),
    invoiceTypeFieldIsVisible: getCheckbox("invoiceTypeFieldIsVisible"),
    dateOfIssue: getInputValue("dateOfIssue"),
    dateOfService: getInputValue("dateOfService"),
    paymentDue: getInputValue("paymentDue"),

    seller: {
      name: getInputValue("sellerName"),
      email: getInputValue("sellerEmail"),
      address: getTextareaValue("sellerAddress"),
      vatNo: getInputValue("sellerVatNo"),
      vatNoLabelText: getInputValue("sellerVatNoLabelText"),
      vatNoFieldIsVisible: getCheckbox("sellerVatNoFieldIsVisible"),
      accountNumber: getInputValue("sellerAccountNumber"),
      accountNumberFieldIsVisible: getCheckbox("sellerAccountNumberFieldIsVisible"),
      swiftBic: getInputValue("sellerSwiftBic"),
      swiftBicFieldIsVisible: getCheckbox("sellerSwiftBicFieldIsVisible"),
      notes: getTextareaValue("sellerNotes"),
      notesFieldIsVisible: getCheckbox("sellerNotesFieldIsVisible"),
    },

    buyer: {
      name: getInputValue("buyerName"),
      email: getInputValue("buyerEmail"),
      address: getTextareaValue("buyerAddress"),
      vatNo: getInputValue("buyerVatNo"),
      vatNoLabelText: getInputValue("buyerVatNoLabelText"),
      vatNoFieldIsVisible: getCheckbox("buyerVatNoFieldIsVisible"),
      notes: getTextareaValue("buyerNotes"),
      notesFieldIsVisible: getCheckbox("buyerNotesFieldIsVisible"),
    },

    items,
    total,

    vatTableSummaryIsVisible: getCheckbox("vatTableSummaryIsVisible"),
    paymentMethod: getInputValue("paymentMethod"),
    paymentMethodFieldIsVisible: getCheckbox("paymentMethodFieldIsVisible"),
    notes: getTextareaValue("invoiceNotes"),
    notesFieldIsVisible: getCheckbox("notesFieldIsVisible"),
    personAuthorizedToReceiveFieldIsVisible: getCheckbox("personAuthorizedToReceiveFieldIsVisible"),
    personAuthorizedToIssueFieldIsVisible: getCheckbox("personAuthorizedToIssueFieldIsVisible"),
    stripePayOnlineUrl: getInputValue("stripePayOnlineUrl") || undefined,
  };

  // Read logo data URI from preview image if present
  const logoImg = document.getElementById("logo-img") as HTMLImageElement | null;
  if (logoImg && logoImg.src && logoImg.src.startsWith("data:")) {
    data.logo = logoImg.src;
  }

  return data;
}

/**
 * Read all item elements from the container and return an InvoiceItem array.
 */
function extractItems(): InvoiceItem[] {
  const container = document.getElementById("items-container");
  if (!container) return [];

  const itemEls = container.querySelectorAll<HTMLElement>(".invoice-item");
  const items: InvoiceItem[] = [];

  for (const el of itemEls) {
    const name = getItemInput(el, ".item-name");
    const gtu = getItemInput(el, ".item-gtu");
    const amountStr = getItemInput(el, ".item-amount");
    const unit = getItemInput(el, ".item-unit");
    const netPriceStr = getItemInput(el, ".item-net-price");
    const vatStr = getItemInput(el, ".item-vat");

    const amount = parseFloat(amountStr) || 0;
    const netPrice = parseFloat(netPriceStr) || 0;
    const vatNum = parseFloat(vatStr);
    const vat: number | string = isNaN(vatNum) ? vatStr : vatNum;

    const netAmount = amount * netPrice;
    const vatAmount = typeof vat === "number" ? (netAmount * vat) / 100 : 0;
    const preTaxAmount = netAmount + vatAmount;

    items.push({
      invoiceItemNumberIsVisible: getCheckbox("toggle-itemNumber"),
      name,
      nameFieldIsVisible: getCheckbox("toggle-name"),
      typeOfGTU: gtu,
      typeOfGTUFieldIsVisible: getCheckbox("toggle-gtu"),
      amount,
      amountFieldIsVisible: getCheckbox("toggle-amount"),
      unit,
      unitFieldIsVisible: getCheckbox("toggle-unit"),
      netPrice,
      netPriceFieldIsVisible: getCheckbox("toggle-netPrice"),
      vat,
      vatFieldIsVisible: getCheckbox("toggle-vat"),
      netAmount,
      netAmountFieldIsVisible: getCheckbox("toggle-netAmount"),
      vatAmount,
      vatAmountFieldIsVisible: getCheckbox("toggle-vatAmount"),
      preTaxAmount,
      preTaxAmountFieldIsVisible: getCheckbox("toggle-preTaxAmount"),
    });
  }

  return items;
}

// ── Invoice item management ─────────────────────────────────────────────────

/**
 * Clone the #item-template, populate it with the given data (or defaults),
 * append it to #items-container, and wire up remove + input change events.
 */
export function addInvoiceItem(data?: Partial<InvoiceItem>): void {
  const template = document.getElementById("item-template") as HTMLTemplateElement | null;
  const container = document.getElementById("items-container");
  if (!template || !container) return;

  const clone = template.content.cloneNode(true) as DocumentFragment;
  const itemEl = clone.querySelector<HTMLElement>(".invoice-item");
  if (!itemEl) return;

  // Populate fields from data or use defaults
  const nameInput = itemEl.querySelector<HTMLInputElement>(".item-name");
  const gtuInput = itemEl.querySelector<HTMLInputElement>(".item-gtu");
  const amountInput = itemEl.querySelector<HTMLInputElement>(".item-amount");
  const unitInput = itemEl.querySelector<HTMLInputElement>(".item-unit");
  const netPriceInput = itemEl.querySelector<HTMLInputElement>(".item-net-price");
  const vatInput = itemEl.querySelector<HTMLInputElement>(".item-vat");

  if (nameInput) nameInput.value = data?.name ?? "";
  if (gtuInput) gtuInput.value = data?.typeOfGTU ?? "";
  if (amountInput) amountInput.value = String(data?.amount ?? 1);
  if (unitInput) unitInput.value = data?.unit ?? "pcs";
  if (netPriceInput) netPriceInput.value = String(data?.netPrice ?? 0);
  if (vatInput) vatInput.value = String(data?.vat ?? 23);

  // Append first so DOM queries work on it
  container.appendChild(clone);

  // Compute initial values
  recalculateItem(itemEl);

  // Wire up the remove button
  const removeBtn = itemEl.querySelector<HTMLButtonElement>(".btn-remove-item");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      removeInvoiceItem(itemEl);
    });
  }

  // Wire up input change events for recalculation
  const inputs = itemEl.querySelectorAll<HTMLInputElement>("input");
  for (const input of inputs) {
    input.addEventListener("input", () => {
      recalculateItem(itemEl);
      recalculateTotal();
      _onChange();
    });
  }

  // Update numbering and button states
  updateItemNumbers();
  updateRemoveButtons();

  // Apply current column visibility settings
  updateColumnVisibility();

  _onChange();
}

/**
 * Remove an item element from the container. If only one item remains,
 * reset it to defaults instead of removing.
 */
export function removeInvoiceItem(itemEl: HTMLElement): void {
  const container = document.getElementById("items-container");
  if (!container) return;

  const allItems = container.querySelectorAll(".invoice-item");
  if (allItems.length <= 1) {
    resetItem(itemEl);
    recalculateItem(itemEl);
    recalculateTotal();
    _onChange();
    return;
  }

  itemEl.remove();
  updateItemNumbers();
  updateRemoveButtons();
  recalculateTotal();
  _onChange();
}

/**
 * Reset an item's inputs to default values.
 */
function resetItem(itemEl: HTMLElement): void {
  const nameInput = itemEl.querySelector<HTMLInputElement>(".item-name");
  const gtuInput = itemEl.querySelector<HTMLInputElement>(".item-gtu");
  const amountInput = itemEl.querySelector<HTMLInputElement>(".item-amount");
  const unitInput = itemEl.querySelector<HTMLInputElement>(".item-unit");
  const netPriceInput = itemEl.querySelector<HTMLInputElement>(".item-net-price");
  const vatInput = itemEl.querySelector<HTMLInputElement>(".item-vat");

  if (nameInput) nameInput.value = "";
  if (gtuInput) gtuInput.value = "";
  if (amountInput) amountInput.value = "1";
  if (unitInput) unitInput.value = "pcs";
  if (netPriceInput) netPriceInput.value = "0";
  if (vatInput) vatInput.value = "23";
}

/**
 * Update remove/reset button appearance based on item count.
 * Single item shows reset icon; multiple items show remove icon.
 */
export function updateRemoveButtons(): void {
  const container = document.getElementById("items-container");
  if (!container) return;

  const allItems = container.querySelectorAll(".invoice-item");
  const isSingle = allItems.length <= 1;

  for (const item of allItems) {
    const btn = item.querySelector<HTMLButtonElement>(".btn-remove-item");
    if (!btn) continue;
    btn.title = isSingle ? "Reset item" : "Remove item";
    btn.innerHTML = isSingle ? "&#x21bb;" : "&times;";
  }
}

// ── Recalculation ───────────────────────────────────────────────────────────

/**
 * Read amount, netPrice, and vat from an item element's inputs.
 * Compute netAmount, vatAmount, preTaxAmount and update the
 * corresponding <span> elements.
 */
export function recalculateItem(itemEl: HTMLElement): void {
  const amountStr = getItemInput(itemEl, ".item-amount");
  const netPriceStr = getItemInput(itemEl, ".item-net-price");
  const vatStr = getItemInput(itemEl, ".item-vat");

  const amount = parseFloat(amountStr) || 0;
  const netPrice = parseFloat(netPriceStr) || 0;
  const vatNum = parseFloat(vatStr);

  const netAmount = amount * netPrice;
  const vatAmount = isNaN(vatNum) ? 0 : (netAmount * vatNum) / 100;
  const preTaxAmount = netAmount + vatAmount;

  const netAmountSpan = itemEl.querySelector<HTMLSpanElement>(".item-net-amount");
  const vatAmountSpan = itemEl.querySelector<HTMLSpanElement>(".item-vat-amount");
  const preTaxAmountSpan = itemEl.querySelector<HTMLSpanElement>(".item-pre-tax-amount");

  if (netAmountSpan) netAmountSpan.textContent = formatNumber(netAmount);
  if (vatAmountSpan) vatAmountSpan.textContent = formatNumber(vatAmount);
  if (preTaxAmountSpan) preTaxAmountSpan.textContent = formatNumber(preTaxAmount);
}

/**
 * Sum all items' preTaxAmount values and update #total-display and
 * #total-currency.
 */
export function recalculateTotal(): void {
  const container = document.getElementById("items-container");
  if (!container) return;

  const itemEls = container.querySelectorAll<HTMLElement>(".invoice-item");
  let total = 0;

  for (const el of itemEls) {
    const amountStr = getItemInput(el, ".item-amount");
    const netPriceStr = getItemInput(el, ".item-net-price");
    const vatStr = getItemInput(el, ".item-vat");

    const amount = parseFloat(amountStr) || 0;
    const netPrice = parseFloat(netPriceStr) || 0;
    const vatNum = parseFloat(vatStr);

    const netAmount = amount * netPrice;
    const vatAmount = isNaN(vatNum) ? 0 : (netAmount * vatNum) / 100;
    const preTaxAmount = netAmount + vatAmount;

    total += preTaxAmount;
  }

  const totalDisplay = document.getElementById("total-display");
  const totalCurrency = document.getElementById("total-currency");
  const currencySelect = document.getElementById("currency") as HTMLSelectElement | null;

  if (totalDisplay) totalDisplay.textContent = formatNumber(total);
  if (totalCurrency && currencySelect) totalCurrency.textContent = currencySelect.value;
}

// ── Item numbering ──────────────────────────────────────────────────────────

/**
 * Re-number all item .item-number spans sequentially (1, 2, 3, ...).
 */
export function updateItemNumbers(): void {
  const container = document.getElementById("items-container");
  if (!container) return;

  const itemEls = container.querySelectorAll<HTMLElement>(".invoice-item");
  let idx = 1;
  for (const el of itemEls) {
    const numberSpan = el.querySelector<HTMLSpanElement>(".item-number");
    if (numberSpan) {
      numberSpan.textContent = String(idx);
    }
    idx++;
  }
}

// ── Column visibility ──────────────────────────────────────────────────────

/**
 * Read the column toggle checkboxes and show/hide the corresponding
 * .item-field[data-col] elements across all items, plus the item-number spans.
 */
export function updateColumnVisibility(): void {
  const toggleMap: Record<string, string> = {
    "toggle-itemNumber": "itemNumber",
    "toggle-name": "name",
    "toggle-gtu": "gtu",
    "toggle-amount": "amount",
    "toggle-unit": "unit",
    "toggle-netPrice": "netPrice",
    "toggle-vat": "vat",
    "toggle-netAmount": "netAmount",
    "toggle-vatAmount": "vatAmount",
    "toggle-preTaxAmount": "preTaxAmount",
  };

  const container = document.getElementById("items-container");
  if (!container) return;

  for (const [toggleId, colName] of Object.entries(toggleMap)) {
    const checkbox = document.getElementById(toggleId) as HTMLInputElement | null;
    if (!checkbox) continue;

    const isVisible = checkbox.checked;

    if (colName === "itemNumber") {
      // Item number is in the header, not a data-col field
      const numberSpans = container.querySelectorAll<HTMLElement>(".item-number");
      for (const span of numberSpans) {
        span.style.display = isVisible ? "" : "none";
      }
    } else {
      const fields = container.querySelectorAll<HTMLElement>(`.item-field[data-col="${colName}"]`);
      for (const field of fields) {
        field.style.display = isVisible ? "" : "none";
      }
    }
  }
}

// ── Template change ─────────────────────────────────────────────────────────

/**
 * Show/hide template-specific sections.
 *
 * Stripe template shows: stripe-logo-section, stripe-payment-section
 * Default template shows: invoice-type-section, payment-method-section,
 *                         signature-section, item-field-toggles
 */
export function handleTemplateChange(template: string): void {
  const isStripe = template === "stripe";

  // Stripe-specific sections
  toggleSectionVisibility("stripe-logo-section", isStripe);
  toggleSectionVisibility("stripe-payment-section", isStripe);

  // Default-template-only sections
  toggleSectionVisibility("invoice-type-section", !isStripe);
  toggleSectionVisibility("payment-method-section", !isStripe);
  toggleSectionVisibility("signature-section", !isStripe);
  toggleSectionVisibility("item-field-toggles", !isStripe);
}

// ── Seller profiles ─────────────────────────────────────────────────────────

/**
 * Populate the #seller-select dropdown with saved sellers. Handle save
 * and delete button clicks. On select change, populate seller form fields.
 */
export function setupSellerProfiles(
  sellers: SavedSeller[],
  onSave: (seller: SellerData) => void,
  onDelete: (id: string) => void,
): void {
  const select = document.getElementById("seller-select") as HTMLSelectElement | null;
  const saveBtn = document.getElementById("btn-save-seller");
  const deleteBtn = document.getElementById("btn-delete-seller");

  if (!select) return;

  // Populate dropdown
  select.innerHTML = '<option value="">-- Select saved seller --</option>';
  for (const seller of sellers) {
    const option = document.createElement("option");
    option.value = seller.id;
    option.textContent = seller.name;
    select.appendChild(option);
  }

  // On select change, populate seller fields
  select.addEventListener("change", () => {
    const selectedId = select.value;

    if (deleteBtn) {
      if (selectedId) {
        deleteBtn.classList.remove("hidden");
      } else {
        deleteBtn.classList.add("hidden");
      }
    }

    if (!selectedId) return;

    const seller = sellers.find((s) => s.id === selectedId);
    if (!seller) return;

    setInputValue("sellerName", seller.name);
    setInputValue("sellerEmail", seller.email);
    setTextareaValue("sellerAddress", seller.address);
    setInputValue("sellerVatNo", seller.vatNo ?? "");
    setInputValue("sellerVatNoLabelText", seller.vatNoLabelText);
    setCheckbox("sellerVatNoFieldIsVisible", seller.vatNoFieldIsVisible);
    setInputValue("sellerAccountNumber", seller.accountNumber ?? "");
    setCheckbox("sellerAccountNumberFieldIsVisible", seller.accountNumberFieldIsVisible);
    setInputValue("sellerSwiftBic", seller.swiftBic ?? "");
    setCheckbox("sellerSwiftBicFieldIsVisible", seller.swiftBicFieldIsVisible);
    setTextareaValue("sellerNotes", seller.notes ?? "");
    setCheckbox("sellerNotesFieldIsVisible", seller.notesFieldIsVisible);

    _onChange();
  });

  // Save button
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const sellerData: SellerData = {
        name: getInputValue("sellerName"),
        email: getInputValue("sellerEmail"),
        address: getTextareaValue("sellerAddress"),
        vatNo: getInputValue("sellerVatNo"),
        vatNoLabelText: getInputValue("sellerVatNoLabelText"),
        vatNoFieldIsVisible: getCheckbox("sellerVatNoFieldIsVisible"),
        accountNumber: getInputValue("sellerAccountNumber"),
        accountNumberFieldIsVisible: getCheckbox("sellerAccountNumberFieldIsVisible"),
        swiftBic: getInputValue("sellerSwiftBic"),
        swiftBicFieldIsVisible: getCheckbox("sellerSwiftBicFieldIsVisible"),
        notes: getTextareaValue("sellerNotes"),
        notesFieldIsVisible: getCheckbox("sellerNotesFieldIsVisible"),
      };

      // If a profile is currently selected, pass its id so it can be updated
      const selectedId = select.value;
      if (selectedId) {
        sellerData.id = selectedId;
      }

      onSave(sellerData);
    });
  }

  // Delete button
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const selectedId = select.value;
      if (selectedId) {
        onDelete(selectedId);
      }
    });
  }
}

// ── Buyer profiles ──────────────────────────────────────────────────────────

/**
 * Populate the #buyer-select dropdown with saved buyers. Handle save
 * and delete button clicks. On select change, populate buyer form fields.
 */
export function setupBuyerProfiles(
  buyers: SavedBuyer[],
  onSave: (buyer: BuyerData) => void,
  onDelete: (id: string) => void,
): void {
  const select = document.getElementById("buyer-select") as HTMLSelectElement | null;
  const saveBtn = document.getElementById("btn-save-buyer");
  const deleteBtn = document.getElementById("btn-delete-buyer");

  if (!select) return;

  // Populate dropdown
  select.innerHTML = '<option value="">-- Select saved buyer --</option>';
  for (const buyer of buyers) {
    const option = document.createElement("option");
    option.value = buyer.id;
    option.textContent = buyer.name;
    select.appendChild(option);
  }

  // On select change, populate buyer fields
  select.addEventListener("change", () => {
    const selectedId = select.value;

    if (deleteBtn) {
      if (selectedId) {
        deleteBtn.classList.remove("hidden");
      } else {
        deleteBtn.classList.add("hidden");
      }
    }

    if (!selectedId) return;

    const buyer = buyers.find((b) => b.id === selectedId);
    if (!buyer) return;

    setInputValue("buyerName", buyer.name);
    setInputValue("buyerEmail", buyer.email);
    setTextareaValue("buyerAddress", buyer.address);
    setInputValue("buyerVatNo", buyer.vatNo ?? "");
    setInputValue("buyerVatNoLabelText", buyer.vatNoLabelText);
    setCheckbox("buyerVatNoFieldIsVisible", buyer.vatNoFieldIsVisible);
    setTextareaValue("buyerNotes", buyer.notes ?? "");
    setCheckbox("buyerNotesFieldIsVisible", buyer.notesFieldIsVisible);

    _onChange();
  });

  // Save button
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const buyerData: BuyerData = {
        name: getInputValue("buyerName"),
        email: getInputValue("buyerEmail"),
        address: getTextareaValue("buyerAddress"),
        vatNo: getInputValue("buyerVatNo"),
        vatNoLabelText: getInputValue("buyerVatNoLabelText"),
        vatNoFieldIsVisible: getCheckbox("buyerVatNoFieldIsVisible"),
        notes: getTextareaValue("buyerNotes"),
        notesFieldIsVisible: getCheckbox("buyerNotesFieldIsVisible"),
      };

      const selectedId = select.value;
      if (selectedId) {
        buyerData.id = selectedId;
      }

      onSave(buyerData);
    });
  }

  // Delete button
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const selectedId = select.value;
      if (selectedId) {
        onDelete(selectedId);
      }
    });
  }
}

// ── DOM helpers ─────────────────────────────────────────────────────────────

function setSelectValue(id: string, value: string): void {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  if (el) el.value = value;
}

function getSelectValue(id: string): string {
  const el = document.getElementById(id) as HTMLSelectElement | null;
  return el?.value ?? "";
}

function setInputValue(id: string, value: string): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.value = value;
}

function getInputValue(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el?.value ?? "";
}

function setTextareaValue(id: string, value: string): void {
  const el = document.getElementById(id) as HTMLTextAreaElement | null;
  if (el) el.value = value;
}

function getTextareaValue(id: string): string {
  const el = document.getElementById(id) as HTMLTextAreaElement | null;
  return el?.value ?? "";
}

function setCheckbox(id: string, checked: boolean): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.checked = checked;
}

function getCheckbox(id: string): boolean {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el?.checked ?? false;
}

function getItemInput(itemEl: HTMLElement, selector: string): string {
  const input = itemEl.querySelector<HTMLInputElement>(selector);
  return input?.value ?? "";
}

function toggleSectionVisibility(id: string, visible: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (visible) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}
