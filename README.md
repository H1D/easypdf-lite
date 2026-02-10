# EasyPDF Lite

A lightweight, **self-hostable** invoice PDF generator. No cloud, no accounts.

**Try it:** [h1d.github.io/easypdf-lite](https://h1d.github.io/easypdf-lite/)

![EasyPDF Lite](screenshot.png)

## Why

[easy-invoice-pdf](https://github.com/VladSez/easy-invoice-pdf) is a solid tool but ships with Next.js 15, React 19, and 50+ npm dependencies. That's a lot of machinery for generating a PDF. This project rebuilds the core functionality with a minimal stack so you can run it anywhere in seconds.

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
| Memory (idle) | 290 MB | 17 MB |
| Docker image | 6.4 GB | 63 MB |
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
