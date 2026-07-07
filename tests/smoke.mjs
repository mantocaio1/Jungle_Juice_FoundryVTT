import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function walkMjs(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkMjs(full, files);
    else if (entry.name.endsWith(".mjs")) files.push(full);
  }
  return files;
}

function checkManifest(path, { expectId, expectEsmodules = true }) {
  const manifest = readJson(path);
  if (manifest.id !== expectId) {
    fail(`${path}: id esperado "${expectId}", recebido "${manifest.id}"`);
    return;
  }
  if (!manifest.version) fail(`${path}: campo version ausente`);
  if (!manifest.compatibility?.minimum) fail(`${path}: compatibility.minimum ausente`);
  if (!manifest.manifest?.startsWith("https://")) fail(`${path}: manifest URL inválida`);
  if (!manifest.download?.startsWith("https://")) fail(`${path}: download URL inválida`);

  if (expectEsmodules) {
    for (const mod of manifest.esmodules ?? []) {
      if (!existsSync(join(ROOT, dirname(path), mod))) {
        fail(`${path}: esmodule não encontrado — ${mod}`);
      }
    }
  }

  for (const pack of manifest.packs ?? []) {
    const packDir = join(ROOT, dirname(path), pack.path);
    if (!existsSync(packDir)) fail(`${path}: pack path não encontrado — ${pack.path}`);
  }

  for (const style of manifest.styles ?? []) {
    if (!existsSync(join(ROOT, style))) fail(`${path}: style não encontrado — ${style}`);
  }

  for (const lang of manifest.languages ?? []) {
    if (!existsSync(join(ROOT, lang.path))) fail(`${path}: language não encontrado — ${lang.path}`);
  }

  pass(`${path} válido (id=${manifest.id}, v${manifest.version})`);
}

function checkTemplates() {
  const required = [
    "templates/actor-sheet.hbs",
    "templates/item-sheet.hbs",
    "lang/pt-BR.json",
    "template.json",
  ];
  for (const file of required) {
    if (!existsSync(join(ROOT, file))) fail(`arquivo obrigatório ausente — ${file}`);
    else pass(`arquivo presente — ${file}`);
  }
}

function checkSyntax() {
  const mjsFiles = walkMjs(ROOT).filter((f) => !f.includes("node_modules"));
  for (const file of mjsFiles) {
    try {
      execSync(`node --check "${file}"`, { stdio: "pipe" });
      pass(`sintaxe OK — ${relative(ROOT, file)}`);
    } catch {
      fail(`erro de sintaxe — ${relative(ROOT, file)}`);
    }
  }
}

function checkCompanionData() {
  const dataDir = join(ROOT, "companion/module/data");
  const expected = ["factions.mjs", "npcs.mjs", "bestiary.mjs", "gm-macros.mjs", "scenes.mjs"];
  for (const file of expected) {
    const full = join(dataDir, file);
    if (!existsSync(full)) fail(`dado do companion ausente — ${file}`);
    else pass(`dado do companion — ${file}`);
  }
}

console.log("=== Smoke tests — Jungle Juice Foundry ===\n");

checkManifest("system.json", { expectId: "jungle-juice" });
checkManifest("companion/module.json", { expectId: "jungle-juice-compendia" });
checkTemplates();
checkCompanionData();
checkSyntax();

console.log("\n=== Unit tests ===\n");

const unit = spawnSync(
  process.execPath,
  ["--test", "tests/unit/config.test.mjs", "tests/unit/items.test.mjs", "tests/unit/dice.test.mjs", "tests/unit/combat-actions.test.mjs"],
  { cwd: ROOT, stdio: "inherit", shell: false }
);

if (unit.status !== 0) {
  process.exitCode = unit.status ?? 1;
}

if (process.exitCode) {
  console.error("\nSmoke tests falharam.");
  process.exit(1);
}

console.log("\nTodos os smoke tests passaram.");
