# EasyPDF Lite

A lightweight, **self-hostable** invoice PDF generator. No cloud, no accounts.

**Try it:** [h1d.github.io/easypdf-lite](https://h1d.github.io/easypdf-lite/)

![EasyPDF Lite](screenshot.png)

## Why

Existing open-source invoice generators are surprisingly heavy to self-host — 1 GB+ Docker images, dozens of environment variables, external databases. This one is a 10 MB container that runs on a Raspberry Pi. One command, no config, no database, nothing phones home.

Inspired by [easy-invoice-pdf](https://github.com/VladSez/easy-invoice-pdf).

## What you get

- Invoice form with live PDF preview and one-click download
- 10 languages, 45+ currencies, VAT/tax calculations
- Shareable invoice links (URL-encoded, compressed)
- Saved seller/buyer profiles (localStorage)
- Cyrillic/Unicode support (embedded Open Sans fonts)
- 60 e2e tests

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
