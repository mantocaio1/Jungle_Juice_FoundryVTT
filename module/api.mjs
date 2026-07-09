import { SYSTEM_ID } from "./config.mjs";
import { shortRest, longRest, applyHealing, adjustInsanity, stabilizeDying } from "./healing.mjs";
import { rollTest, applyDamage, applyDamageFromRoll } from "./dice.mjs";
import { toggleCondition, applyCondition, removeCondition, tryRecoverCondition } from "./conditions.mjs";

/**
 * Resolve o ator alvo de uma interação de cena (macro, Active Tile, etc.).
 * @param {object} [context]
 * @param {Token|object} [context.token]
 * @param {Token[]|object[]} [context.tokens]
 */
export function resolveActor(context = {}) {
  const token = context.token ?? context.tokens?.[0];
  if (token?.actor) return token.actor;

  const controlled = canvas.tokens?.controlled?.[0]?.actor;
  if (controlled) return controlled;

  const character = game.user.character;
  if (character) {
    const active = character.getActiveTokens(false, true)?.[0];
    if (active?.actor) return active.actor;
  }

  return null;
}

/** @returns {Actor[]} personagens de jogador no mundo */
export function getPartyActors() {
  return game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner);
}

/** @param {Actor[]} actors */
export async function shortRestParty(actors = getPartyActors()) {
  for (const actor of actors) await shortRest(actor);
}

/** @param {Actor[]} actors */
export async function longRestParty(actors = getPartyActors()) {
  for (const actor of actors) await longRest(actor);
}

/** API pública para macros, Monk's Active Tiles e módulos externos. */
export function registerApi() {
  game.jungleJuice = {
    ...(game.jungleJuice ?? {}),
    id: SYSTEM_ID,
    shortRest,
    longRest,
    applyHealing,
    adjustInsanity,
    resolveActor,
    getPartyActors,
    shortRestParty,
    longRestParty,
    rollTest,
    toggleCondition,
    applyCondition,
    removeCondition,
    tryRecoverCondition,
    applyDamage,
    applyDamageFromRoll,
    stabilizeDying,
  };
}
