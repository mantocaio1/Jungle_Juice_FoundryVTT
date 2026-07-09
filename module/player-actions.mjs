import { ATTRIBUTES, ABILITY_TYPES, ITEM_TIERS } from "./config.mjs";
import {
  rollAttack,
  rollDamage,
  applyAbilityInsanity,
  appendItemBonus,
  applyDamage,
} from "./dice.mjs";
import { spendTurnAction } from "./combat-actions.mjs";
import { getGearItems, itemRollData } from "./items.mjs";

/** @returns {Actor|null} */
export function getTargetedActor() {
  const targets = Array.from(game.user.targets);
  if (targets.length > 1) ui.notifications.info("Múltiplos alvos selecionados — usando o primeiro.");
  return targets[0]?.actor ?? null;
}

/**
 * Aplica dano de ataque no alvo (ou registra no chat se sem permissão).
 * @param {Actor} attacker
 * @param {Actor} targetActor
 * @param {number} damage
 * @param {boolean} [natural20]
 */
export async function resolveAttackDamage(attacker, targetActor, damage, natural20 = false) {
  const crit = natural20 ? " (Natural 20!)" : "";
  if (targetActor.isOwner || game.user.isGM) {
    const newHp = await applyDamage(targetActor, damage);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: attacker }),
      content: `<div class="jungle-juice-card"><p>💥 <strong>${damage}</strong> de dano em <strong>${targetActor.name}</strong>${crit} → HP ${newHp}/${targetActor.system.hp.max}</p></div>`,
    });
  } else {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: attacker }),
      content: `<div class="jungle-juice-card"><p>💥 <strong>${damage}</strong> de dano em <strong>${targetActor.name}</strong>${crit} — <em>aguardando o Mestre aplicar (sem permissão).</em></p></div>`,
    });
  }
}

/**
 * Fluxo completo de ataque com diálogo (igual à ficha).
 * @param {Actor} attacker
 * @param {object} [options]
 * @param {string} [options.presetAttr]
 * @param {Actor} [options.targetActor]
 */
export async function performAttack(attacker, { presetAttr, targetActor } = {}) {
  targetActor = targetActor ?? getTargetedActor();
  const targetAc = targetActor?.system.ac?.value ?? null;
  const abilities = attacker.system.abilities ?? [];
  const items = getGearItems(attacker).filter((item) => item.name?.trim());

  const attrOptions = Object.entries(ATTRIBUTES)
    .map(
      ([key, info]) =>
        `<option value="${key}" ${key === presetAttr ? "selected" : ""}>${info.abbr} — ${info.label}</option>`
    )
    .join("");

  const abilityOptions = abilities
    .map((ab, i) => {
      const type = ABILITY_TYPES[ab.type] ?? ABILITY_TYPES.passiva;
      const cost = type.insanity ? ` · +${type.insanity} ins` : "";
      const dmg = ab.damage?.trim() ? ` · ${ab.damage.trim()}` : "";
      return `<option value="${i}">${ab.name?.trim() || "Sem nome"} (${type.label}${cost}${dmg})</option>`;
    })
    .join("");

  const itemOptions = items
    .map((item) => {
      const tier = ITEM_TIERS[item.system.tier ?? "1"];
      return `<option value="${item.id}">${item.name.trim()} (Tier ${item.system.tier} ${tier?.bonus ?? ""})</option>`;
    })
    .join("");

  const itemBlock = items.length
    ? `<div class="form-group">
         <label>Bônus de item no dano</label>
         <select name="item">
           <option value="-1">Nenhum</option>
           ${itemOptions}
         </select>
       </div>`
    : "";

  const targetBlock = targetActor
    ? `<p class="jj-target">🎯 Alvo: <strong>${targetActor.name}</strong> (AC ${targetAc} · HP ${targetActor.system.hp.value}/${targetActor.system.hp.max})</p>`
    : `<div class="form-group">
         <label>AC do alvo <em>(nenhum alvo selecionado — use T no mapa)</em></label>
         <input type="number" name="ac" value="12"/>
       </div>`;

  const content = `
    <div class="jj-attack-dialog">
      ${targetBlock}
      <div class="form-group">
        <label>Atributo do ataque</label>
        <select name="attr">${attrOptions}</select>
      </div>
      <div class="form-group">
        <label>Usar habilidade do Complex?</label>
        <select name="ability">
          <option value="-1">Nenhuma (ataque comum)</option>
          ${abilityOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Dano (opcional — usado se não houver dado na habilidade)</label>
        <input type="text" name="damage" placeholder="ex: 1d6 + 2"/>
      </div>
      ${itemBlock}
    </div>`;

  const data = await foundry.applications.api.DialogV2.wait({
    window: { title: "Atacar" },
    content,
    buttons: [
      {
        action: "attack",
        label: "Atacar",
        default: true,
        callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
      },
      { action: "cancel", label: "Cancelar", callback: () => null },
    ],
    rejectClose: false,
  });

  if (!data) return;

  await spendTurnAction(attacker, "principal");

  const attrKey = data.attr ?? presetAttr ?? "for";
  const ac = targetActor ? targetAc : Number(data.ac ?? 12);
  const abilityIndex = Number(data.ability ?? -1);
  const ability = abilityIndex >= 0 ? abilities[abilityIndex] : null;
  const attackItemDoc = data.item && data.item !== "-1" ? attacker.items.get(data.item) : null;
  const attackItem = itemRollData(attackItemDoc);

  const { hit, natural20 } = await rollAttack({ actor: attacker, attrKey, ac });
  if (ability) await applyAbilityInsanity(attacker, ability);
  if (!hit) return;

  let damageFormula = (ability?.damage?.trim() || data.damage?.trim() || "").trim();
  damageFormula = appendItemBonus(damageFormula, attackItem);
  if (!damageFormula || !Roll.validate(damageFormula)) return;

  const label = ability?.name?.trim() || attackItem?.name?.trim() || "Ataque";
  const damage = await rollDamage(attacker, damageFormula, label);

  if (targetActor) {
    await resolveAttackDamage(attacker, targetActor, damage, natural20);
  }
}

/**
 * Ataque rápido com atributo e dano fixos (sem diálogo).
 * @param {Actor} attacker
 * @param {object} [options]
 * @param {string} [options.attrKey]
 * @param {string} [options.damage]
 * @param {Actor} [options.targetActor]
 * @param {string} [options.label]
 */
export async function performQuickAttack(
  attacker,
  { attrKey = "for", damage = "1d6", targetActor, label } = {}
) {
  targetActor = targetActor ?? getTargetedActor();
  if (!targetActor) {
    ui.notifications.warn("Selecione um alvo com T (targeting) no mapa.");
    return;
  }

  await spendTurnAction(attacker, "principal");

  const ac = targetActor.system.ac?.value ?? 12;
  const attrInfo = ATTRIBUTES[attrKey];
  const { hit, natural20 } = await rollAttack({
    actor: attacker,
    attrKey,
    ac,
    label: label ?? `Ataque ${attrInfo?.abbr ?? attrKey.toUpperCase()}`,
  });

  if (!hit) return;

  const damageFormula = damage?.trim();
  if (!damageFormula || !Roll.validate(damageFormula)) {
    ui.notifications.warn("Fórmula de dano inválida.");
    return;
  }

  const total = await rollDamage(attacker, damageFormula, label ?? "Ataque rápido");
  await resolveAttackDamage(attacker, targetActor, total, natural20);
}
