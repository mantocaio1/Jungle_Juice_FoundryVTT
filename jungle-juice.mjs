import { SYSTEM_ID } from "./module/config.mjs";
import { CharacterModel, NpcModel } from "./module/data/character-model.mjs";
import { JungleJuiceActor } from "./module/documents.mjs";
import { JungleJuiceActorSheet } from "./module/applications/actor-sheet.mjs";
import { registerHandlebarsHelpers } from "./module/helpers.mjs";
import { registerConditions, applyStartOfTurnEffects } from "./module/conditions.mjs";
import { onInsanityChange } from "./module/insanity.mjs";
import { seedCompendiums } from "./module/compendiums.mjs";

Hooks.once("init", () => {
  console.log(`${SYSTEM_ID} | Inicializando sistema Jungle Juice RPG`);

  registerHandlebarsHelpers();
  registerConditions();

  CONFIG.Actor.documentClass = JungleJuiceActor;
  CONFIG.Actor.dataModels.character = CharacterModel;
  CONFIG.Actor.dataModels.npc = NpcModel;

  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["hp", "insanity"],
      value: [],
    },
    npc: {
      bar: ["hp", "insanity"],
      value: [],
    },
  };

  foundry.documents.collections.Actors.registerSheet(SYSTEM_ID, JungleJuiceActorSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "Jungle Juice RPG",
  });
});

// Aplica dano/insanidade contínuos no início do turno do combatente.
Hooks.on("updateCombat", async (combat, changed) => {
  if (!("turn" in changed || "round" in changed)) return;
  if (!game.users.activeGM?.isSelf) return;
  await applyStartOfTurnEffects(combat);
});

// Captura o valor antigo de insanidade antes do update ser aplicado.
Hooks.on("preUpdateActor", (actor, changed, options) => {
  if (changed?.system?.insanity?.value !== undefined) {
    options.jjInsanityOld = actor.system.insanity.value;
  }
});

// Detecta mudanças de insanidade para Colapso/Runaway (executado pelo GM ativo).
Hooks.on("updateActor", async (actor, changed, options) => {
  const newValue = changed?.system?.insanity?.value;
  if (newValue === undefined || options.jjInsanityOld === undefined) return;
  if (!game.users.activeGM?.isSelf) return;
  await onInsanityChange(actor, options.jjInsanityOld, newValue);
});

Hooks.once("ready", async () => {
  console.log(`${SYSTEM_ID} | Sistema pronto`);
  await seedCompendiums();
});
