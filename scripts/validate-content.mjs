#!/usr/bin/env node
/**
 * Build-time content validation for src/content/*.json.
 *
 * The content JSON is the single source of product truth and is cast to the
 * TS interfaces in src/lib/types.ts without runtime validation (`astro check`
 * does not type-check JSON). This script closes that gap with a hand-rolled
 * validator (no new dependencies) that fails the verification lane with a
 * clear message when content drifts from the contract.
 *
 * Usage:
 *   node scripts/validate-content.mjs [contentDir] [publicDir]
 *
 * Exit code 0 when all checks pass, 1 with per-file error lines otherwise.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const contentDir = path.resolve(process.argv[2] || "src/content");
const publicDir = path.resolve(process.argv[3] || "public");

const errors = [];
const checks = { files: 0 };

const fail = (file, message) => {
  errors.push(`${file}: ${message}`);
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const readJsonAt = (root, file) => {
  const filePath = path.join(root, file);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(file, `cannot read/parse JSON: ${error.message}`);
    return null;
  }
};

const requireString = (file, object, key) => {
  if (!isNonEmptyString(object?.[key])) fail(file, `"${key}" must be a non-empty string`);
};

const requireStringArray = (file, object, key) => {
  if (!isNonEmptyArray(object?.[key]) || !object[key].every(isNonEmptyString)) {
    fail(file, `"${key}" must be a non-empty array of non-empty strings`);
  }
};

const imageExists = (file, value, roots) => {
  if (typeof value !== "string" || !value.startsWith("/images/")) {
    fail(file, `image path must start with "/images/", got: ${value}`);
    return;
  }
  const relative = value.replace(/^\//, "").split("/");
  const exists = roots.some((root) => {
    try {
      return fs.statSync(path.join(root, ...relative)).isFile();
    } catch {
      return false;
    }
  });
  if (!exists) {
    fail(
      file,
      `image not found under public/ or src/assets: ${value} (raster sources live in src/assets/images, SVG placeholders in public/images)`,
    );
  }
};

const validateContacts = (contacts) => {
  if (!contacts) return;
  const file = "contacts.json";

  if (!isNonEmptyArray(contacts.phones)) {
    fail(file, '"phones" must be a non-empty array (components index phones[0])');
  } else {
    contacts.phones.forEach((phone, index) => {
      requireString(file, phone, "label");
      requireString(file, phone, "number");
      if (!isNonEmptyString(phone?.tel)) {
        fail(file, `phones[${index}].tel must be a non-empty string`);
      } else if (!/^\+?[0-9]{8,15}$/.test(phone.tel.replace(/[\s-]/g, ""))) {
        fail(file, `phones[${index}].tel does not look like a phone number: ${phone.tel}`);
      }
    });
  }

  requireString(file, contacts, "fax");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contacts.email || "")) {
    fail(file, `"email" must be a valid email address, got: ${contacts.email}`);
  }
  if (!/^https?:\/\//.test(contacts.website || "")) {
    fail(file, `"website" must start with http(s)://, got: ${contacts.website}`);
  }
  requireString(file, contacts, "workingHours");

  if (!isNonEmptyArray(contacts.addresses)) {
    fail(file, '"addresses" must be a non-empty array (components use addresses[0])');
  } else {
    contacts.addresses.forEach((address, index) => {
      requireString(file, address, "city");
      requireString(file, address, "fullAddress");
      if (!/^https?:\/\//.test(address?.mapUrl || "")) {
        fail(file, `addresses[${index}].mapUrl must start with http(s)://`);
      }
      if (address?.embedUrl !== undefined && !/^https?:\/\//.test(address.embedUrl)) {
        fail(file, `addresses[${index}].embedUrl must start with http(s)://`);
      }
    });
  }

  const whatsapp = contacts.whatsapp || {};
  if (!["active", "placeholder"].includes(whatsapp.status)) {
    fail(file, `whatsapp.status must be "active" or "placeholder", got: ${whatsapp.status}`);
  }
  if (whatsapp.status === "active" && !/^[0-9]{10,15}$/.test(whatsapp.number || "")) {
    fail(file, `whatsapp.number must be 10-15 digits when status is "active"`);
  }
  if (typeof whatsapp.fallbackMessage !== "string") {
    fail(file, '"whatsapp.fallbackMessage" must be a string');
  }

  if (!isNonEmptyArray(contacts.messaging)) {
    fail(file, '"messaging" must be a non-empty array');
  } else {
    contacts.messaging.forEach((channel, index) => {
      requireString(file, channel, "id");
      requireString(file, channel, "label");
      if (!["active", "missing_identifier"].includes(channel?.status)) {
        fail(file, `messaging[${index}].status must be "active" or "missing_identifier"`);
      }
      if (channel?.status === "active") {
        if (!/^https?:\/\//.test(channel?.url || "")) {
          fail(file, `messaging[${index}] is "active" but has no valid https url`);
        }
        if (!isNonEmptyString(channel?.number)) {
          fail(file, `messaging[${index}] is "active" but has no number`);
        }
      }
      if (typeof channel?.note !== "string") {
        fail(file, `messaging[${index}].note must be a string`);
      }
    });
  }
};

const validateCompany = (company) => {
  if (!company) return;
  const file = "company.json";
  for (const key of [
    "name",
    "shortName",
    "tagline",
    "introduction",
    "about",
    "policy",
    "policySummary",
    "vision",
    "foundedAt",
    "legalType",
    "organizationalStructure",
  ]) {
    requireString(file, company, key);
  }
  for (const key of ["policyItems", "mission", "values", "standards"]) {
    requireStringArray(file, company, key);
  }
  if (!isNonEmptyArray(company.history)) {
    fail(file, '"history" must be a non-empty array');
  } else {
    company.history.forEach((item) => {
      requireString(file, item, "year");
      requireString(file, item, "description");
    });
  }
  const hse = company.hseApproach || {};
  requireString(file, hse, "environmentIntro");
  requireString(file, hse, "employeeSafetyIntro");
  requireStringArray(file, hse, "environment");
  requireStringArray(file, hse, "employeeSafety");
  requireString(file, company.organizationalChart || {}, "ceo");
  requireStringArray(file, company.organizationalChart || {}, "units");
};

const validateServices = (services, imageRoots) => {
  if (!services) return;
  const file = "services.json";
  if (!isNonEmptyArray(services)) {
    fail(file, "services must be a non-empty array");
    return;
  }
  services.forEach((service, index) => {
    for (const key of ["id", "title", "summary", "category", "image"]) {
      requireString(file, service, key);
    }
    if (typeof service?.notes !== "string") fail(file, `services[${index}].notes must be a string`);
    for (const key of ["details", "highlights"]) {
      if (!Array.isArray(service?.[key]) || !service[key].every(isNonEmptyString)) {
        fail(file, `services[${index}].${key} must be an array of strings`);
      }
    }
    imageExists(file, service?.image, imageRoots);
  });
};

const validateProjects = (projects) => {
  if (!projects) return;
  const file = "projects.json";
  if (!isNonEmptyArray(projects)) {
    fail(file, "projects must be a non-empty array");
    return;
  }
  projects.forEach((project, index) => {
    for (const key of ["id", "title", "client"]) {
      requireString(file, project, key);
    }
    if (!/^project-\d{2}$/.test(project?.id || "")) {
      fail(file, `projects[${index}].id must match project-NN (e.g. project-01)`);
    }
  });
};

const validateCertifications = (certifications, imageRoots) => {
  if (!certifications) return;
  const file = "certifications.json";
  requireString(file, certifications, "qualificationNote");
  const extraStringFields = {
    qualificationCertificates: ["description"],
    managementCertificates: ["note"],
    licenses: [],
  };
  for (const key of ["qualificationCertificates", "managementCertificates", "licenses"]) {
    if (!isNonEmptyArray(certifications[key])) {
      fail(file, `"${key}" must be a non-empty array`);
    } else {
      certifications[key].forEach((item, index) => {
        for (const field of ["title", "issuer", "validity"]) {
          requireString(file, item, field);
        }
        if (!Number.isInteger(item?.id)) fail(file, `${key}[${index}].id must be an integer`);
        for (const field of extraStringFields[key]) {
          if (typeof item?.[field] !== "string") {
            fail(file, `${key}[${index}].${field} must be a string`);
          }
        }
      });
    }
  }
  if (!isNonEmptyArray(certifications.documents)) {
    fail(file, '"documents" must be a non-empty array');
  } else {
    certifications.documents.forEach((document, index) => {
      for (const field of ["title", "issuer", "validity", "alt"]) {
        requireString(file, document, field);
      }
      if (!Number.isInteger(document?.id)) fail(file, `documents[${index}].id must be an integer`);
      imageExists(file, document?.image, imageRoots);
    });
  }
};

export const validateContent = (contentRootArg, publicRootArg, assetsRootArg) => {
  const root = path.resolve(contentRootArg || contentDir);
  const publicRoot = path.resolve(publicRootArg || publicDir);
  const assetsRoot = path.resolve(assetsRootArg || path.join(root, "../assets"));
  const imageRoots = [publicRoot, assetsRoot];
  errors.length = 0;
  checks.files = 0;
  const files = {
    "contacts.json": validateContacts,
    "company.json": validateCompany,
    "services.json": validateServices,
    "projects.json": validateProjects,
    "certifications.json": validateCertifications,
  };
  for (const [file, validate] of Object.entries(files)) {
    const data = readJsonAt(root, file);
    checks.files += 1;
    if (data === null) continue;
    if (file === "services.json") validateServices(data, imageRoots);
    else if (file === "certifications.json") validateCertifications(data, imageRoots);
    else validate(data);
  }
  return { ok: errors.length === 0, errors: [...errors], files: checks.files };
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = validateContent();
  if (result.ok) {
    console.log(`Content validation passed: ${result.files} files checked.`);
  } else {
    console.error(`Content validation FAILED (${result.errors.length} problem(s)):`);
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exit(1);
  }
}
