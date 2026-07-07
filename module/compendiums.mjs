import { SYSTEM_ID } from "./config.mjs";
import { FACTIONS } from "./data/factions.mjs";
import { NPCS } from "./data/npcs.mjs";
import { BESTIARY } from "./data/bestiary.mjs";

const PACK_FACTIONS = `${SYSTEM_ID}.faccoes`;
const PACK_NPCS = `${SYSTEM_ID}.npcs`;
const PACK_BESTIARY = `${SYSTEM_ID}.bestiario`;

/**
 * Popula os compêndios do sistema na primeira carga do mundo (GM ativo).
 * Só cria entradas se o pack existir e estiver vazio.
 */
export async function seedCompendiums() {
  if (!game.user.isGM) return;

  await seedFactionPack();
  await seedNpcPack();
  await seedBestiaryPack();
}

/**
 * Desbloqueia temporariamente um compêndium locked, executa a seed e re-bloqueia.
 * @param {string} packId
 * @param {() => Promise<void>} seedFn
 */
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
          text: {
            format: 1,
            content: faction.content.trim(),
          },
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
    ui.notifications.info(`Compêndio "Facções" populado (${FACTIONS.length} entradas).`);
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
    ui.notifications.info(`Compêndio "NPCs" populado (${NPCS.length} entradas).`);
  });
}

async function seedBestiaryPack() {
  await withUnlockedPack(PACK_BESTIARY, async () => {
    const data = BESTIARY.map((entry) => ({
      name: entry.name,
      type: "npc",
      img: entry.img,
      system: entry.system,
      flags: {
        [SYSTEM_ID]: {
          compendium: "bestiary",
          threat: entry.threat,
        },
      },
    }));

    await Actor.implementation.createDocuments(data, { pack: PACK_BESTIARY });
    ui.notifications.info(`Compêndio "Bestiário" populado (${BESTIARY.length} entradas).`);
  });
}
