import { ATTRIBUTES, ABILITY_TYPES, getInsanityState } from "./config.mjs";

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

/**
 * Usa uma habilidade do Insecta Complex, aplicando o custo de insanidade
 * conforme o tipo. Habilidades passivas não têm custo.
 * @param {object} options
 * @param {Actor} options.actor
 * @param {number} options.index Índice da habilidade em system.abilities
 */
export async function useAbility({ actor, index }) {
  const ability = actor.system.abilities?.[index];
  if (!ability) return;

  const type = ABILITY_TYPES[ability.type] ?? ABILITY_TYPES.passiva;
  const cost = type.insanity ?? 0;
  const name = ability.name?.trim() || "Habilidade sem nome";

  let newInsanity = actor.system.insanity.value;
  if (cost > 0) {
    newInsanity = Math.min(actor.system.insanity.max, newInsanity + cost);
    await actor.update({ "system.insanity.value": newInsanity });
  }

  const state = getInsanityState(newInsanity);
  const costLine =
    cost > 0
      ? `<p>🌑 <strong>+${cost} Insanidade</strong> → ${newInsanity}/100 <span style="color:${state.color}">(${state.label})</span></p>`
      : `<p>✨ Sem custo de insanidade (passiva)</p>`;

  const damageLine = ability.damage?.trim()
    ? `<p>🎲 Dano: <strong>${ability.damage.trim()}</strong></p>`
    : "";

  const weaknessLine = ability.weakness?.trim()
    ? `<p>⚠️ <em>Fraqueza:</em> ${ability.weakness.trim()}</p>`
    : "";

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="jungle-juice-card">
        <h3>🐛 ${name} <small>(${type.label})</small></h3>
        ${ability.desc?.trim() ? `<p>${ability.desc.trim()}</p>` : ""}
        ${damageLine}
        ${costLine}
        ${weaknessLine}
      </div>`,
  });

  // Rola o dano automaticamente se um dado válido foi definido.
  if (ability.damage?.trim() && Roll.validate(ability.damage.trim())) {
    const roll = await new Roll(ability.damage.trim()).evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Dano — ${name}`,
    });
  }

  return { cost, newInsanity };
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
