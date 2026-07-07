import { MAX_ITEMS } from "./config.mjs";

const GEAR_TYPE = "gear";

/** @param {Actor} actor */
export function getGearItems(actor) {
  return actor.items.filter((item) => item.type === GEAR_TYPE);
}

/**
 * Converte itens legados (system.items) em documentos Item embutidos.
 * @param {Actor} actor
 */
export async function migrateLegacyItems(actor) {
  const legacy = (actor.system.items ?? []).filter((item) => item.name?.trim());
  const existing = getGearItems(actor);

  if (!legacy.length) return false;
  if (existing.length) {
    await actor.update({
      "system.items": [{ name: "", tier: "1", desc: "" }, { name: "", tier: "1", desc: "" }],
    });
    return false;
  }

  const toCreate = legacy.map((item) => ({
    name: item.name.trim(),
    type: GEAR_TYPE,
    system: { tier: item.tier ?? "1", desc: item.desc ?? "" },
  }));

  await actor.createEmbeddedDocuments("Item", toCreate);
  await actor.update({
    "system.items": [{ name: "", tier: "1", desc: "" }, { name: "", tier: "1", desc: "" }],
  });

  return true;
}

/** @param {Actor} actor */
export async function migrateAllActorItems() {
  if (!game.user.isGM) return;

  let migrated = 0;
  for (const actor of game.actors) {
    if (await migrateLegacyItems(actor)) migrated++;
  }

  if (migrated) {
    ui.notifications.info(`Migração: ${migrated} personagem(ns) convertido(s) para itens Foundry.`);
  }
}

/**
 * Extrai itens legados de dados de criação (compêndios / import).
 * @param {object} data
 */
export function extractLegacyItemsFromCreateData(data) {
  const legacy = (data.system?.items ?? []).filter((item) => item.name?.trim());
  if (!legacy.length) return;

  data.items = data.items ?? [];
  for (const item of legacy) {
    data.items.push({
      name: item.name.trim(),
      type: GEAR_TYPE,
      system: { tier: item.tier ?? "1", desc: item.desc ?? "" },
    });
  }

  data.system.items = [
    { name: "", tier: "1", desc: "" },
    { name: "", tier: "1", desc: "" },
  ];
}

/** @param {Actor} actor */
export async function createGearItem(actor) {
  if (getGearItems(actor).length >= MAX_ITEMS) {
    ui.notifications.warn(`Máximo de ${MAX_ITEMS} itens por personagem.`);
    return null;
  }

  const [item] = await actor.createEmbeddedDocuments("Item", [
    {
      name: "Novo item",
      type: GEAR_TYPE,
      system: { tier: "1", desc: "" },
    },
  ]);

  return item;
}

/** @param {Actor} actor @param {string} itemId */
export async function deleteGearItem(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item || item.type !== GEAR_TYPE) return;
  await actor.deleteEmbeddedDocuments("Item", [itemId]);
}

/**
 * Normaliza item legado ou documento para uso em rolagens.
 * @param {object} item
 */
export function itemRollData(item) {
  if (!item) return null;
  return {
    name: item.name ?? "",
    tier: item.system?.tier ?? item.tier ?? "1",
  };
}
