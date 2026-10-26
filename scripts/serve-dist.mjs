// Minimal static preview server that mirrors GitHub Pages semantics for the
// committed browser smoke: directory URLs without a trailing slash get a 301
// (`/about` → `/about/`), unknown paths serve `404.html` with status 404, and
// only files inside `dist/` are readable. No dependencies; this is not used in
// production (GitHub Pages serves the same `dist/` artifact).
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = normalize(fileURLToPath(new URL("../dist/", import.meta.url)));
const ROOT_PREFIX = ROOT.endsWith(sep) ? ROOT : `${ROOT}${sep}`;
const argValue = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return inline ? inline.slice(name.length + 3) : fallback;
};
const PORT = Number(process.env.PORT ?? argValue("port", 4321));
const HOST = process.env.HOST ?? argValue("host", "127.0.0.1");

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const isFile = async (path) => (await stat(path).catch(() => null))?.isFile() ?? false;
const isDirectory = async (path) => (await stat(path).catch(() => null))?.isDirectory() ?? false;

const sendFile = (response, path) => {
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream",
  });
  createReadStream(path).pipe(response);
};

const notFound = (response) => {
  const page = join(ROOT, "404.html");
  response.writeHead(404, { "Content-Type": TYPES[".html"] });
  createReadStream(page).pipe(response);
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    notFound(response);
    return;
  }

  const target = normalize(join(ROOT, pathname));
  if (target !== ROOT && !target.startsWith(ROOT_PREFIX)) {
    notFound(response);
    return;
  }

  if (await isDirectory(target)) {
    if (!pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${pathname}/${url.search}` });
      response.end();
      return;
    }
    const index = join(target, "index.html");
    if (await isFile(index)) {
      sendFile(response, index);
      return;
    }
  } else if (await isFile(target)) {
    sendFile(response, target);
    return;
  }

  notFound(response);
});

server.listen(PORT, HOST, () => {
  console.log(`ISB static preview: http://${HOST}:${PORT}/ (serving dist/)`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
