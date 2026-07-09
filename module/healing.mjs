import { ITEM_TIERS, SHORT_REST, LONG_REST, STABILIZE_DC, STABILIZE_ATTR, getInsanityState } from "./config.mjs";
import { rollTest } from "./dice.mjs";
import { spendTurnAction } from "./combat-actions.mjs";

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
 * @param {Actor} healer quem usa o item (gasta ação de Suporte)
 * @param {string} itemId ID do documento Item embutido
 * @param {Actor} [target] alvo da cura (padrão: o próprio healer)
 */
export async function useHealingItem(healer, itemId, target = healer) {
  const item = healer.items.get(itemId);
  if (!item || item.type !== "gear") {
    ui.notifications.warn("Item não encontrado.");
    return;
  }
  if (!item.name?.trim()) {
    ui.notifications.warn("Defina o nome do item antes de usar como cura.");
    return;
  }

  await spendTurnAction(healer, "support");

  const tier = ITEM_TIERS[item.system.tier] ?? ITEM_TIERS["1"];
  const roll = await new Roll(tier.heal).evaluate();
  const healed = roll.total;

  const selfHeal = target.id === healer.id;
  const canApply = selfHeal || target.isOwner || game.user.isGM;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: healer }),
    flavor: selfHeal
      ? `Cura — ${item.name.trim()} (Tier ${item.system.tier}: ${tier.label})`
      : `Cura em ${target.name} — ${item.name.trim()} (Tier ${item.system.tier})`,
  });

  if (!canApply) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: healer }),
      content: `<div class="jungle-juice-card"><p>💚 <strong>+${healed}</strong> HP curados em <strong>${target.name}</strong> — <em>aguardando o Mestre aplicar (sem permissão).</em></p></div>`,
    });
    return { healed, pending: true };
  }

  const { newHp, stabilized } = await applyHealing(target, healed);
  const stableLine = stabilized ? `<p>🩹 <em>Estabilizado</em> — saiu do estado Morrendo.</p>` : "";
  const whoLine = selfHeal ? "" : `<p><em>${healer.name} curou ${target.name}</em></p>`;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: healer }),
    content: `<div class="jungle-juice-card">${whoLine}<p>💚 <strong>+${healed}</strong> HP → ${newHp}/${target.system.hp.max}</p>${stableLine}</div>`,
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

  await spendTurnAction(actor, "support");

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

/**
 * Aliado tenta estabilizar personagem Morrendo (healer gasta Suporte e rola RES).
 * @param {Actor} healer
 * @param {Actor} target
 */
export async function stabilizeAlly(healer, target) {
  if (target.system.hp.value > 0) {
    ui.notifications.warn("Alvo não está Morrendo.");
    return;
  }

  await spendTurnAction(healer, "support");

  const { success, total } = await rollTest({
    actor: healer,
    attrKey: STABILIZE_ATTR,
    target: STABILIZE_DC,
    label: `Estabilizar — ${target.name}`,
  });

  const canApply = target.isOwner || game.user.isGM;

  if (success && canApply) {
    await target.update({ "system.hp.value": 1 });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: healer }),
      content: `<div class="jungle-juice-card"><p>🩹 <strong>${healer.name}</strong> estabilizou <strong>${target.name}</strong>! HP → 1/${target.system.hp.max}</p></div>`,
    });
  } else if (success) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: healer }),
      content: `<div class="jungle-juice-card"><p>🩹 Estabilização bem-sucedida em <strong>${target.name}</strong> — <em>aguardando o Mestre aplicar HP.</em></p></div>`,
    });
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: healer }),
      content: `<div class="jungle-juice-card"><p>❌ <strong>${healer.name}</strong> falhou em estabilizar <strong>${target.name}</strong> (${total} vs CD ${STABILIZE_DC}).</p></div>`,
    });
  }

  return { success };
}
