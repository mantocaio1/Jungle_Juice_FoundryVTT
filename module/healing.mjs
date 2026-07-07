import { ITEM_TIERS, SHORT_REST, LONG_REST, STABILIZE_DC, STABILIZE_ATTR, getInsanityState } from "./config.mjs";
import { rollTest } from "./dice.mjs";

/**
 * Aplica cura ao HP, limitado ao máximo.
 * @param {Actor} actor
 * @param {number} amount
 * @returns {Promise<number>} novo HP
 */
export async function applyHealing(actor, amount) {
  const max = actor.system.hp.max;
  const current = actor.system.hp.value;
  const wasDying = current <= 0;

  let newHp = current + amount;
  // Cura em Morrendo estabiliza em pelo menos 1 HP.
  if (wasDying && amount > 0) newHp = Math.max(1, newHp);
  newHp = Math.min(max, newHp);

  await actor.update({ "system.hp.value": newHp });
  return { newHp, stabilized: wasDying && newHp > 0 };
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
  const { newHp, stabilized } = await applyHealing(actor, healed);

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `Cura — ${item.name.trim()} (Tier ${item.tier}: ${tier.label})`,
  });

  const stableLine = stabilized ? `<p>🩹 <em>Estabilizado</em> — saiu do estado Morrendo.</p>` : "";

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="jungle-juice-card"><p>💚 <strong>+${healed}</strong> HP → ${newHp}/${actor.system.hp.max}</p>${stableLine}</div>`,
  });

  return { healed, newHp, stabilized };
}

/** @param {Actor} actor */
export async function shortRest(actor) {
  const res = actor.system.attributes?.[SHORT_REST.hpAttr] ?? 0;
  const { newHp } = res > 0 ? await applyHealing(actor, res) : { newHp: actor.system.hp.value };
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

/**
 * Teste de medicina para estabilizar personagem Morrendo (0 HP → 1 HP).
 * @param {Actor} actor
 */
export async function stabilizeDying(actor) {
  if (actor.system.hp.value > 0) {
    ui.notifications.warn("Personagem não está Morrendo.");
    return;
  }

  const { success, total } = await rollTest({
    actor,
    attrKey: STABILIZE_ATTR,
    target: STABILIZE_DC,
    label: "Estabilizar — Medicina",
  });

  if (success) {
    await actor.update({ "system.hp.value": 1 });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="jungle-juice-card"><p>🩹 <strong>Estabilizado!</strong> HP → 1/${actor.system.hp.max} — saiu do estado Morrendo.</p></div>`,
    });
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="jungle-juice-card"><p>❌ Falhou em estabilizar (${total} vs CD ${STABILIZE_DC}). Continua Morrendo.</p></div>`,
    });
  }

  return { success };
}
