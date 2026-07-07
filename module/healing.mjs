import { ITEM_TIERS, SHORT_REST, LONG_REST, getInsanityState } from "./config.mjs";

/**
 * Aplica cura ao HP, limitado ao máximo.
 * @param {Actor} actor
 * @param {number} amount
 * @returns {Promise<number>} novo HP
 */
export async function applyHealing(actor, amount) {
  const max = actor.system.hp.max;
  const newHp = Math.min(max, actor.system.hp.value + amount);
  await actor.update({ "system.hp.value": newHp });
  return newHp;
}

/**
 * Ajusta insanidade com clamp 0–max.
 * @param {Actor} actor
 * @param {number} delta
 * @returns {Promise<number>}
 */
export async function adjustInsanity(actor, delta) {
  const max = actor.system.insanity.max;
  const newVal = Math.max(0, Math.min(max, actor.system.insanity.value + delta));
  await actor.update({ "system.insanity.value": newVal });
  return newVal;
}

/**
 * Usa um item equipado como cura — rola o dado do tier (+1d4/+1d6/+1d8).
 * @param {Actor} actor
 * @param {number} index índice em system.items
 */
export async function useHealingItem(actor, index) {
  const item = actor.system.items?.[index];
  if (!item?.name?.trim()) {
    ui.notifications.warn("Defina o nome do item antes de usar como cura.");
    return;
  }

  const tier = ITEM_TIERS[item.tier] ?? ITEM_TIERS["1"];
  const roll = await new Roll(tier.heal).evaluate();
  const healed = roll.total;
  const newHp = await applyHealing(actor, healed);

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `Cura — ${item.name.trim()} (Tier ${item.tier}: ${tier.label})`,
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="jungle-juice-card"><p>💚 <strong>+${healed}</strong> HP → ${newHp}/${actor.system.hp.max}</p></div>`,
  });

  return { healed, newHp };
}

/** @param {Actor} actor */
export async function shortRest(actor) {
  const res = actor.system.attributes?.[SHORT_REST.hpAttr] ?? 0;
  const newHp = res > 0 ? await applyHealing(actor, res) : actor.system.hp.value;
  const newIns = await adjustInsanity(actor, SHORT_REST.insanity);
  const state = getInsanityState(newIns);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="jungle-juice-card">
        <h3>🛏️ ${SHORT_REST.label}</h3>
        <p>💚 HP ${res > 0 ? `+${res}` : "sem recuperação"} → <strong>${newHp}/${actor.system.hp.max}</strong></p>
        <p>🌑 Insanidade ${SHORT_REST.insanity} → <strong>${newIns}/100</strong> <span style="color:${state.color}">(${state.label})</span></p>
      </div>`,
  });
}

/** @param {Actor} actor */
export async function longRest(actor) {
  const maxHp = actor.system.hp.max;
  await actor.update({ "system.hp.value": maxHp });
  const newIns = await adjustInsanity(actor, LONG_REST.insanity);
  const state = getInsanityState(newIns);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="jungle-juice-card">
        <h3>🌙 ${LONG_REST.label}</h3>
        <p>💚 HP restaurado → <strong>${maxHp}/${maxHp}</strong></p>
        <p>🌑 Insanidade ${LONG_REST.insanity} → <strong>${newIns}/100</strong> <span style="color:${state.color}">(${state.label})</span></p>
      </div>`,
  });
}
