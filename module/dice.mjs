import { ATTRIBUTES } from "./config.mjs";

/**
 * @param {object} options
 * @param {Actor} options.actor
 * @param {string} options.attrKey
 * @param {number} options.target
 * @param {string} [options.label]
 */
export async function rollTest({ actor, attrKey, target, label }) {
  const attr = actor.system.attributes[attrKey] ?? 0;
  const attrInfo = ATTRIBUTES[attrKey];
  const roll = await new Roll(`1d20 + ${attr}`).evaluate();
  const success = roll.total >= target;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${label ?? "Teste"} — ${attrInfo?.abbr ?? attrKey.toUpperCase()} vs CD ${target}`,
  });

  return { roll, success, total: roll.total, target };
}

/**
 * @param {object} options
 * @param {Actor} options.actor
 * @param {string} options.attrKey
 * @param {number} options.ac
 * @param {string} [options.label]
 */
export async function rollAttack({ actor, attrKey, ac, label }) {
  const attr = actor.system.attributes[attrKey] ?? 0;
  const attrInfo = ATTRIBUTES[attrKey];
  const roll = await new Roll(`1d20 + ${attr}`).evaluate();
  const natural20 = roll.dice[0]?.results?.[0]?.result === 20;
  const hit = natural20 || roll.total >= ac;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${label ?? "Ataque"} — ${attrInfo?.abbr ?? attrKey.toUpperCase()} vs AC ${ac}${natural20 ? " (Natural 20!)" : ""}`,
  });

  return { roll, hit, natural20, total: roll.total, ac };
}

/** @param {Actor} actor */
export async function rollInitiative(actor) {
  const agi = actor.system.attributes?.agi ?? 0;
  const roll = await new Roll(`1d20 + ${agi}`).evaluate();

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: "Iniciativa",
  });

  return roll;
}

/** @param {Actor} actor */
export async function rollDyingSave(actor) {
  const roll = await new Roll("1d20").evaluate();
  const hold = roll.total >= 11;

  if (!hold) {
    const newHp = actor.system.hp.value - 1;
    await actor.update({ "system.hp.value": newHp });
  }

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: hold ? "Segura — continua Morrendo" : "Perde 1 HP",
  });

  return { roll, hold };
}
