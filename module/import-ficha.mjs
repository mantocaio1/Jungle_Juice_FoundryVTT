import {
  ATTRIBUTE_POINTS,
  MAX_ATTRIBUTE_AT_CREATION,
  MAX_ABILITIES,
  MAX_ITEMS,
  MAX_EXTRA_WEAKNESSES,
  FACTION_NAMES,
} from "./config.mjs";
import { getGearItems } from "./items.mjs";

const ATTR_KEYS = ["for", "agi", "res", "men", "per", "pre", "int"];
const ABILITY_TYPES = new Set(["passiva", "ativa_l", "ativa_f", "especial"]);
const ITEM_TIERS = new Set(["1", "2", "3"]);
const FICHA_VERSION = 1;

function asPlainHtml(text) {
  const value = String(text ?? "").trim();
  if (!value) return "";
  if (value.startsWith("<")) return value;
  return `<p>${value.replace(/\n/g, "<br/>")}</p>`;
}

function normalizeAttrs(raw) {
  const attrs = raw?.attrs ?? raw?.attributes ?? {};
  const result = {};
  for (const key of ATTR_KEYS) {
    const value = Number(attrs[key] ?? 0);
    if (!Number.isInteger(value) || value < 0 || value > MAX_ATTRIBUTE_AT_CREATION) {
      throw new Error(`Atributo inválido: ${key}`);
    }
    result[key] = value;
  }
  const spent = Object.values(result).reduce((sum, v) => sum + v, 0);
  if (spent > ATTRIBUTE_POINTS) {
    throw new Error(`Atributos excedem o orçamento (${spent}/${ATTRIBUTE_POINTS}).`);
  }
  return result;
}

function normalizeAbilities(raw) {
  const abilities = raw?.abilities ?? [];
  if (!Array.isArray(abilities)) throw new Error("Campo abilities deve ser uma lista.");
  if (abilities.length > MAX_ABILITIES) {
    throw new Error(`Máximo de ${MAX_ABILITIES} habilidades.`);
  }
  return abilities.map((ab) => {
    const type = ab.type ?? "passiva";
    if (!ABILITY_TYPES.has(type)) throw new Error(`Tipo de habilidade inválido: ${type}`);
    return {
      name: String(ab.name ?? "").trim(),
      type,
      desc: String(ab.desc ?? "").trim(),
      weakness: String(ab.weakness ?? "").trim(),
      damage: String(ab.damage ?? "").trim(),
    };
  });
}

function normalizeItems(raw) {
  const items = raw?.items ?? [];
  if (!Array.isArray(items)) throw new Error("Campo items deve ser uma lista.");
  return items
    .filter((item) => String(item?.name ?? "").trim())
    .slice(0, MAX_ITEMS)
    .map((item) => {
      const tier = String(item.tier ?? "1");
      if (!ITEM_TIERS.has(tier)) throw new Error(`Tier de item inválido: ${tier}`);
      return {
        name: String(item.name).trim(),
        tier,
        desc: String(item.desc ?? "").trim(),
      };
    });
}

/**
 * Valida e normaliza JSON exportado pela ficha HTML.
 * @param {string|object} raw
 */
export function parseFichaJson(raw) {
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!data || typeof data !== "object") throw new Error("JSON inválido.");

  const version = data.version ?? 1;
  if (version !== FICHA_VERSION) {
    throw new Error(`Versão de ficha não suportada: ${version}`);
  }

  const attrs = normalizeAttrs(data);
  const abilities = normalizeAbilities(data);
  const items = normalizeItems(data);
  const extraWeak = Number(data.extraWeak ?? data.extraWeaknesses ?? 0);
  if (!Number.isInteger(extraWeak) || extraWeak < 0 || extraWeak > MAX_EXTRA_WEAKNESSES) {
    throw new Error(`extraWeak deve ser 0–${MAX_EXTRA_WEAKNESSES}.`);
  }

  const insanity = Number(data.insanity ?? 0);
  if (!Number.isInteger(insanity) || insanity < 0 || insanity > 100) {
    throw new Error("Insanidade deve ser 0–100.");
  }

  const faction = String(data.faction ?? "NEST");
  if (!FACTION_NAMES.includes(faction)) {
    throw new Error(`Facção desconhecida: ${faction}`);
  }

  return {
    version: FICHA_VERSION,
    name: String(data.name ?? "").trim() || "Sem nome",
    insect: String(data.insect ?? "").trim(),
    origin: asPlainHtml(data.origin),
    motivation: asPlainHtml(data.motivation),
    faction,
    attrs,
    abilities,
    extraWeak,
    items,
    insanity,
  };
}

/** @param {Actor} actor */
export function exportFichaJson(actor) {
  const system = actor.system;
  const payload = {
    version: FICHA_VERSION,
    name: actor.name ?? "",
    insect: system.insect ?? "",
    origin: system.origin ?? "",
    motivation: system.motivation ?? "",
    faction: system.faction ?? "NEST",
    attrs: { ...system.attributes },
    abilities: (system.abilities ?? []).map((ab) => ({ ...ab })),
    extraWeak: system.extraWeaknesses ?? 0,
    items: getGearItems(actor).map((item) => ({
      name: item.name,
      tier: item.system.tier,
      desc: item.system.desc,
    })),
    insanity: system.insanity?.value ?? 0,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Aplica dados da ficha ao ator (GM).
 * @param {Actor} actor
 * @param {string|object} raw
 */
export async function applyFichaToActor(actor, raw) {
  const data = parseFichaJson(raw);
  const hpMax = 10 + data.attrs.res * 2;

  await actor.update({
    name: data.name,
    system: {
      insect: data.insect,
      origin: data.origin,
      motivation: data.motivation,
      faction: data.faction,
      attributes: data.attrs,
      extraWeaknesses: data.extraWeak,
      abilities: data.abilities,
      insanity: { value: data.insanity, max: 100 },
      hp: { value: hpMax, max: hpMax },
      dying: false,
      runaway: { unlocked: false, active: false },
    },
  });

  const existing = getGearItems(actor);
  if (existing.length) {
    await actor.deleteEmbeddedDocuments(
      "Item",
      existing.map((item) => item.id)
    );
  }

  if (data.items.length) {
    await actor.createEmbeddedDocuments(
      "Item",
      data.items.map((item) => ({
        name: item.name,
        type: "gear",
        system: { tier: item.tier, desc: item.desc },
      }))
    );
  }

  return data;
}

/** Abre diálogo para colar JSON da ficha HTML. @returns {Promise<string|null>} */
export async function promptFichaJson() {
  const text = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Importar ficha JSON" },
    content: `<textarea name="json" rows="12" style="width:100%;font-family:monospace" placeholder='Cole o JSON exportado pela ficha HTML...'></textarea>`,
    ok: {
      label: "Importar",
      callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object.json,
    },
    rejectClose: false,
  });

  const value = String(text ?? "").trim();
  return value || null;
}

/**
 * Cria um personagem novo a partir da ficha JSON.
 * @param {string|object} raw
 */
export async function createActorFromFicha(raw) {
  const data = parseFichaJson(raw);
  const actor = await Actor.create({
    name: data.name,
    type: "character",
  });
  await applyFichaToActor(actor, data);
  return actor;
}
