const EMPTY_ITEMS = [
  { name: "", tier: "1", desc: "" },
  { name: "", tier: "1", desc: "" },
];

/**
 * Monta o bloco system de um Actor NPC a partir de atributos e extras.
 * @param {Record<string, number>} attrs
 * @param {object} [extras]
 */
export function buildNpcSystem(attrs, extras = {}) {
  const hpMax = 10 + attrs.res * 2;
  const spent = Object.values(attrs).reduce((s, v) => s + v, 0);
  return {
    insect: extras.insect ?? "",
    origin: extras.origin ?? "",
    motivation: extras.motivation ?? "",
    faction: extras.faction ?? "NEST",
    attributes: attrs,
    points: { total: 21, spent, remaining: Math.max(0, 21 - spent) },
    hp: { value: extras.hp ?? hpMax, max: hpMax },
    ac: { value: 8 + attrs.agi },
    insanity: { value: extras.insanity ?? 0, max: 100 },
    extraWeaknesses: extras.extraWeaknesses ?? 0,
    abilities: extras.abilities ?? [],
    items: extras.items ?? EMPTY_ITEMS,
    dying: false,
    runaway: extras.runaway ?? { unlocked: false, active: false },
  };
}
