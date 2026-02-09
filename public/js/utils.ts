import type { SupportedDateFormat } from "../../src/types";

const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: "en-US", pl: "pl-PL", de: "de-DE", es: "es-ES", pt: "pt-PT",
  ru: "ru-RU", uk: "uk-UA", fr: "fr-FR", it: "it-IT", nl: "nl-NL",
};

export function formatCurrency(amount: number, currency: string, language: string): string {
  const locale = LANGUAGE_TO_LOCALE[language] || "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num
    .toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .replaceAll(",", " ");
}

export function formatDate(dateStr: string, format: SupportedDateFormat, language?: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear().toString();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const locale = LANGUAGE_TO_LOCALE[language ?? "en"] || "en-US";

  switch (format) {
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "D MMMM YYYY": {
      const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(d);
      return `${d.getDate()} ${monthName} ${yyyy}`;
    }
    case "MMMM D, YYYY": {
      const monthName = new Intl.DateTimeFormat(locale, { month: "long" }).format(d);
      return `${monthName} ${d.getDate()}, ${yyyy}`;
    }
    case "DD.MM.YYYY":
      return `${dd}.${mm}.${yyyy}`;
    case "DD-MM-YYYY":
      return `${dd}-${mm}-${yyyy}`;
    case "YYYY.MM.DD":
      return `${yyyy}.${mm}.${dd}`;
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function endOfMonth(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`;
}

/**
 * Default date of service: last day of previous month,
 * unless today is within 5 days of the current month's end,
 * in which case use the current month's last day.
 */
export function defaultServiceDate(): string {
  const d = new Date();
  const currentMonthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const daysUntilEnd = currentMonthEnd.getDate() - d.getDate();

  if (daysUntilEnd < 5) {
    return `${currentMonthEnd.getFullYear()}-${pad(currentMonthEnd.getMonth() + 1)}-${pad(currentMonthEnd.getDate())}`;
  }

  const prevMonthEnd = new Date(d.getFullYear(), d.getMonth(), 0);
  return `${prevMonthEnd.getFullYear()}-${pad(prevMonthEnd.getMonth() + 1)}-${pad(prevMonthEnd.getDate())}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
