export const SUPPORTED_LANGUAGES = ["en", "pl", "de", "es", "pt", "ru", "uk", "fr", "it", "nl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_TO_LABEL: Record<SupportedLanguage, string> = {
  en: "English", pl: "Polish", de: "German", es: "Spanish", pt: "Portuguese",
  ru: "Russian", uk: "Ukrainian", fr: "French", it: "Italian", nl: "Dutch",
};

export const SUPPORTED_CURRENCIES = [
  "EUR","USD","PLN","GBP","JPY","AUD","CAD","CHF","CNY","HKD","SGD","SEK","NOK","DKK","NZD",
  "INR","KRW","MXN","BRL","ZAR","TRY","RUB","THB","MYR","IDR","PHP","VND",
  "AED","SAR","ILS","QAR","KWD","BHD","OMR","JOD","EGP","LBP","IQD",
  "CZK","HUF","RON","BGN","HRK","RSD","UAH","BYN","MDL","GEL","KZT",
  "ARS","CLP","COP","PEN","UYU","BOB",
  "PKR","BDT","LKR","NPR",
  "NGN","KES","GHS","ETB","MAD","TND",
  "ISK","TWD",
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  EUR:"€",USD:"$",GBP:"£",PLN:"zł",JPY:"¥",AUD:"$",CAD:"$",CHF:"Fr",CNY:"¥",
  HKD:"HK$",SGD:"S$",SEK:"kr",NOK:"kr",DKK:"kr",NZD:"NZ$",
  INR:"₹",KRW:"₩",MXN:"$",BRL:"R$",ZAR:"R",TRY:"₺",RUB:"₽",
  THB:"฿",MYR:"RM",IDR:"Rp",PHP:"₱",VND:"₫",
  AED:"AED",SAR:"SAR",ILS:"₪",QAR:"QR",KWD:"KWD",BHD:"BHD",OMR:"OMR",JOD:"JOD",
  EGP:"EGP",LBP:"LBP",IQD:"IQD",
  CZK:"Kč",HUF:"Ft",RON:"lei",BGN:"лв",HRK:"kn",RSD:"дін",UAH:"₴",BYN:"Br",MDL:"L",GEL:"₾",KZT:"₸",
  ARS:"$",CLP:"$",COP:"$",PEN:"S/",UYU:"$",BOB:"Bs",
  PKR:"₨",BDT:"৳",LKR:"Rs",NPR:"Rs",
  NGN:"₦",KES:"KSh",GHS:"₵",ETB:"Br",MAD:"MAD",TND:"TND",
  ISK:"kr",TWD:"NT$",
};

export const CURRENCY_TO_LABEL: Record<SupportedCurrency, string> = {
  EUR:"Euro",USD:"United States Dollar",GBP:"British Pound Sterling",PLN:"Polish Złoty",
  JPY:"Japanese Yen",AUD:"Australian Dollar",CAD:"Canadian Dollar",CHF:"Swiss Franc",
  CNY:"Chinese Yuan Renminbi",HKD:"Hong Kong Dollar",SGD:"Singapore Dollar",
  SEK:"Swedish Krona",NOK:"Norwegian Krone",DKK:"Danish Krone",NZD:"New Zealand Dollar",
  INR:"Indian Rupee",KRW:"South Korean Won",MXN:"Mexican Peso",BRL:"Brazilian Real",
  ZAR:"South African Rand",TRY:"Turkish Lira",RUB:"Russian Ruble",
  THB:"Thai Baht",MYR:"Malaysian Ringgit",IDR:"Indonesian Rupiah",PHP:"Philippine Peso",
  VND:"Vietnamese Dong",AED:"UAE Dirham",SAR:"Saudi Riyal",ILS:"Israeli New Shekel",
  QAR:"Qatari Riyal",KWD:"Kuwaiti Dinar",BHD:"Bahraini Dinar",OMR:"Omani Rial",
  JOD:"Jordanian Dinar",EGP:"Egyptian Pound",LBP:"Lebanese Pound",IQD:"Iraqi Dinar",
  CZK:"Czech Koruna",HUF:"Hungarian Forint",RON:"Romanian Leu",BGN:"Bulgarian Lev",
  HRK:"Croatian Kuna",RSD:"Serbian Dinar",UAH:"Ukrainian Hryvnia",BYN:"Belarusian Ruble",
  MDL:"Moldovan Leu",GEL:"Georgian Lari",KZT:"Kazakhstani Tenge",
  ARS:"Argentine Peso",CLP:"Chilean Peso",COP:"Colombian Peso",PEN:"Peruvian Sol",
  UYU:"Uruguayan Peso",BOB:"Bolivian Boliviano",
  PKR:"Pakistani Rupee",BDT:"Bangladeshi Taka",LKR:"Sri Lankan Rupee",NPR:"Nepalese Rupee",
  NGN:"Nigerian Naira",KES:"Kenyan Shilling",GHS:"Ghanaian Cedi",ETB:"Ethiopian Birr",
  MAD:"Moroccan Dirham",TND:"Tunisian Dinar",ISK:"Icelandic Króna",TWD:"New Taiwan Dollar",
};

export const SUPPORTED_DATE_FORMATS = [
  "YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY","D MMMM YYYY","MMMM D, YYYY","DD.MM.YYYY","DD-MM-YYYY","YYYY.MM.DD",
] as const;
export type SupportedDateFormat = (typeof SUPPORTED_DATE_FORMATS)[number];

export const SUPPORTED_TEMPLATES = ["default", "stripe"] as const;
export type InvoiceTemplate = (typeof SUPPORTED_TEMPLATES)[number];

export const TEMPLATE_TO_LABEL: Record<InvoiceTemplate, string> = {
  default: "Default Template",
  stripe: "Stripe Template",
};

export interface InvoiceItem {
  invoiceItemNumberIsVisible: boolean;
  name: string;
  nameFieldIsVisible: boolean;
  typeOfGTU: string;
  typeOfGTUFieldIsVisible: boolean;
  amount: number;
  amountFieldIsVisible: boolean;
  unit: string;
  unitFieldIsVisible: boolean;
  netPrice: number;
  netPriceFieldIsVisible: boolean;
  vat: number | string;
  vatFieldIsVisible: boolean;
  netAmount: number;
  netAmountFieldIsVisible: boolean;
  vatAmount: number;
  vatAmountFieldIsVisible: boolean;
  preTaxAmount: number;
  preTaxAmountFieldIsVisible: boolean;
  itemNotes?: string;
  itemNotesFieldIsVisible?: boolean;
  customFields?: Record<string, string>;
}

export interface CustomColumnDef {
  id: string;
  header: string;
  visible: boolean;
}

export interface SellerData {
  id?: string;
  name: string;
  address: string;
  vatNo?: string;
  vatNoLabelText: string;
  vatNoFieldIsVisible: boolean;
  email: string;
  accountNumber?: string;
  accountNumberFieldIsVisible: boolean;
  swiftBic?: string;
  swiftBicFieldIsVisible: boolean;
  notes?: string;
  notesFieldIsVisible: boolean;
}

export interface BuyerData {
  id?: string;
  name: string;
  address: string;
  vatNo?: string;
  vatNoLabelText: string;
  vatNoFieldIsVisible: boolean;
  email: string;
  notes?: string;
  notesFieldIsVisible: boolean;
}

export interface InvoiceData {
  language: SupportedLanguage;
  dateFormat: SupportedDateFormat;
  currency: SupportedCurrency;
  template: InvoiceTemplate;
  logo?: string;
  invoiceNumberObject?: { label: string; value: string };
  taxLabelText: string;
  dateOfIssue: string;
  dateOfService: string;
  invoiceType?: string;
  invoiceTypeFieldIsVisible: boolean;
  seller: SellerData;
  buyer: BuyerData;
  items: InvoiceItem[];
  total: number;
  vatTableSummaryIsVisible: boolean;
  paymentMethod?: string;
  paymentMethodFieldIsVisible: boolean;
  paymentDue: string;
  stripePayOnlineUrl?: string;
  notes?: string;
  notesFieldIsVisible: boolean;
  personAuthorizedToReceiveFieldIsVisible: boolean;
  personAuthorizedToIssueFieldIsVisible: boolean;
  customColumns?: CustomColumnDef[];
}

export interface SavedSeller extends SellerData {
  id: string;
}

export interface SavedBuyer extends BuyerData {
  id: string;
}

export interface AccordionState {
  general: boolean;
  seller: boolean;
  buyer: boolean;
  invoiceItems: boolean;
}

// Storage keys
export const PDF_DATA_LOCAL_STORAGE_KEY = "EASY_INVOICE_PDF_DATA";
export const SELLERS_LOCAL_STORAGE_KEY = "EASY_INVOICE_SELLERS_DATA";
export const BUYERS_LOCAL_STORAGE_KEY = "EASY_INVOICE_BUYERS_DATA";
export const ACCORDION_STATE_LOCAL_STORAGE_KEY = "EASY_INVOICE_ACCORDION_STATE";
