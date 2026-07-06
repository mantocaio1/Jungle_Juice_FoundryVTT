import { SYSTEM_ID } from "./module/config.mjs";
import { CharacterModel, NpcModel } from "./module/data/character-model.mjs";
import { JungleJuiceActor } from "./module/documents.mjs";
import { JungleJuiceActorSheet } from "./module/applications/actor-sheet.mjs";
import { registerHandlebarsHelpers } from "./module/helpers.mjs";

Hooks.once("init", () => {
  console.log(`${SYSTEM_ID} | Inicializando sistema Jungle Juice RPG`);

  registerHandlebarsHelpers();

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

Hooks.once("ready", () => {
  console.log(`${SYSTEM_ID} | Sistema pronto`);
});
