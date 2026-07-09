import { MODULE_ID, SYSTEM_ID } from "./config.mjs";
import { FACTIONS } from "./data/factions.mjs";
import { NPCS } from "./data/npcs.mjs";
import { BESTIARY } from "./data/bestiary.mjs";
import { GM_MACROS } from "./data/gm-macros.mjs";
import { ENVIRONMENT_MACROS } from "./data/environment-macros.mjs";
import { SCENE_TEMPLATES } from "./data/scenes.mjs";

const ALL_MACROS = [...GM_MACROS, ...ENVIRONMENT_MACROS];

const PACK_FACTIONS = `${MODULE_ID}.faccoes`;
const PACK_NPCS = `${MODULE_ID}.npcs`;
const PACK_BESTIARY = `${MODULE_ID}.bestiario`;
const PACK_MACROS = `${MODULE_ID}.macros-mestre`;
const PACK_SCENES = `${MODULE_ID}.cenas`;

/** Popula os compêndios na primeira carga do mundo (GM ativo). */
export async function seedCompendiums() {
  if (!game.user.isGM) return;

  await seedFactionPack();
  await seedNpcPack();
  await seedBestiaryPack();
  await seedMacroPack();
  await seedScenePack();
  await ensureNpcPack();
  await ensureMacroPack();
}

async function withUnlockedPack(packId, seedFn) {
  const pack = game.packs.get(packId);
  if (!pack || pack.index.size > 0) return;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });

  try {
    await seedFn();
  } finally {
    if (wasLocked) await pack.configure({ locked: true });
  }
}

async function seedFactionPack() {
  await withUnlockedPack(PACK_FACTIONS, async () => {
    const data = FACTIONS.map((faction) => ({
      name: faction.name,
      img: faction.img,
      pages: [
        {
          name: faction.name,
          type: "text",
          title: { show: true, level: 1 },
          text: { format: 1, content: faction.content.trim() },
        },
      ],
      flags: {
        [SYSTEM_ID]: {
          tagline: faction.tagline,
          stance: faction.stance,
          factionId: faction.id,
        },
      },
    }));

    await JournalEntry.implementation.createDocuments(data, { pack: PACK_FACTIONS });
    ui.notifications.info(`[Jungle Juice] Compêndio "Facções" populado (${FACTIONS.length} entradas).`);
  });
}

async function seedNpcPack() {
  await withUnlockedPack(PACK_NPCS, async () => {
    const data = NPCS.map((npc) => ({
      name: npc.name,
      type: "npc",
      img: npc.img,
      system: npc.system,
    }));

    await Actor.implementation.createDocuments(data, { pack: PACK_NPCS });
    ui.notifications.info(`[Jungle Juice] Compêndio "NPCs" populado (${NPCS.length} entradas).`);
  });
}

/** Adiciona NPCs novos em mundos que já tinham o compêndio populado. */
async function ensureNpcPack() {
  const pack = game.packs.get(PACK_NPCS);
  if (!pack || pack.index.size === 0) return;

  const existing = new Set((await pack.getDocuments()).map((doc) => doc.name));
  const missing = NPCS.filter((npc) => !existing.has(npc.name));
  if (!missing.length) return;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  try {
    await Actor.implementation.createDocuments(
      missing.map((npc) => ({
        name: npc.name,
        type: "npc",
        img: npc.img,
        system: npc.system,
      })),
      { pack: PACK_NPCS }
    );
    ui.notifications.info(`[Jungle Juice] ${missing.length} NPC(s) adicionado(s) ao compêndio.`);
  } finally {
    if (wasLocked) await pack.configure({ locked: true });
  }
}

async function seedBestiaryPack() {
  await withUnlockedPack(PACK_BESTIARY, async () => {
    const data = BESTIARY.map((entry) => ({
      name: entry.name,
      type: "npc",
      img: entry.img,
      system: entry.system,
      flags: {
        [SYSTEM_ID]: { compendium: "bestiary", threat: entry.threat },
      },
    }));

    await Actor.implementation.createDocuments(data, { pack: PACK_BESTIARY });
    ui.notifications.info(`[Jungle Juice] Compêndio "Bestiário" populado (${BESTIARY.length} entradas).`);
  });
}

async function seedMacroPack() {
  await withUnlockedPack(PACK_MACROS, async () => {
    const data = ALL_MACROS.map((macro) => ({
      name: macro.name,
      type: "script",
      img: macro.img,
      command: macro.command,
      scope: "global",
    }));

    await Macro.implementation.createDocuments(data, { pack: PACK_MACROS });
    ui.notifications.info(`[Jungle Juice] Compêndio "Macros do Mestre" populado (${ALL_MACROS.length} entradas).`);
  });
}

/** Adiciona macros novas em mundos que já tinham o compêndio populado. */
async function ensureMacroPack() {
  const pack = game.packs.get(PACK_MACROS);
  if (!pack || pack.index.size === 0) return;

  const existing = new Set((await pack.getDocuments()).map((doc) => doc.name));
  const missing = ALL_MACROS.filter((macro) => !existing.has(macro.name));
  if (!missing.length) return;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  try {
    await Macro.implementation.createDocuments(
      missing.map((macro) => ({
        name: macro.name,
        type: "script",
        img: macro.img,
        command: macro.command,
        scope: "global",
      })),
      { pack: PACK_MACROS }
    );
    ui.notifications.info(`[Jungle Juice] ${missing.length} macro(s) de ambiente adicionada(s).`);
  } finally {
    if (wasLocked) await pack.configure({ locked: true });
  }
}

async function seedScenePack() {
  await withUnlockedPack(PACK_SCENES, async () => {
    const data = SCENE_TEMPLATES.map((scene) => ({
      name: scene.name,
      img: scene.img,
      pages: [
        {
          name: scene.name,
          type: "text",
          title: { show: true, level: 1 },
          text: { format: 1, content: scene.content.trim() },
        },
      ],
      flags: {
        [SYSTEM_ID]: { tagline: scene.tagline, sceneId: scene.id },
      },
    }));

    await JournalEntry.implementation.createDocuments(data, { pack: PACK_SCENES });
    ui.notifications.info(`[Jungle Juice] Compêndio "Cenas" populado (${SCENE_TEMPLATES.length} entradas).`);
  });
}
