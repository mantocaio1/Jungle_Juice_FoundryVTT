import { seedCompendiums } from "./module/compendiums.mjs";

Hooks.once("ready", async () => {
  if (game.system.id !== "jungle-juice") return;
  await seedCompendiums();
});
