import assert from "node:assert/strict";
import test from "node:test";
import { parseProjects } from "../../scripts/extract-docx.mjs";

// Fixture mirrors the real source document (see the raw dump written to
// .artifacts/extracted.raw.json by the extractor): "عنوان پروژه" / "کارفرما"
// headers, then alternating [title, client] pairs, no dates, no status
// column. The pre-fix parser assumed 4-line rows with an ASCII date in the
// third field and produced 0 rows for this shape.
const DOCUMENT_LINES = [
  "عنوان پروژه",
  "کارفرما",
  "بازرسی فنی جرثقیل ها",
  "معادنماکو",
  "بازرسی فنی مخازن، ارت و جرثقیل",
  "آبهای سطحیتهران",
  "بازرسی فنی مخازن، ارت و جرثقیل",
  "ایران خودرو کرمانشاه",
  "طراحی، اجرا و تعمیر و نگهداری سیستم های اعلان حریق",
  "معدن سرب و رویانگورانزنجان",
];

test("parseProjects pairs title/client rows from the real document shape", () => {
  const { rows, warnings } = parseProjects(DOCUMENT_LINES);
  assert.deepEqual(warnings, []);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows[0], {
    id: "project-01",
    title: "بازرسی فنی جرثقیل ها",
    client: "معادنماکو",
  });
  assert.deepEqual(rows[3], {
    id: "project-04",
    title: "طراحی، اجرا و تعمیر و نگهداری سیستم های اعلان حریق",
    client: "معدن سرب و رویانگورانزنجان",
  });
});

test("parseProjects stops at the services header when present", () => {
  const lines = [...DOCUMENT_LINES, "خدمات شرکت", "بازرسی فنی جرثقیل", "پتروشیمی کرمانشاه"];
  const { rows, warnings } = parseProjects(lines);
  assert.deepEqual(warnings, []);
  assert.equal(rows.length, 4);
  assert.equal(rows[3].title, "طراحی، اجرا و تعمیر و نگهداری سیستم های اعلان حریق");
});

test("parseProjects returns empty rows when the project header is absent", () => {
  assert.deepEqual(parseProjects(["چیزی", "دیگر"]), { rows: [], warnings: [] });
});

test("parseProjects returns empty rows when only headers exist (no rows)", () => {
  assert.deepEqual(parseProjects(["عنوان پروژه", "کارفرما"]), { rows: [], warnings: [] });
});

test("parseProjects ids are sequential and zero-padded", () => {
  const lines = ["عنوان پروژه", "کارفرما", "الف", "ب", "ج", "د"];
  const { rows } = parseProjects(lines);
  assert.deepEqual(
    rows.map((p) => p.id),
    ["project-01", "project-02"],
  );
});

test("parseProjects warns on a dangling title (malformed row, e.g. empty client cell)", () => {
  // An empty client cell collapses to a dangling title after paragraph
  // filtering; the parser must flag it instead of silently dropping or
  // mispairing rows.
  const lines = ["عنوان پروژه", "کارفرما", "پروژه سالم", "کارفرمای سالم", "پروژه بی‌کارفرما"];
  const { rows, warnings } = parseProjects(lines);
  assert.equal(rows.length, 1);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /پروژه بی‌کارفرما/);
  assert.match(warnings[0], /no client line/);
});
