import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const DOCX_PATH = process.env.DOCX_PATH || "C:/Users/Danial/Downloads/1_21355573937.docx";
const CONTENT_DIR = path.resolve("src/content");

const PROJECT_HEADER = "\u0639\u0646\u0648\u0627\u0646 \u067e\u0631\u0648\u0698\u0647";
const SERVICES_HEADER = "\u062e\u062f\u0645\u0627\u062a \u0634\u0631\u06a9\u062a";
const CONTINUE_TEXT = "\u0627\u062f\u0627\u0645\u0647 \u062f\u0627\u0631\u062f";
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

const looksLikeDate = (value) => /^\d{1,4}\/\d{1,2}\/\d{1,4}$/.test(value);

const parseProjects = (lines) => {
  const start = lines.findIndex((line) => line.includes(PROJECT_HEADER));
  if (start === -1) return [];

  const end = lines.findIndex((line, idx) => idx > start && line === SERVICES_HEADER);
  const raw = lines.slice(start + 4, end > -1 ? end : lines.length).filter(Boolean);

  const rows = [];
  for (let i = 0; i + 3 < raw.length; i += 4) {
    const [title, client, startDateFa, duration] = raw.slice(i, i + 4);
    if (!looksLikeDate(startDateFa)) continue;
    const status = duration.includes(CONTINUE_TEXT) ? "in_progress" : "completed";

    rows.push({
      id: `project-${String(rows.length + 1).padStart(2, "0")}`,
      title,
      client,
      location: null,
      startDateFa,
      endDateFa: status === "completed" ? duration : null,
      status,
      summary: `${title} - ${client}`,
      tags: status === "completed" ? ["پایان یافته"] : ["در حال انجام"],
    });
  }

  return rows;
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
  const buffer = await fs.readFile(DOCX_PATH);
  const zip = await JSZip.loadAsync(buffer);
  const xmlBytes = await zip.file("word/document.xml").async("uint8array");
  const xml = textDecoder.decode(xmlBytes);
  const paragraphs = extractParagraphs(xml);
  const lines = dedupeAdjacent(paragraphs);

  const company = await loadJson("company.json");
  const contacts = await loadJson("contacts.json");
  const services = await loadJson("services.json");
  const existingProjects = await loadJson("projects.json");

  const parsedProjects = parseProjects(lines);
  const parsedEmail = parseEmail(lines);
  const parsedAbout = lines.find((line) => line.startsWith(COMPANY_PREFIX));

  if (parsedEmail) {
    contacts.email = parsedEmail;
  }

  if (parsedAbout && typeof parsedAbout === "string") {
    company.about = parsedAbout;
  }

  const projects = existingProjects.length > 0 ? existingProjects : parsedProjects;

  await writeJson("company.json", company);
  await writeJson("contacts.json", contacts);
  await writeJson("services.json", services);
  await writeJson("projects.json", projects);
  await writeJson("extracted.raw.json", { lines, generatedAt: new Date().toISOString() });

  console.log(`Extraction complete. Updated content in: ${CONTENT_DIR}`);
  console.log(`Detected paragraphs: ${lines.length}`);
  console.log(`Detected projects: ${parsedProjects.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
