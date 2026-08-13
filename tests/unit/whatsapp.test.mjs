import assert from "node:assert/strict";
import test from "node:test";
// Direct .ts import requires Node's built-in type stripping (default since
// Node 22.18; the repo floor is 22.19 per CONTRIBUTING.md and CI pins 22.23.2).
import { buildWhatsAppMessage, buildWhatsAppUrl, waMeHref } from "../../src/lib/whatsapp.ts";

const payload = {
  fullName: "علی رضایی",
  companyName: "پتروشیمی کرمانشاه",
  phone: "09128823933",
  subject: "استعلام بازرسی",
  message: "سلام، لطفا تماس بگیرید.",
};

test("buildWhatsAppMessage renders the Persian template with fallbacks for empty fields", () => {
  const message = buildWhatsAppMessage({ fullName: "", companyName: "", phone: "", subject: "", message: "" });
  const lines = message.split("\n");
  assert.equal(lines[0], "سلام وقت بخیر،");
  assert.equal(lines[2], "نام: -");
  assert.equal(lines[6], "متن پیام:");
  assert.equal(lines[7], "-");
});

test("buildWhatsAppMessage keeps provided field values", () => {
  const message = buildWhatsAppMessage(payload);
  assert.match(message, /نام: علی رضایی/);
  assert.match(message, /شماره تماس: 09128823933/);
  assert.match(message, /متن پیام:\nسلام، لطفا تماس بگیرید\./);
});

test("buildWhatsAppUrl produces an encoded wa.me deep link from digits", () => {
  const url = buildWhatsAppUrl("+98 912 882 3933", payload);
  assert.match(url, /^https:\/\/wa\.me\/989128823933\?text=/);
  assert.match(url, /%D8%B9%D9%84%DB%8C/); // "علی" is percent-encoded
  assert.doesNotMatch(url, /[^\x00-\x7F]/); // no raw non-ASCII characters
});

test("waMeHref strips everything but digits and prefixes wa.me", () => {
  assert.equal(waMeHref("+98 (912) 882-3933"), "https://wa.me/989128823933");
  assert.equal(waMeHref("989128823933"), "https://wa.me/989128823933");
});
