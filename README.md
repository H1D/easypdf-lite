# EasyPDF Lite

A lightweight, **self-hostable** invoice PDF generator. No cloud, no accounts.

**Try it:** [h1d.github.io/easypdf-lite](https://h1d.github.io/easypdf-lite/)

![EasyPDF Lite](screenshot.png)

## Why

Existing open-source invoice generators are surprisingly heavy to self-host — 1 GB+ Docker images, dozens of environment variables, external databases. This one is a 10 MB container. One command, no config, no database.

Inspired by [easy-invoice-pdf](https://github.com/VladSez/easy-invoice-pdf).

## What you get

- Invoice form with live PDF preview and one-click download
- 10 languages, 45+ currencies, VAT/tax calculations
- Shareable invoice links (URL-encoded, compressed)
- Saved seller/buyer profiles (localStorage)
- Cyrillic/Unicode support (embedded Open Sans fonts)
- 60 e2e tests

<details>
<summary><strong>URL API — generate invoice links programmatically</strong></summary>

The app accepts a `?data=` URL parameter containing a compressed invoice. You can generate these links from any language to create pre-filled invoices — useful for billing systems, CRMs, or automated workflows.

**How it works:** JSON → key compression → lz-string → URL

```js
import LZString from "lz-string";

// Key compression map (same keys the app uses internally)
const KEY_MAP = {
  language: "a", currency: "c", seller: "k", buyer: "l",
  items: "m", name: "A", address: "B", vatNo: "C",
  dateOfIssue: "g", dateOfService: "h", paymentDue: "r",
  amount: "N", unit: "P", netPrice: "R", vat: "T",
  netAmount: "V", vatAmount: "X", preTaxAmount: "Z",
  total: "n", notes: "t",
};

function compressKeys(obj) {
  if (Array.isArray(obj)) return obj.map(compressKeys);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [KEY_MAP[k] ?? k, compressKeys(v)])
    );
  }
  return obj;
}

const invoice = {
  language: "en",
  currency: "USD",
  dateOfIssue: "2026-01-15",
  dateOfService: "2026-01-15",
  paymentDue: "2026-02-15",
  seller: { name: "Acme Corp", address: "123 Main St" },
  buyer:  { name: "Client Inc", address: "456 Oak Ave" },
  items: [
    { name: "Consulting", amount: 10, unit: "hours",
      netPrice: 150, vat: 0, netAmount: 1500, vatAmount: 0, preTaxAmount: 1500 },
  ],
  total: 1500,
};

const compressed = LZString.compressToEncodedURIComponent(
  JSON.stringify(compressKeys(invoice))
);
const url = `https://h1d.github.io/easypdf-lite/?data=${compressed}`;
```

Only include the fields you need — the app fills in defaults for everything else. See [`src/types.ts`](src/types.ts) for the full `InvoiceData` shape.

</details>

## What you don't get

API endpoints, analytics, Sentry, newsletters, about pages, or 200 MB of node_modules.

## Compared to [easy-invoice-pdf](https://github.com/VladSez/easy-invoice-pdf)

| | Original | Lite |
|-|----------|------|
| Runtime | Node.js + Next.js | Bun (build) + nginx (serve) |
| UI | React 19 + shadcn/ui | Vanilla TS |
| Styling | Tailwind CSS | Plain CSS |
| PDF | @react-pdf/renderer | jsPDF (browser-side) |
| Dependencies | 50+ | 3 runtime, 4 dev |
| Client payload | ~2 MB | ~555 KB |
| Memory (idle) | 290 MB | 4 MB |
| Docker image | 6.4 GB | 10 MB |
| node_modules | 1.3 GB | 83 MB |

## Self-hosting

```bash
docker run -d -p 3000:3000 ghcr.io/h1d/easypdf-lite:latest
```

Open `http://localhost:3000`.

## Development

```bash
bun install
bun run dev        # http://localhost:3000

bun run build      # bundle for production
bun run start      # serve production build

# tests
bunx playwright install --with-deps chromium
bun run test
```

## License

MIT
