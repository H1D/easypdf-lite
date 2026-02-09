import type {
  InvoiceData,
  SavedSeller,
  SavedBuyer,
  AccordionState,
} from "../../src/types";
import {
  PDF_DATA_LOCAL_STORAGE_KEY,
  SELLERS_LOCAL_STORAGE_KEY,
  BUYERS_LOCAL_STORAGE_KEY,
  ACCORDION_STATE_LOCAL_STORAGE_KEY,
} from "../../src/types";

export function saveInvoiceData(data: InvoiceData): void {
  localStorage.setItem(PDF_DATA_LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function loadInvoiceData(): InvoiceData | null {
  try {
    const raw = localStorage.getItem(PDF_DATA_LOCAL_STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as InvoiceData;
  } catch {
    return null;
  }
}

export function saveSellers(sellers: SavedSeller[]): void {
  localStorage.setItem(SELLERS_LOCAL_STORAGE_KEY, JSON.stringify(sellers));
}

export function loadSellers(): SavedSeller[] {
  try {
    const raw = localStorage.getItem(SELLERS_LOCAL_STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw) as SavedSeller[];
  } catch {
    return [];
  }
}

export function saveBuyers(buyers: SavedBuyer[]): void {
  localStorage.setItem(BUYERS_LOCAL_STORAGE_KEY, JSON.stringify(buyers));
}

export function loadBuyers(): SavedBuyer[] {
  try {
    const raw = localStorage.getItem(BUYERS_LOCAL_STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw) as SavedBuyer[];
  } catch {
    return [];
  }
}

export function saveAccordionState(state: AccordionState): void {
  localStorage.setItem(
    ACCORDION_STATE_LOCAL_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function loadAccordionState(): AccordionState | null {
  try {
    const raw = localStorage.getItem(ACCORDION_STATE_LOCAL_STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as AccordionState;
  } catch {
    return null;
  }
}

const LOGO_LOCAL_STORAGE_KEY = "easypdf-lite-logo";

export function saveLogo(dataUri: string): void {
  try {
    localStorage.setItem(LOGO_LOCAL_STORAGE_KEY, dataUri);
  } catch {
    // localStorage full — silently ignore
  }
}

export function loadLogo(): string | null {
  return localStorage.getItem(LOGO_LOCAL_STORAGE_KEY);
}

export function removeLogo(): void {
  localStorage.removeItem(LOGO_LOCAL_STORAGE_KEY);
}

export function clearAllData(): void {
  localStorage.removeItem(PDF_DATA_LOCAL_STORAGE_KEY);
  localStorage.removeItem(SELLERS_LOCAL_STORAGE_KEY);
  localStorage.removeItem(BUYERS_LOCAL_STORAGE_KEY);
  localStorage.removeItem(ACCORDION_STATE_LOCAL_STORAGE_KEY);
  localStorage.removeItem(LOGO_LOCAL_STORAGE_KEY);
}
