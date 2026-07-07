import { SYSTEM_ID, getInsanityState } from "./config.mjs";

const JJ_TYPES = new Set(["character", "npc"]);

/** @param {Actor|undefined|null} actor */
function isJjActor(actor) {
  return Boolean(actor?.type && JJ_TYPES.has(actor.type));
}

const PROTOTYPE_TOKEN = {
  displayBars: 50,
  bar1: { attribute: "hp" },
  bar2: { attribute: "insanity" },
};

/** Garante barras de HP/insanidade visíveis nos tokens Jungle Juice. */
export function registerTokenBars() {
  Hooks.on("preCreateActor", (_document, data) => {
    if (!JJ_TYPES.has(data.type)) return;
    data.prototypeToken = foundry.utils.mergeObject(data.prototypeToken ?? {}, PROTOTYPE_TOKEN);
  });

  Hooks.on("preCreateToken", (document, data) => {
    const actor =
      document.parent ??
      (data.actorId ? game.actors?.get(data.actorId) : null);
    if (!isJjActor(actor)) return;

    data.displayBars ??= CONST.TOKEN_DISPLAY_MODES.ALWAYS;
    data.bar1 = foundry.utils.mergeObject(data.bar1 ?? {}, { attribute: "hp" });
    data.bar2 = foundry.utils.mergeObject(data.bar2 ?? {}, { attribute: "insanity" });
  });

  Hooks.once("init", () => {
    const Color = foundry.utils.Color;
    CONFIG.Token.barConfig = foundry.utils.mergeObject(CONFIG.Token.barConfig ?? {}, {
      bar2: {
        colors: {
          empty: Color.from("#1a0a0a"),
          full: Color.from("#9C27B0"),
        },
      },
    });
  });

  Hooks.once("canvasReady", () => {
    const Token = foundry.canvas.placeables.Token;
    const original = Token.prototype._getBarColors;

    Token.prototype._getBarColors = function (index, data) {
      if (!isJjActor(this.document?.actor)) {
        return original.call(this, index, data);
      }

      if (index === 1) {
        const dying = this.document.actor.system.dying;
        if (dying) {
          return {
            empty: foundry.utils.Color.from("#3a0a0a"),
            full: foundry.utils.Color.from("#B71C1C"),
          };
        }
        return {
          empty: foundry.utils.Color.from("#1a2e1e"),
          full: foundry.utils.Color.from("#4CAF70"),
        };
      }

      if (index === 2) {
        const value = Number(data?.value ?? this.document.actor.system.insanity?.value ?? 0);
        const color = getInsanityState(value).color;
        return {
          empty: foundry.utils.Color.from("#1a0a0a"),
          full: foundry.utils.Color.from(color),
        };
      }

      return original.call(this, index, data);
    };
  });

  Hooks.once("ready", async () => {
    if (!game.user.isGM) return;

    const updates = [];
    for (const actor of game.actors.filter((a) => isJjActor(a))) {
      const proto = actor.prototypeToken;
      if (proto.displayBars >= CONST.TOKEN_DISPLAY_MODES.ALWAYS) continue;
      updates.push({
        _id: actor.id,
        "prototypeToken.displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        "prototypeToken.bar1.attribute": "hp",
        "prototypeToken.bar2.attribute": "insanity",
      });
    }

    if (updates.length) {
      await Actor.updateDocuments(updates);
      console.log(`${SYSTEM_ID} | Protótipos de token atualizados (${updates.length} atores)`);
    }
  });
}
