/** Constantes do sistema Jungle Juice RPG */

export const SYSTEM_ID = "jungle-juice";

export const ATTRIBUTE_POINTS = 21;
export const MAX_ATTRIBUTE_AT_CREATION = 7;

export const ATTRIBUTES = {
  for: { label: "Força", abbr: "FOR", emoji: "👊" },
  agi: { label: "Agilidade", abbr: "AGI", emoji: "🌪️" },
  res: { label: "Resistência", abbr: "RES", emoji: "💪" },
  men: { label: "Mente", abbr: "MEN", emoji: "🧠" },
  per: { label: "Percepção", abbr: "PER", emoji: "👁️" },
  pre: { label: "Precisão", abbr: "PRE", emoji: "🎯" },
  int: { label: "Inteligência", abbr: "INT", emoji: "💡" },
};

export const ABILITY_TYPES = {
  passiva: { label: "Passiva simples", cost: 1, insanity: 0, badge: "P", color: "#4CAF70" },
  ativa_l: { label: "Ativa leve", cost: 2, insanity: 5, badge: "AL", color: "#FFC107" },
  ativa_f: { label: "Ativa forte", cost: 3, insanity: 10, badge: "AF", color: "#FF9800" },
  especial: { label: "Especial / única", cost: 4, insanity: 15, badge: "E", color: "#F44336" },
};

export const ITEM_TIERS = {
  "1": { label: "Improvisado", bonus: "+1d4", heal: "1d4" },
  "2": { label: "Refinado", bonus: "+1d6", heal: "1d6" },
  "3": { label: "Especializado", bonus: "+1d8", heal: "1d8" },
};

/** Descanso curto (1h): recupera RES em HP e reduz insanidade. */
export const SHORT_REST = { hpAttr: "res", insanity: -5, label: "Descanso Curto (1h)" };

/** Descanso longo (8h): HP cheio e redução maior de insanidade. */
export const LONG_REST = { insanity: -15, label: "Descanso Longo (8h)" };

export const DIFFICULTY = {
  trivial: 4,
  easy: 8,
  medium: 12,
  hard: 16,
  legendary: 20,
};

export const INSANITY_THRESHOLDS = [
  { max: 24, label: "Estável", color: "#4CAF70" },
  { max: 49, label: "Tenso", color: "#FFC107" },
  { max: 74, label: "Abalado", color: "#FF9800" },
  { max: 99, label: "Perturbado", color: "#F44336" },
  { max: 100, label: "COLAPSO", color: "#B71C1C" },
];

export const BASE_COMPLEX_POINTS = 5;
export const MAX_EXTRA_WEAKNESSES = 2;
export const MAX_ABILITIES = 6;
export const MAX_ITEMS = 2;

export const HALLUCINATION_THRESHOLD = 50;
export const RUNAWAY_THRESHOLD = 75;
export const COLLAPSE_VALUE = 100;
export const RUNAWAY_STATUS_ID = "runaway";

/** Nomes das facções reconhecidas (Guia do Player). */
export const FACTION_NAMES = [
  "NEST",
  "Pet Shop",
  "Stray Dogs",
  "Hollow",
  "The Swarm",
  "Prometheus",
  "The Web",
  "Blackmoth",
];

/** CD para teste de estabilização (Morrendo → 1 HP). */
export const STABILIZE_DC = 12;
export const STABILIZE_ATTR = "res";

/** 4 ações por turno de combate (Parte 4). `spent: true` = já usada. */
export const TURN_ACTIONS = [
  {
    id: "principal",
    label: "Principal",
    emoji: "⚔️",
    hint: "Ataque, habilidade ativa do Complex ou ação equivalente.",
  },
  {
    id: "movement",
    label: "Movimentação",
    emoji: "🏃",
    hint: "Deslocar-se no mapa (distância conforme regras da mesa).",
  },
  {
    id: "support",
    label: "Suporte",
    emoji: "🤝",
    hint: "Ajudar aliado, usar item, estabilizar, etc.",
  },
  {
    id: "free",
    label: "Livre",
    emoji: "💬",
    hint: "Falar, sacar item, abrir porta — perdida se Atordoado.",
  },
];

export const PHYSICAL_ATTRS = ["for", "agi", "res", "pre"];
export const MENTAL_ATTRS = ["men", "per"];

/**
 * Condições de combate (Parte 4). Registradas como status effects do Foundry.
 * - disadvantage: "all" | "physical" | "mental" | "attack" | null
 * - perTurnHp: fórmula de dano por turno (string) ou null
 * - perTurnInsanity: ganho de insanidade por turno (número) ou 0
 */
export const CONDITIONS = [
  {
    id: "stunned",
    name: "Atordoado",
    img: "icons/svg/daze.svg",
    disadvantage: "all",
    perTurnHp: null,
    perTurnInsanity: 0,
    recovery: { attr: "res", dc: 12 },
    hint: "Desvantagem em todos os testes. Perde a Ação Livre. RES CD 12 para recuperar.",
  },
  {
    id: "poisoned",
    name: "Envenenado",
    img: "icons/svg/poison.svg",
    disadvantage: "physical",
    perTurnHp: "1d4",
    perTurnInsanity: 0,
    recovery: { attr: "res", dc: 12 },
    hint: "Desvantagem em testes físicos. Perde 1d4 HP por turno. RES CD 12 para tratar.",
  },
  {
    id: "immobilized",
    name: "Imobilizado",
    img: "icons/svg/net.svg",
    disadvantage: null,
    perTurnHp: null,
    perTurnInsanity: 0,
    recovery: { attr: "agi", dc: 12 },
    hint: "Não pode usar Suporte/Movimentação. AGI CD 12 para se soltar.",
  },
  {
    id: "bleeding",
    name: "Sangrando",
    img: "icons/svg/blood.svg",
    disadvantage: null,
    perTurnHp: "1d4",
    perTurnInsanity: 0,
    recovery: { attr: "res", dc: 12 },
    hint: "Perde 1d4 HP no início de cada turno. RES CD 12 para estancar.",
  },
  {
    id: "hallucinating",
    name: "Alucinado",
    img: "icons/svg/stoned.svg",
    disadvantage: "mental",
    perTurnHp: null,
    perTurnInsanity: 5,
    recovery: { attr: "men", dc: 14 },
    hint: "Desvantagem em Mente e Percepção. +5 Insanidade por turno. MEN CD 14 para recuperar.",
  },
  {
    id: "blinded",
    name: "Cego",
    img: "icons/svg/blind.svg",
    disadvantage: "attack",
    perTurnHp: null,
    perTurnInsanity: 0,
    hint: "Desvantagem em ataques.",
  },
  {
    id: "deafened",
    name: "Surdo",
    img: "icons/svg/deaf.svg",
    disadvantage: null,
    perTurnHp: null,
    perTurnInsanity: 0,
    hint: "Falha automática em Percepção auditiva.",
  },
  {
    id: "burning",
    name: "Queimando",
    img: "icons/svg/fire.svg",
    disadvantage: null,
    perTurnHp: "1d6",
    perTurnInsanity: 0,
    recovery: { attr: "agi", dc: 12 },
    hint: "1d6 de dano por turno. AGI CD 12 para apagar.",
  },
];

/** @param {string} id */
export function getCondition(id) {
  return CONDITIONS.find((c) => c.id === id);
}

/**
 * Determina se um teste com dado atributo sofre desvantagem, dadas as
 * condições ativas de um ator.
 * @param {Set<string>} statuses IDs de status ativos (actor.statuses)
 * @param {string} attrKey
 * @param {boolean} [isAttack]
 * @returns {boolean}
 */
export function hasDisadvantage(statuses, attrKey, isAttack = false) {
  for (const condition of CONDITIONS) {
    if (!statuses.has(condition.id)) continue;
    switch (condition.disadvantage) {
      case "all":
        return true;
      case "physical":
        if (PHYSICAL_ATTRS.includes(attrKey)) return true;
        break;
      case "mental":
        if (MENTAL_ATTRS.includes(attrKey)) return true;
        break;
      case "attack":
        if (isAttack) return true;
        break;
    }
  }
  return false;
}

/** @param {number} value */
export function getInsanityState(value) {
  for (const threshold of INSANITY_THRESHOLDS) {
    if (value <= threshold.max) return threshold;
  }
  return INSANITY_THRESHOLDS.at(-1);
}

/** Surdo falha automaticamente em testes de percepção auditiva. */
export function autoFailsAuditoryTest(statuses) {
  return statuses?.has("deafened") ?? false;
}
