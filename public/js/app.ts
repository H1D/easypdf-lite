import type { InvoiceData, SavedSeller, SavedBuyer, AccordionState, SellerData, BuyerData } from "../../src/types";
import { downloadPdf, updatePreview as updatePdfPreview } from "./pdf-generator";
import {
  initForm,
  populateCurrencyDropdown,
  populateForm,
  extractFormData,
  addInvoiceItem,
  recalculateTotal,
  handleTemplateChange,
  setupSellerProfiles,
  setupBuyerProfiles,
  updateColumnVisibility,
} from "./form";
import { saveInvoiceData, loadInvoiceData, loadSellers, saveSellers, loadBuyers, saveBuyers, saveAccordionState, loadAccordionState, saveLogo, loadLogo, removeLogo } from "./storage";
import { generateShareUrl, loadFromUrl } from "./url-sharing";
import { debounce, generateId, today, endOfMonth, addDays, defaultServiceDate } from "./utils";

// === Toast ===
function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// === PDF Preview ===
function refreshPreview() {
  try {
    const data = extractFormData();
    updatePdfPreview(data);
  } catch (err) {
    console.error("PDF generation error:", err);
  }
}

const debouncedPreview = debounce(refreshPreview, 300);
const debouncedSave = debounce(() => {
  const data = extractFormData();
  saveInvoiceData(data);
}, 500);

function onFormChange() {
  debouncedPreview();
  debouncedSave();
}

// === Accordion persistence ===
function setupAccordions() {
  const savedState = loadAccordionState();
  const details = document.querySelectorAll("details[data-accordion]");

  details.forEach(el => {
    const key = (el as HTMLElement).dataset.accordion as keyof AccordionState;
    if (savedState && key in savedState) {
      if (savedState[key]) {
        el.setAttribute("open", "");
      } else {
        el.removeAttribute("open");
      }
    }

    el.addEventListener("toggle", () => {
      const state: AccordionState = { general: true, seller: true, buyer: true, invoiceItems: true };
      details.forEach(d => {
        const k = (d as HTMLElement).dataset.accordion as keyof AccordionState;
        if (k) state[k] = (d as HTMLDetailsElement).open;
      });
      saveAccordionState(state);
    });
  });
}

// === Mobile tabs ===
function setupMobileTabs() {
  const tabs = document.querySelectorAll(".mobile-tab");
  const formPanel = document.getElementById("form-panel");
  const previewPanel = document.getElementById("preview-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = (tab as HTMLElement).dataset.tab;
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      if (target === "invoice-form") {
        formPanel?.classList.remove("hidden-mobile");
        previewPanel?.classList.remove("active");
      } else {
        formPanel?.classList.add("hidden-mobile");
        previewPanel?.classList.add("active");
        refreshPreview();
      }
    });
  });
}

// === Date helpers ===
function setupDateHelpers() {
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = (btn as HTMLElement).dataset.action;
      const target = (btn as HTMLElement).dataset.target;
      if (!target) return;
      const input = document.getElementById(target) as HTMLInputElement;
      if (!input) return;

      switch (action) {
        case "set-today":
          input.value = today();
          break;
        case "set-month-end":
          input.value = endOfMonth();
          break;
        case "set-14-days": {
          const issueDate = (document.getElementById("dateOfIssue") as HTMLInputElement)?.value || today();
          input.value = addDays(issueDate, 14);
          break;
        }
      }
      onFormChange();
    });
  });

  const updateDatesBtn = document.getElementById("btn-update-dates");
  if (updateDatesBtn) {
    updateDatesBtn.addEventListener("click", () => {
      const todayStr = today();
      (document.getElementById("dateOfIssue") as HTMLInputElement).value = todayStr;
      (document.getElementById("dateOfService") as HTMLInputElement).value = endOfMonth();
      (document.getElementById("paymentDue") as HTMLInputElement).value = addDays(todayStr, 14);
      document.getElementById("date-warning")?.classList.add("hidden");
      onFormChange();
    });
  }

  checkDates();
}

function checkDates() {
  const issueDate = (document.getElementById("dateOfIssue") as HTMLInputElement)?.value;
  const warning = document.getElementById("date-warning");
  if (!issueDate || !warning) return;

  if (issueDate < today()) {
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
}

// === Logo upload ===
function setupLogoUpload() {
  const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
  const preview = document.getElementById("logo-preview");
  const img = document.getElementById("logo-img") as HTMLImageElement;
  const removeBtn = document.getElementById("btn-remove-logo");

  if (!fileInput) return;

  // Restore saved logo on init
  const savedLogo = loadLogo();
  if (savedLogo && img && preview) {
    img.src = savedLogo;
    preview.classList.remove("hidden");
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      showToast("Please upload a JPEG, PNG, or WebP image", "error");
      fileInput.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast("Image must be less than 3MB", "error");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (img && preview) {
        img.src = dataUri;
        preview.classList.remove("hidden");
        saveLogo(dataUri);
        onFormChange();
      }
    };
    reader.readAsDataURL(file);
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      if (img) img.src = "";
      if (preview) preview.classList.add("hidden");
      if (fileInput) fileInput.value = "";
      removeLogo();
      onFormChange();
    });
  }
}

// === Share & Download ===
function setupShareAndDownload() {
  const shareBtn = document.getElementById("btn-share");
  const downloadBtn = document.getElementById("btn-download");

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const data = extractFormData();
      if (data.logo && data.logo.startsWith("data:")) {
        showToast("Unable to share invoice with logo. Remove the logo first.", "error");
        return;
      }
      try {
        const url = generateShareUrl(data);
        await navigator.clipboard.writeText(url);
        window.history.replaceState(null, "", url);
        showToast("Invoice link copied to clipboard!", "success");
      } catch {
        showToast("Failed to copy link", "error");
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      try {
        const data = extractFormData();
        downloadPdf(data);
        showToast("PDF downloaded!", "success");
      } catch (err) {
        console.error("Download error:", err);
        showToast("Failed to generate PDF", "error");
      }
    });
  }
}

// === Wire up form-wide event listeners ===
function setupFormListeners() {
  const form = document.getElementById("invoice-form");
  if (!form) return;

  form.addEventListener("input", (e) => {
    const target = e.target as HTMLElement;

    if (target.id === "sellerVatNoLabelText") {
      const display = document.getElementById("sellerVatNoLabelDisplay");
      if (display) display.textContent = (target as HTMLInputElement).value || "VAT no";
    }
    if (target.id === "buyerVatNoLabelText") {
      const display = document.getElementById("buyerVatNoLabelDisplay");
      if (display) display.textContent = (target as HTMLInputElement).value || "VAT no";
    }

    onFormChange();
  });

  form.addEventListener("change", (e) => {
    const target = e.target as HTMLElement;

    if (target.id === "template") {
      handleTemplateChange((target as HTMLSelectElement).value);
      onFormChange();
      return;
    }

    if (target.id.startsWith("toggle-")) {
      updateColumnVisibility();
    }

    if (target.id === "dateOfIssue" || target.id === "dateOfService" || target.id === "paymentDue") {
      checkDates();
    }

    onFormChange();
  });

  const addItemBtn = document.getElementById("btn-add-item");
  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      addInvoiceItem();
      recalculateTotal();
    });
  }
}

// === Seller/Buyer profile management ===
function setupProfiles() {
  const sellers = loadSellers();
  setupSellerProfiles(
    sellers,
    (sellerData: SellerData) => {
      const saved: SavedSeller = {
        ...sellerData,
        id: sellerData.id || generateId(),
      };
      // Add to list and save
      const allSellers = loadSellers();
      const existIdx = allSellers.findIndex(s => s.id === saved.id);
      if (existIdx >= 0) allSellers[existIdx] = saved;
      else allSellers.push(saved);
      saveSellers(allSellers);
      showToast("Seller saved!", "success");
      setupProfiles();
      onFormChange();
    },
    (id: string) => {
      if (confirm("Delete this seller profile?")) {
        const allSellers = loadSellers().filter(s => s.id !== id);
        saveSellers(allSellers);
        showToast("Seller deleted", "success");
        setupProfiles();
        onFormChange();
      }
    }
  );

  const buyers = loadBuyers();
  setupBuyerProfiles(
    buyers,
    (buyerData: BuyerData) => {
      const saved: SavedBuyer = {
        ...buyerData,
        id: buyerData.id || generateId(),
      };
      const allBuyers = loadBuyers();
      const existIdx = allBuyers.findIndex(b => b.id === saved.id);
      if (existIdx >= 0) allBuyers[existIdx] = saved;
      else allBuyers.push(saved);
      saveBuyers(allBuyers);
      showToast("Buyer saved!", "success");
      setupProfiles();
      onFormChange();
    },
    (id: string) => {
      if (confirm("Delete this buyer profile?")) {
        const allBuyers = loadBuyers().filter(b => b.id !== id);
        saveBuyers(allBuyers);
        showToast("Buyer deleted", "success");
        setupProfiles();
        onFormChange();
      }
    }
  );
}

// === Default data factory ===
function getDefaultData(): InvoiceData {
  return {
    language: "en",
    dateFormat: "YYYY-MM-DD",
    currency: "EUR",
    template: "default",
    taxLabelText: "VAT",
    invoiceNumberObject: { label: "Invoice", value: "1/2024" },
    dateOfIssue: today(),
    dateOfService: defaultServiceDate(),
    paymentDue: addDays(today(), 14),
    invoiceType: "",
    invoiceTypeFieldIsVisible: true,
    seller: {
      name: "", address: "", vatNo: "", vatNoLabelText: "VAT no",
      vatNoFieldIsVisible: true, email: "",
      accountNumber: "", accountNumberFieldIsVisible: true,
      swiftBic: "", swiftBicFieldIsVisible: true,
      notes: "", notesFieldIsVisible: true,
    },
    buyer: {
      name: "", address: "", vatNo: "", vatNoLabelText: "VAT no",
      vatNoFieldIsVisible: true, email: "",
      notes: "", notesFieldIsVisible: true,
    },
    items: [{
      invoiceItemNumberIsVisible: true,
      name: "", nameFieldIsVisible: true,
      typeOfGTU: "", typeOfGTUFieldIsVisible: true,
      amount: 1, amountFieldIsVisible: true,
      unit: "pcs", unitFieldIsVisible: true,
      netPrice: 0, netPriceFieldIsVisible: true,
      vat: 23, vatFieldIsVisible: true,
      netAmount: 0, netAmountFieldIsVisible: true,
      vatAmount: 0, vatAmountFieldIsVisible: true,
      preTaxAmount: 0, preTaxAmountFieldIsVisible: true,
    }],
    total: 0,
    vatTableSummaryIsVisible: true,
    paymentMethod: "Bank Transfer",
    paymentMethodFieldIsVisible: true,
    notes: "",
    notesFieldIsVisible: true,
    personAuthorizedToReceiveFieldIsVisible: true,
    personAuthorizedToIssueFieldIsVisible: true,
  };
}

// === Main init ===
function init() {
  initForm(onFormChange);
  populateCurrencyDropdown();

  // Check URL for shared data first, then localStorage, then defaults
  let data: InvoiceData | null = loadFromUrl();
  if (!data) data = loadInvoiceData();
  if (!data) data = getDefaultData();

  populateForm(data);

  setupFormListeners();
  setupAccordions();
  setupMobileTabs();
  setupDateHelpers();
  setupLogoUpload();
  setupShareAndDownload();
  setupProfiles();

  // Initial PDF preview
  refreshPreview();

}

document.addEventListener("DOMContentLoaded", init);
