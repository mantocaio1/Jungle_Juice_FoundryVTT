import { CONDITIONS, getCondition, RUNAWAY_STATUS_ID } from "./config.mjs";

/** Registra as condições do sistema como status effects do Foundry. */
export function registerConditions() {
  CONFIG.statusEffects = [
    ...CONDITIONS.map((c) => ({ id: c.id, name: c.name, img: c.img })),
    { id: RUNAWAY_STATUS_ID, name: "Complex Runaway", img: "icons/svg/explosion.svg" },
  ];
}

/**
 * Aplica os efeitos de início de turno (dano contínuo e insanidade) para o
 * combatente cujo turno está começando.
 * @param {Combat} combat
 */
export async function applyStartOfTurnEffects(combat) {
  const combatant = combat.combatant;
  const actor = combatant?.actor;
  if (!actor) return;

  const statuses = actor.statuses;
  if (!statuses?.size) return;

  let hpLoss = 0;
  const messages = [];

  for (const condition of CONDITIONS) {
    if (!statuses.has(condition.id)) continue;

    if (condition.perTurnHp) {
      const roll = await new Roll(condition.perTurnHp).evaluate();
      hpLoss += roll.total;
      messages.push(`🩸 <strong>${condition.name}</strong>: −${roll.total} HP (${condition.perTurnHp})`);
    }

    if (condition.perTurnInsanity) {
      const newInsanity = Math.min(actor.system.insanity.max, actor.system.insanity.value + condition.perTurnInsanity);
      await actor.update({ "system.insanity.value": newInsanity });
      messages.push(`🧠 <strong>${condition.name}</strong>: +${condition.perTurnInsanity} Insanidade`);
    }
  }

  if (hpLoss > 0) {
    const newHp = actor.system.hp.value - hpLoss;
    await actor.update({ "system.hp.value": newHp });
  }

  if (messages.length) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="jungle-juice-card"><h3>Início de turno — ${actor.name}</h3><p>${messages.join("<br/>")}</p></div>`,
    });
  }
}

/**
 * Alterna uma condição em um ator.
 * @param {Actor} actor
 * @param {string} conditionId
 */
export async function toggleCondition(actor, conditionId) {
  const condition = getCondition(conditionId);
  if (!condition) return;
  await actor.toggleStatusEffect(conditionId);
}
