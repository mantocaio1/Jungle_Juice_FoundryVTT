import { TURN_ACTIONS, getCondition } from "./config.mjs";

/** Condições que impedem o uso de ações específicas (Parte 4). */
const ACTION_BLOCKS_BY_CONDITION = {
  stunned: ["free"],
  immobilized: ["movement", "support"],
};

/**
 * @param {Actor} actor
 * @param {string} actionId
 * @returns {string|null} nome da condição bloqueadora
 */
export function isActionBlocked(actor, actionId) {
  const statuses = actor.statuses ?? new Set();
  for (const [conditionId, blockedActions] of Object.entries(ACTION_BLOCKS_BY_CONDITION)) {
    if (!statuses.has(conditionId) || !blockedActions.includes(actionId)) continue;
    return getCondition(conditionId)?.name ?? conditionId;
  }
  return null;
}

/** @param {Actor} actor */
export function getTurnActionsState(actor) {
  const actions = actor.system.actions ?? {};
  return TURN_ACTIONS.map((action) => {
    const spent = actions[action.id] ?? false;
    const blockedBy = isActionBlocked(actor, action.id);
    return { ...action, spent, blocked: Boolean(blockedBy), blockedBy };
  });
}

/** @param {Actor} actor */
export async function resetTurnActions(actor) {
  const update = {};
  for (const action of TURN_ACTIONS) {
    update[`system.actions.${action.id}`] = false;
  }
  await actor.update(update);
}

/**
 * @param {Actor} actor
 * @param {string} actionId
 */
export async function toggleTurnAction(actor, actionId) {
  const blockedBy = isActionBlocked(actor, actionId);
  if (blockedBy) {
    ui.notifications.warn(`Ação bloqueada por ${blockedBy}.`);
    return false;
  }

  const current = actor.system.actions?.[actionId] ?? false;
  await actor.update({ [`system.actions.${actionId}`]: !current });
  return true;
}

/**
 * Marca uma ação como gasta (sem alternar de volta).
 * @param {Actor} actor
 * @param {string} actionId
 * @param {{ silent?: boolean }} [options]
 */
export async function spendTurnAction(actor, actionId, { silent = false } = {}) {
  const action = TURN_ACTIONS.find((a) => a.id === actionId);
  const blockedBy = isActionBlocked(actor, actionId);
  if (blockedBy) {
    if (!silent) ui.notifications.warn(`${action?.label ?? actionId} bloqueada por ${blockedBy}.`);
    return false;
  }

  if (actor.system.actions?.[actionId]) {
    if (!silent) ui.notifications.warn(`${action?.label ?? actionId} já foi gasta neste turno.`);
    return false;
  }

  await actor.update({ [`system.actions.${actionId}`]: true });
  return true;
}
