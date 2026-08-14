import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const script = path.join(repositoryRoot, "scripts", "validate-content.mjs");

const runValidator = (contentDir, publicDir) =>
  spawnSync(process.execPath, [script, contentDir, publicDir], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

const makeSandbox = () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "validate-content-"));
  fs.cpSync(path.join(repositoryRoot, "src", "content"), path.join(sandbox, "content"), {
    recursive: true,
  });
  fs.cpSync(path.join(repositoryRoot, "src", "assets"), path.join(sandbox, "assets"), {
    recursive: true,
  });
  fs.cpSync(path.join(repositoryRoot, "public"), path.join(sandbox, "public"), {
    recursive: true,
  });
  return sandbox;
};

test("validator passes the committed content", () => {
  const result = runValidator(path.join(repositoryRoot, "src", "content"), path.join(repositoryRoot, "public"));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Content validation passed/);
});

test("validator fails with a clear message when phones is emptied", () => {
  const sandbox = makeSandbox();
  try {
    const contactsPath = path.join(sandbox, "content", "contacts.json");
    const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));
    contacts.phones = [];
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2), "utf8");

    const result = runValidator(path.join(sandbox, "content"), path.join(sandbox, "public"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /contacts\.json: "phones" must be a non-empty array/);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test("validator rejects an active messenger channel without a url", () => {
  const sandbox = makeSandbox();
  try {
    const contactsPath = path.join(sandbox, "content", "contacts.json");
    const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));
    const eitaa = contacts.messaging.find((channel) => channel.id === "eitaa");
    eitaa.status = "active";
    eitaa.url = "";
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2), "utf8");

    const result = runValidator(path.join(sandbox, "content"), path.join(sandbox, "public"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /messaging\[\d+\] is "active" but has no valid https url/);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test("validator rejects a service image that exists in neither public/ nor src/assets", () => {
  const sandbox = makeSandbox();
  try {
    const servicesPath = path.join(sandbox, "content", "services.json");
    const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    services[0].image = "/images/services/does-not-exist.jpg";
    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), "utf8");

    const result = runValidator(path.join(sandbox, "content"), path.join(sandbox, "public"));
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /image not found under public\/ or src\/assets: \/images\/services\/does-not-exist\.jpg/,
    );
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test("validator rejects a detail-page service without detailIntro (anti-thin-page guard)", () => {
  const sandbox = makeSandbox();
  try {
    const servicesPath = path.join(sandbox, "content", "services.json");
    const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    delete services[0].detailIntro;
    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), "utf8");

    const result = runValidator(path.join(sandbox, "content"), path.join(sandbox, "public"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /detailPage is true but "detailIntro" is missing/);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test("validator rejects a detail-page service referencing an unknown certificate id", () => {
  const sandbox = makeSandbox();
  try {
    const servicesPath = path.join(sandbox, "content", "services.json");
    const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    services[0].qualificationCertificateIds = [999];
    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), "utf8");

    const result = runValidator(path.join(sandbox, "content"), path.join(sandbox, "public"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /qualificationCertificateIds references unknown id 999/);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test("validator rejects a detail-page service referencing an unknown project id", () => {
  const sandbox = makeSandbox();
  try {
    const servicesPath = path.join(sandbox, "content", "services.json");
    const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
    services[0].relatedProjectIds = ["project-99"];
    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), "utf8");

    const result = runValidator(path.join(sandbox, "content"), path.join(sandbox, "public"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /relatedProjectIds references unknown project "project-99"/);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});
