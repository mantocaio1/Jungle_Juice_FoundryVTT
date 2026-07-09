import { SYSTEM_ID, CONDITIONS, getCondition, RUNAWAY_STATUS_ID } from "./config.mjs";

const JJ_TYPES = new Set(["character", "npc"]);
const CONDITION_IDS = new Set(CONDITIONS.map((c) => c.id));
CONDITION_IDS.add(RUNAWAY_STATUS_ID);

/** @param {Actor|undefined|null} actor */
function isJjActor(actor) {
  return Boolean(actor?.type && JJ_TYPES.has(actor.type));
}

/** @param {object} data */
function readStatusId(data) {
  const statuses = data.statuses;
  if (Array.isArray(statuses) && statuses.length) return String(statuses[0]);
  return data.flags?.core?.statusId ?? null;
}

/** @param {object} data @param {string} statusId */
function applyConditionMetadata(data, statusId) {
  const condition =
    statusId === RUNAWAY_STATUS_ID
      ? {
          id: RUNAWAY_STATUS_ID,
          name: "Complex Runaway",
          img: "icons/svg/explosion.svg",
          hint: "Runaway ativo — controle total do Mestre.",
        }
      : getCondition(statusId);

  if (!condition) return false;

  data.name = condition.name;
  data.img = condition.img;
  data.description = condition.hint ?? "";
  data.statuses = [statusId];
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, {
    core: { statusId },
    [SYSTEM_ID]: { conditionId: statusId },
  });
  return true;
}

/** @param {ActiveEffect|object} document @param {object} data */
function enrichConditionEffect(document, data) {
  const actor = document.parent ?? document.actor;
  if (!isJjActor(actor)) return;

  const statusId = readStatusId(data);
  if (!statusId || !CONDITION_IDS.has(statusId)) return;

  applyConditionMetadata(data, statusId);
}

/**
 * Enriquece Active Effects de condições com nome, ícone e descrição Jungle Juice.
 * Permite aplicar/remover condições pelo HUD do token e pelo painel de efeitos.
 */
export function registerActiveEffects() {
  Hooks.on("preCreateActiveEffect", (document, data) => {
    enrichConditionEffect(document, data);
  });

  Hooks.on("preUpdateActiveEffect", (document, changes) => {
    if (!isJjActor(document.parent)) return;
    const statusId = readStatusId(changes) ?? readStatusId(document);
    if (!statusId || !CONDITION_IDS.has(statusId)) return;
    applyConditionMetadata(changes, statusId);
  });

  const refreshActorSheet = (effect) => {
    const actor = effect.parent;
    if (!isJjActor(actor)) return;
    if (actor.sheet?.rendered) actor.sheet.render(false);
  };

  Hooks.on("createActiveEffect", refreshActorSheet);
  Hooks.on("deleteActiveEffect", refreshActorSheet);
  Hooks.on("updateActiveEffect", refreshActorSheet);

  Hooks.once("ready", async () => {
    if (!game.user.isGM) return;

    for (const actor of game.actors.filter((a) => isJjActor(a))) {
      const updates = [];
      for (const effect of actor.effects) {
        const statusId =
          effect.getFlag("core", "statusId") ??
          effect.statuses?.[0] ??
          effect.getFlag(SYSTEM_ID, "conditionId");
        if (!statusId || !CONDITION_IDS.has(statusId)) continue;
        if (effect.getFlag(SYSTEM_ID, "conditionId")) continue;

        const condition =
          statusId === RUNAWAY_STATUS_ID
            ? { name: "Complex Runaway", img: "icons/svg/explosion.svg", hint: "Runaway ativo." }
            : getCondition(statusId);
        if (!condition) continue;

        updates.push({
          _id: effect.id,
          name: condition.name,
          img: condition.img,
          description: condition.hint ?? "",
          statuses: [statusId],
          [`flags.${SYSTEM_ID}.conditionId`]: statusId,
        });
      }
      if (updates.length) {
        await actor.updateEmbeddedDocuments("ActiveEffect", updates);
      }
    }
  });
}
