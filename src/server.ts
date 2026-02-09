const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = new URL("../public", import.meta.url).pathname;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".map": "application/json",
};

function getMimeType(path: string): string {
  const ext = path.substring(path.lastIndexOf("."));
  return MIME_TYPES[ext] || "application/octet-stream";
}

// Strict CSP: only allow own origin scripts, styles, images + data:/blob: for
// logo uploads and PDF preview. No inline scripts, no eval.
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "frame-src blob:",
  "object-src blob:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function respond(body: BodyInit, contentType: string): Response {
  return new Response(body, {
    headers: { "Content-Type": contentType, ...SECURITY_HEADERS },
  });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Serve static files from public/
    if (pathname !== "/" && pathname !== "") {
      const filePath = `${PUBLIC_DIR}${pathname}`;
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return respond(file, getMimeType(pathname));
      }
    }

    // SPA fallback: serve index.html
    const indexFile = Bun.file(`${PUBLIC_DIR}/index.html`);
    return respond(indexFile, "text/html");
  },
});

console.log(`EasyPDF Lite running at http://localhost:${PORT}`);
