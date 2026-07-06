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
  "1": { label: "Improvisado", bonus: "+1d4" },
  "2": { label: "Refinado", bonus: "+1d6" },
  "3": { label: "Especializado", bonus: "+1d8" },
};

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

/** @param {number} value */
export function getInsanityState(value) {
  for (const threshold of INSANITY_THRESHOLDS) {
    if (value <= threshold.max) return threshold;
  }
  return INSANITY_THRESHOLDS.at(-1);
}
