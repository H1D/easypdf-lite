// ---------------------------------------------------------------------------
// PDF invoice translations -- plain TypeScript, no Zod / React dependencies.
// Ported from: https://github.com/VladSez/easy-invoice-pdf
// ---------------------------------------------------------------------------

/** Argument accepted by every function-valued translation key. */
export interface CustomTaxLabelArg {
  customTaxLabel: string;
}

/** Stripe-specific invoice translations. */
export interface StripeTranslation {
  invoice: string;
  invoiceNumber: string;
  dateOfIssue: string;
  dateDue: string;
  billTo: string;
  description: string;
  qty: string;
  unitPrice: string;
  amount: string;
  subtotal: string;
  total: string;
  amountDue: string;
  due: string;
  payOnline: string;
  page: string;
  of: string;
}

/** A complete set of translations for one language. */
export interface TranslationSet {
  invoiceNumber: string;
  seller: {
    name: string;
    vatNo: string;
    email: string;
    accountNumber: string;
    swiftBic: string;
  };
  buyer: {
    name: string;
    vatNo: string;
    email: string;
  };
  dateOfIssue: string;
  dateOfService: string;
  invoiceItemsTable: {
    no: string;
    nameOfGoodsService: string;
    typeOfGTU: string;
    amount: string;
    unit: string;
    netPrice: (arg: CustomTaxLabelArg) => string;
    vat: (arg: CustomTaxLabelArg) => string;
    vatAmount: (arg: CustomTaxLabelArg) => string;
    netAmount: (arg: CustomTaxLabelArg) => string;
    preTaxAmount: (arg: CustomTaxLabelArg) => string;
    sum: string;
  };
  paymentInfo: {
    paymentMethod: string;
    paymentDate: string;
  };
  paymentTotals: {
    toPay: string;
    paid: string;
    leftToPay: string;
    amountInWords: string;
  };
  vatSummaryTable: {
    vatRate: (arg: CustomTaxLabelArg) => string;
    net: (arg: CustomTaxLabelArg) => string;
    vat: (arg: CustomTaxLabelArg) => string;
    preTax: (arg: CustomTaxLabelArg) => string;
    total: string;
  };
  personAuthorizedToReceive: string;
  personAuthorizedToIssue: string;
  createdWith: string;
  stripe: StripeTranslation;
}

// ---------------------------------------------------------------------------
// Translations for all 10 supported languages
// ---------------------------------------------------------------------------

export const INVOICE_PDF_TRANSLATIONS: Record<string, TranslationSet> = {
  // -------------------------------------------------------------------------
  // English
  // -------------------------------------------------------------------------
  en: {
    invoiceNumber: "Invoice",
    seller: {
      name: "Seller",
      vatNo: "VAT No",
      email: "e-mail",
      accountNumber: "Account Number",
      swiftBic: "SWIFT/BIC number",
    },
    buyer: {
      name: "Buyer",
      vatNo: "VAT No",
      email: "e-mail",
    },
    dateOfIssue: "Date of issue",
    dateOfService: "Date of sales/of executing the service",
    invoiceItemsTable: {
      no: "No",
      nameOfGoodsService: "Name of goods/service",
      typeOfGTU: "Type of GTU",
      amount: "Amount",
      unit: "Unit",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Net price";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "VAT";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `${customTaxLabel || "VAT"} Amount`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Net Amount";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Pre-tax amount";
      },
      sum: "SUM",
    },
    paymentInfo: {
      paymentMethod: "Payment method",
      paymentDate: "Payment date",
    },
    paymentTotals: {
      toPay: "To pay",
      paid: "Paid",
      leftToPay: "Left to pay",
      amountInWords: "Amount in words",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `${customTaxLabel || "VAT"} rate`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "VAT";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Net";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Pre-tax";
      },
      total: "Total",
    },
    personAuthorizedToReceive: "Person authorized to receive",
    personAuthorizedToIssue: "Person authorized to issue",
    createdWith: "Created with",
    stripe: {
      invoice: "Invoice",
      invoiceNumber: "Invoice number",
      dateOfIssue: "Date of issue",
      dateDue: "Date due",
      billTo: "Bill to",
      description: "Description",
      qty: "Qty",
      unitPrice: "Unit Price",
      amount: "Amount",
      subtotal: "Subtotal",
      total: "Total",
      amountDue: "Amount Due",
      due: "due",
      payOnline: "Pay Online",
      page: "Page",
      of: "of",
    },
  },

  // -------------------------------------------------------------------------
  // Polish
  // -------------------------------------------------------------------------
  pl: {
    invoiceNumber: "Faktura",
    seller: {
      name: "Sprzedawca",
      vatNo: "NIP",
      email: "E-mail",
      accountNumber: "Nr konta",
      swiftBic: "Nr SWIFT/BIC",
    },
    buyer: {
      name: "Nabywca",
      vatNo: "NIP",
      email: "E-mail",
    },
    dateOfIssue: "Data wystawienia",
    dateOfService: "Data sprzedaży / wykonania usługi",
    invoiceItemsTable: {
      no: "lp.",
      nameOfGoodsService: "Nazwa towaru/usługi",
      typeOfGTU: "Typ\n GTU",
      amount: "Ilość",
      unit: "Jm",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Cena\n netto";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "VAT";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Kwota ${customTaxLabel || "VAT"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Kwota\n netto";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Kwota brutto";
      },
      sum: "RAZEM",
    },
    paymentInfo: {
      paymentMethod: "Forma płatności",
      paymentDate: "Termin zapłaty",
    },
    paymentTotals: {
      toPay: "Razem do zapłaty",
      paid: "Zapłacono",
      leftToPay: "Pozostało do zapłaty",
      amountInWords: "Kwota słownie",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Stawka ${customTaxLabel || "VAT"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "VAT";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Netto";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Brutto";
      },
      total: "Razem",
    },
    personAuthorizedToReceive: "Osoba upoważniona do odbioru",
    personAuthorizedToIssue: "Osoba upoważniona do wystawienia",
    createdWith: "Wygenerowano za pomocą",
    stripe: {
      invoice: "Faktura",
      invoiceNumber: "Numer faktury",
      dateOfIssue: "Data wystawienia",
      dateDue: "Termin płatności",
      billTo: "Nabywca",
      description: "Opis",
      qty: "Ilość",
      unitPrice: "Cena jedn.",
      amount: "Kwota",
      subtotal: "Suma częściowa",
      total: "Razem",
      amountDue: "Kwota należna",
      due: "termin",
      payOnline: "Zapłać online",
      page: "Strona",
      of: "z",
    },
  },

  // -------------------------------------------------------------------------
  // German
  // -------------------------------------------------------------------------
  de: {
    invoiceNumber: "Rechnung",
    seller: {
      name: "Verkäufer",
      vatNo: "USt-IdNr.",
      email: "E-Mail",
      accountNumber: "Kontonummer",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Käufer",
      vatNo: "USt-IdNr.",
      email: "E-Mail",
    },
    dateOfIssue: "Ausstellungsdatum",
    dateOfService: "Datum des Verkaufs/der Dienstleistung",
    invoiceItemsTable: {
      no: "Nr",
      nameOfGoodsService: "Bezeichnung der Ware/Dienstleistung",
      typeOfGTU: "GTU-Typ",
      amount: "Menge",
      unit: "Einheit",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Nettopreis";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "MwSt.";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `${customTaxLabel || "MwSt."}-Betrag`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Nettobetrag";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Bruttobetrag";
      },
      sum: "GESAMT",
    },
    paymentInfo: {
      paymentMethod: "Zahlungsart",
      paymentDate: "Zahlungsdatum",
    },
    paymentTotals: {
      toPay: "Gesamtbetrag",
      paid: "Bezahlt",
      leftToPay: "Offener Betrag",
      amountInWords: "Betrag in Worten",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `${customTaxLabel || "MwSt."}-Satz`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "MwSt.";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Netto";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Brutto";
      },
      total: "Gesamt",
    },
    personAuthorizedToReceive: "Empfangsberechtigte Person",
    personAuthorizedToIssue: "Ausstellungsberechtigte Person",
    createdWith: "Erstellt mit",
    stripe: {
      invoice: "Rechnung",
      invoiceNumber: "Rechnungsnummer",
      dateOfIssue: "Ausstellungsdatum",
      dateDue: "Fälligkeitsdatum",
      billTo: "Rechnungsempfänger",
      description: "Beschreibung",
      qty: "Menge",
      unitPrice: "Einzelpreis",
      amount: "Betrag",
      subtotal: "Zwischensumme",
      total: "Gesamtbetrag",
      amountDue: "Fälliger Betrag",
      due: "fällig",
      payOnline: "Online bezahlen",
      page: "Seite",
      of: "von",
    },
  },

  // -------------------------------------------------------------------------
  // Spanish
  // -------------------------------------------------------------------------
  es: {
    invoiceNumber: "Factura",
    seller: {
      name: "Vendedor",
      vatNo: "NIF/CIF",
      email: "E-mail",
      accountNumber: "Número de cuenta",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Comprador",
      vatNo: "NIF/CIF",
      email: "E-mail",
    },
    dateOfIssue: "Fecha de emisión",
    dateOfService: "Fecha de venta/prestación del servicio",
    invoiceItemsTable: {
      no: "N°",
      nameOfGoodsService: "Descripción del producto/servicio",
      typeOfGTU: "Tipo\n GTU",
      amount: "Cantidad",
      unit: "Unidad",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Precio neto";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "IVA";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Importe ${customTaxLabel || "IVA"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Importe\n neto";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Importe bruto";
      },
      sum: "TOTAL",
    },
    paymentInfo: {
      paymentMethod: "Forma de pago",
      paymentDate: "Fecha de pago",
    },
    paymentTotals: {
      toPay: "Total a pagar",
      paid: "Pagado",
      leftToPay: "Pendiente de pago",
      amountInWords: "Importe en letras",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Tipo ${customTaxLabel || "IVA"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "IVA";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Neto";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Bruto";
      },
      total: "Total",
    },
    personAuthorizedToReceive: "Persona autorizada para recibir",
    personAuthorizedToIssue: "Persona autorizada para emitir",
    createdWith: "Creado con",
    stripe: {
      invoice: "Factura",
      invoiceNumber: "Número de factura",
      dateOfIssue: "Fecha de emisión",
      dateDue: "Fecha de vencimiento",
      billTo: "Facturar a",
      description: "Descripción",
      qty: "Cantidad",
      unitPrice: "Precio unitario",
      amount: "Monto",
      subtotal: "Subtotal",
      total: "Total",
      amountDue: "Monto vencido",
      due: "vencimiento",
      payOnline: "Pago en línea",
      page: "Página",
      of: "de",
    },
  },

  // -------------------------------------------------------------------------
  // Portuguese
  // -------------------------------------------------------------------------
  pt: {
    invoiceNumber: "Fatura",
    seller: {
      name: "Vendedor",
      vatNo: "NIF",
      email: "E-mail",
      accountNumber: "Número da conta",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Comprador",
      vatNo: "NIF",
      email: "E-mail",
    },
    dateOfIssue: "Data de emissão",
    dateOfService: "Data de venda/prestação do serviço",
    invoiceItemsTable: {
      no: "N°",
      nameOfGoodsService: "Descrição do produto/serviço",
      typeOfGTU: "Tipo\n GTU",
      amount: "Quantidade",
      unit: "Unidade",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Preço\n líquido";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "IVA";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Valor ${customTaxLabel || "IVA"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Valor\n líquido";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Valor bruto";
      },
      sum: "TOTAL",
    },
    paymentInfo: {
      paymentMethod: "Forma de pagamento",
      paymentDate: "Data de pagamento",
    },
    paymentTotals: {
      toPay: "Total a pagar",
      paid: "Pago",
      leftToPay: "Valor em falta",
      amountInWords: "Valor por extenso",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Taxa ${customTaxLabel || "IVA"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "IVA";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Líquido";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Bruto";
      },
      total: "Total",
    },
    personAuthorizedToReceive: "Pessoa autorizada a receber",
    personAuthorizedToIssue: "Pessoa autorizada a emitir",
    createdWith: "Criado com",
    stripe: {
      invoice: "Fatura",
      invoiceNumber: "Número da fatura",
      dateOfIssue: "Data de emissão",
      dateDue: "Data de vencimento",
      billTo: "Cobrar de",
      description: "Descrição",
      qty: "Quantidade",
      unitPrice: "Preço unitário",
      amount: "Valor",
      subtotal: "Subtotal",
      total: "Total",
      amountDue: "Valor vencido",
      due: "vencimento",
      payOnline: "Pagamento online",
      page: "Página",
      of: "de",
    },
  },

  // -------------------------------------------------------------------------
  // Russian
  // -------------------------------------------------------------------------
  ru: {
    invoiceNumber: "Счёт",
    seller: {
      name: "Продавец",
      vatNo: "ИНН",
      email: "Эл. почта",
      accountNumber: "Номер счёта",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Покупатель",
      vatNo: "ИНН",
      email: "Эл. почта",
    },
    dateOfIssue: "Дата выставления",
    dateOfService: "Дата продажи/оказания услуги",
    invoiceItemsTable: {
      no: "№",
      nameOfGoodsService: "Наименование товара/услуги",
      typeOfGTU: "Тип\n GTU",
      amount: "Количество",
      unit: "Ед.\n изм.",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Цена без ${customTaxLabel || "НДС"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "НДС";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Сумма ${customTaxLabel || "НДС"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Сумма без ${customTaxLabel || "НДС"}`;
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Сумма с ${customTaxLabel || "НДС"}`;
      },
      sum: "ИТОГО",
    },
    paymentInfo: {
      paymentMethod: "Способ оплаты",
      paymentDate: "Дата оплаты",
    },
    paymentTotals: {
      toPay: "Итого к оплате",
      paid: "Оплачено",
      leftToPay: "Осталось оплатить",
      amountInWords: "Сумма прописью",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Ставка ${customTaxLabel || "НДС"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "НДС";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Без ${customTaxLabel || "НДС"}`;
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `С ${customTaxLabel || "НДС"}`;
      },
      total: "Всего",
    },
    personAuthorizedToReceive: "Уполномоченное лицо на получение",
    personAuthorizedToIssue: "Уполномоченное лицо на выставление",
    createdWith: "Создано с помощью",
    stripe: {
      invoice: "Счет",
      invoiceNumber: "Номер счета",
      dateOfIssue: "Дата выставления",
      dateDue: "Дата оплаты",
      billTo: "Плательщик",
      description: "Описание",
      qty: "Количество",
      unitPrice: "Цена за единицу",
      amount: "Сумма",
      subtotal: "Промежуточный итог",
      total: "Итого",
      amountDue: "Сумма к оплате",
      due: "оплатить до",
      payOnline: "Оплатить онлайн",
      page: "Страница",
      of: "из",
    },
  },

  // -------------------------------------------------------------------------
  // Ukrainian
  // -------------------------------------------------------------------------
  uk: {
    invoiceNumber: "Рахунок",
    seller: {
      name: "Продавець",
      vatNo: "ЄДРПОУ",
      email: "Ел. пошта",
      accountNumber: "Номер рахунку",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Покупець",
      vatNo: "ЄДРПОУ",
      email: "Ел. пошта",
    },
    dateOfIssue: "Дата виставлення",
    dateOfService: "Дата продажу/надання послуги",
    invoiceItemsTable: {
      no: "№",
      nameOfGoodsService: "Найменування товару/послуги",
      typeOfGTU: "Тип\n GTU",
      amount: "Кількість",
      unit: "Од.\n вим.",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Ціна без ${customTaxLabel || "ПДВ"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "ПДВ";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Сума ${customTaxLabel || "ПДВ"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Сума без ${customTaxLabel || "ПДВ"}`;
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Сума з ${customTaxLabel || "ПДВ"}`;
      },
      sum: "РАЗОМ",
    },
    paymentInfo: {
      paymentMethod: "Спосіб оплати",
      paymentDate: "Дата оплати",
    },
    paymentTotals: {
      toPay: "Разом до сплати",
      paid: "Сплачено",
      leftToPay: "Залишилось сплатити",
      amountInWords: "Сума прописом",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Ставка ${customTaxLabel || "ПДВ"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "ПДВ";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Без ${customTaxLabel || "ПДВ"}`;
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `З ${customTaxLabel || "ПДВ"}`;
      },
      total: "Всього",
    },
    personAuthorizedToReceive: "Уповноважена особа на отримання",
    personAuthorizedToIssue: "Уповноважена особа на виставлення",
    createdWith: "Створено за допомогою",
    stripe: {
      invoice: "Рахунок",
      invoiceNumber: "Номер рахунку",
      dateOfIssue: "Дата виставлення",
      dateDue: "Дата оплати",
      billTo: "Платник",
      description: "Опис",
      qty: "Кількість",
      unitPrice: "Ціна за одиницю",
      amount: "Сума",
      subtotal: "Проміжний ітог",
      total: "Всього",
      amountDue: "Сума до сплати",
      due: "оплатити до",
      payOnline: "Оплатити онлайн",
      page: "Сторінка",
      of: "з",
    },
  },

  // -------------------------------------------------------------------------
  // French
  // -------------------------------------------------------------------------
  fr: {
    invoiceNumber: "Facture",
    seller: {
      name: "Vendeur",
      vatNo: "N° TVA",
      email: "E-mail",
      accountNumber: "Numéro de compte",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Acheteur",
      vatNo: "N° TVA",
      email: "E-mail",
    },
    dateOfIssue: "Date d'émission",
    dateOfService: "Date de vente/prestation de service",
    invoiceItemsTable: {
      no: "N°",
      nameOfGoodsService: "Désignation du produit/service",
      typeOfGTU: "Type\n GTU",
      amount: "Quantité",
      unit: "Unité",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Prix HT";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "TVA";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Montant de la ${customTaxLabel || "TVA"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Montant\n HT";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Total TTC";
      },
      sum: "TOTAL",
    },
    paymentInfo: {
      paymentMethod: "Mode de paiement",
      paymentDate: "Date de paiement",
    },
    paymentTotals: {
      toPay: "Total à payer",
      paid: "Payé",
      leftToPay: "Reste à payer",
      amountInWords: "Montant en lettres",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Taux ${customTaxLabel || "TVA"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "TVA";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "HT";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "TTC";
      },
      total: "Total",
    },
    personAuthorizedToReceive: "Personne autorisée à recevoir",
    personAuthorizedToIssue: "Personne autorisée à émettre",
    createdWith: "Créé avec",
    stripe: {
      invoice: "Facture",
      invoiceNumber: "Numéro de facture",
      dateOfIssue: "Date d'émission",
      dateDue: "Date d'échéance",
      billTo: "Facturé à",
      description: "Description",
      qty: "Quantité",
      unitPrice: "Prix unitaire",
      amount: "Montant",
      subtotal: "Sous-total",
      total: "Total",
      amountDue: "Montant échéant",
      due: "échéance",
      payOnline: "Payer en ligne",
      page: "Page",
      of: "de",
    },
  },

  // -------------------------------------------------------------------------
  // Italian
  // -------------------------------------------------------------------------
  it: {
    invoiceNumber: "Fattura",
    seller: {
      name: "Venditore",
      vatNo: "P.IVA",
      email: "E-mail",
      accountNumber: "Numero di conto",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Acquirente",
      vatNo: "P.IVA",
      email: "E-mail",
    },
    dateOfIssue: "Data di emissione",
    dateOfService: "Data di vendita/prestazione del servizio",
    invoiceItemsTable: {
      no: "N°",
      nameOfGoodsService: "Descrizione del prodotto/servizio",
      typeOfGTU: "Tipo\n GTU",
      amount: "Quantità",
      unit: "Unità",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Prezzo netto";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "IVA";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Importo ${customTaxLabel || "IVA"}`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Importo\n netto";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Importo lordo";
      },
      sum: "TOTALE",
    },
    paymentInfo: {
      paymentMethod: "Metodo di pagamento",
      paymentDate: "Data di pagamento",
    },
    paymentTotals: {
      toPay: "Totale da pagare",
      paid: "Pagato",
      leftToPay: "Rimanente da pagare",
      amountInWords: "Importo in lettere",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `Aliquota ${customTaxLabel || "IVA"}`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "IVA";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Netto";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Lordo";
      },
      total: "Totale",
    },
    personAuthorizedToReceive: "Persona autorizzata a ricevere",
    personAuthorizedToIssue: "Persona autorizzata a emettere",
    createdWith: "Creato con",
    stripe: {
      invoice: "Fattura",
      invoiceNumber: "Numero di fattura",
      dateOfIssue: "Data di emissione",
      dateDue: "Data di scadenza",
      billTo: "Fatturare a",
      description: "Descrizione",
      qty: "Quantità",
      unitPrice: "Prezzo unitario",
      amount: "Importo",
      subtotal: "Totale parziale",
      total: "Totale",
      amountDue: "Importo scaduto",
      due: "scadenza",
      payOnline: "Pagare online",
      page: "Pagina",
      of: "di",
    },
  },

  // -------------------------------------------------------------------------
  // Dutch
  // -------------------------------------------------------------------------
  nl: {
    invoiceNumber: "Factuur",
    seller: {
      name: "Verkoper",
      vatNo: "BTW-nr.",
      email: "E-mail",
      accountNumber: "Rekeningnummer",
      swiftBic: "SWIFT/BIC",
    },
    buyer: {
      name: "Koper",
      vatNo: "BTW-nr.",
      email: "E-mail",
    },
    dateOfIssue: "Uitgiftedatum",
    dateOfService: "Datum van verkoop/dienstverlening",
    invoiceItemsTable: {
      no: "Nr",
      nameOfGoodsService: "Omschrijving product/dienst",
      typeOfGTU: "GTU-type",
      amount: "Aantal",
      unit: "Eenheid",
      netPrice: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Netto prijs";
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "BTW";
      },
      vatAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `${customTaxLabel || "BTW"}-bedrag`;
      },
      netAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Nettobedrag";
      },
      preTaxAmount: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Brutobedrag";
      },
      sum: "TOTAAL",
    },
    paymentInfo: {
      paymentMethod: "Betaalmethode",
      paymentDate: "Betaaldatum",
    },
    paymentTotals: {
      toPay: "Te betalen",
      paid: "Betaald",
      leftToPay: "Nog te betalen",
      amountInWords: "Bedrag in woorden",
    },
    vatSummaryTable: {
      vatRate: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return `${customTaxLabel || "BTW"}-tarief`;
      },
      vat: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return customTaxLabel || "BTW";
      },
      net: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Netto";
      },
      preTax: ({ customTaxLabel }: CustomTaxLabelArg) => {
        return "Bruto";
      },
      total: "Totaal",
    },
    personAuthorizedToReceive: "Persoon gemachtigd voor ontvangst",
    personAuthorizedToIssue: "Persoon gemachtigd voor uitgifte",
    createdWith: "Gemaakt met",
    stripe: {
      invoice: "Factuur",
      invoiceNumber: "Factuurnummer",
      dateOfIssue: "Uitgiftedatum",
      dateDue: "Vervaldatum",
      billTo: "Factuur aan",
      description: "Omschrijving",
      qty: "Aantal",
      unitPrice: "Netto prijs",
      amount: "Bedrag",
      subtotal: "Subtotaal",
      total: "Totaal",
      amountDue: "Bedrag te betalen",
      due: "verval",
      payOnline: "Online betalen",
      page: "Pagina",
      of: "van",
    },
  },
};
