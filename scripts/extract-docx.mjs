import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";

// Source document lives in docs/private/ (gitignored; kept out of the public
// repository). Override with DOCX_PATH for a different file.
const DEFAULT_DOCX = path.join("docs", "private", "رزومه شرکت ISB..docx");
const DOCX_PATH = process.env.DOCX_PATH || DEFAULT_DOCX;
const CONTENT_DIR = path.resolve("src/content");
const RAW_ARTIFACT = path.resolve(".artifacts", "extracted.raw.json");

const PROJECT_HEADER = "\u0639\u0646\u0648\u0627\u0646 \u067e\u0631\u0648\u0698\u0647";
const CLIENT_HEADER = "\u06a9\u0627\u0631\u0641\u0631\u0645\u0627";
const SERVICES_HEADER = "\u062e\u062f\u0645\u0627\u062a \u0634\u0631\u06a9\u062a";
const COMPANY_PREFIX =
  "\u0634\u0631\u06a9\u062a \u0627\u06cc\u0645\u0646 \u0635\u0646\u0639\u062a \u0628\u0627\u062a\u0627\u0628";

const textDecoder = new TextDecoder("utf-8");

const normalize = (value) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .trim();

const decodeXml = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));

const extractParagraphs = (xml) => {
  const paragraphs = [];
  const paragraphMatches = xml.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];

  for (const paragraphXml of paragraphMatches) {
    const textMatches = [...paragraphXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)];
    const joined = textMatches.map((match) => decodeXml(match[1] || "")).join("");
    const cleaned = normalize(joined);
    if (cleaned) paragraphs.push(cleaned);
  }

  return paragraphs;
};

const dedupeAdjacent = (items) => {
  const out = [];
  for (const item of items) {
    if (!item) continue;
    if (out.length === 0 || out[out.length - 1] !== item) out.push(item);
  }
  return out;
};

/**
 * Parses the project table from the company DOCX.
 *
 * The source document's project section is a two-column list:
 *   "عنوان پروژه" / "کارفرما" header, then alternating
 *   [project title, client] rows with no dates and no status column.
 * Each field is one paragraph. Parsing stops at the services header
 * when present (older revisions of the document include it).
 *
 * @param {string[]} lines normalized, adjacent-deduped paragraphs
 * @returns {{ rows: Array<{id: string, title: string, client: string}>, warnings: string[] }}
 */
export const parseProjects = (lines) => {
  const start = lines.findIndex((line) => line.includes(PROJECT_HEADER));
  if (start === -1) return { rows: [], warnings: [] };

  const end = lines.findIndex((line, idx) => idx > start && line.includes(SERVICES_HEADER));
  const rows = [];
  const warnings = [];

  for (let i = start + 1; i < (end > -1 ? end : lines.length); i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (line === CLIENT_HEADER) continue; // section header row, not a project

    const title = line;
    const client = lines[i + 1] && !lines[i + 1].includes(SERVICES_HEADER) ? lines[i + 1] : "";
    if (client) {
      rows.push({
        id: `project-${String(rows.length + 1).padStart(2, "0")}`,
        title,
        client,
      });
      i += 1; // consume the client row
    } else {
      // A dangling title with no client means the document's table is
      // malformed (e.g. an empty client cell collapsed by paragraph
      // filtering). Do not guess — flag it so extraction stops being silent.
      warnings.push(`project row "${title}" has no client line; check the source document`);
    }
  }

  return { rows, warnings };
};

const parseEmail = (lines) => {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  for (const line of lines) {
    const match = line.match(emailRegex);
    if (match) return match[0].toLowerCase();
  }
  return null;
};

const loadJson = async (fileName) => {
  const filePath = path.join(CONTENT_DIR, fileName);
  const value = await fs.readFile(filePath, "utf8");
  return JSON.parse(value);
};

const writeJson = async (fileName, value) => {
  const filePath = path.join(CONTENT_DIR, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const main = async () => {
  let buffer;
  try {
    buffer = await fs.readFile(DOCX_PATH);
  } catch (error) {
    console.error(
      `Cannot read the source document at "${DOCX_PATH}".\n` +
        "Provide the DOCX path via the DOCX_PATH environment variable, e.g.:\n" +
        '  DOCX_PATH="/path/to/resume.docx" npm run extract-content',
    );
    process.exit(1);
  }

  const zip = await JSZip.loadAsync(buffer);
  const xmlBytes = await zip.file("word/document.xml").async("uint8array");
  const xml = textDecoder.decode(xmlBytes);
  const paragraphs = extractParagraphs(xml);
  const lines = dedupeAdjacent(paragraphs);

  const company = await loadJson("company.json");
  const contacts = await loadJson("contacts.json");
  const services = await loadJson("services.json");
  const existingProjects = await loadJson("projects.json");

  const parsed = parseProjects(lines);
  const parsedProjects = parsed.rows;
  for (const warning of parsed.warnings) {
    console.warn(`WARNING: ${warning}`);
  }
  const parsedEmail = parseEmail(lines);
  const parsedAbout = lines.find((line) => line.startsWith(COMPANY_PREFIX));

  if (parsedEmail) {
    contacts.email = parsedEmail;
  }

  if (parsedAbout && typeof parsedAbout === "string") {
    company.about = parsedAbout;
  }

  // The DOCX is the source of truth for the project portfolio — but never
  // overwrite a non-empty projects.json with an empty parse (that would mean
  // the parser does not understand the document's shape anymore).
  let projects = parsedProjects;
  if (parsedProjects.length === 0) {
    if (existingProjects.length > 0) {
      console.warn(
        `WARNING: parsed 0 projects from the source document; keeping the existing ` +
          `${existingProjects.length} entries in projects.json unchanged. ` +
          "If the document format changed, update scripts/extract-docx.mjs parseProjects.",
      );
      projects = existingProjects;
    } else {
      projects = [];
    }
  }

  await writeJson("company.json", company);
  await writeJson("contacts.json", contacts);
  await writeJson("services.json", services);
  await writeJson("projects.json", projects);
  await fs.mkdir(path.dirname(RAW_ARTIFACT), { recursive: true });
  await fs.writeFile(RAW_ARTIFACT, `${JSON.stringify({ lines, generatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");

  console.log(`Extraction complete. Updated content in: ${CONTENT_DIR}`);
  console.log(`Raw extraction artifact: ${RAW_ARTIFACT}`);
  console.log(`Detected paragraphs: ${lines.length}`);
  console.log(`Detected projects: ${parsedProjects.length}`);
  if (parsedProjects.length > 0) {
    console.log(`projects.json: replaced ${existingProjects.length} entries with ${parsedProjects.length} fresh ones.`);
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
