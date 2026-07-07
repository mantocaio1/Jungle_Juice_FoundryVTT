import { createActorFromFicha, promptFichaJson } from "./import-ficha.mjs";

/** Botão na sidebar de Atores para criar personagem a partir de JSON (GM). */
export function registerActorDirectory() {
  Hooks.once("init", () => {
    const ActorDirectory = foundry.applications.sidebar.tabs.ActorDirectory;
    const baseActions = ActorDirectory.DEFAULT_OPTIONS.actions ?? {};

    ActorDirectory.DEFAULT_OPTIONS.actions = {
      ...baseActions,
      createFromFicha: async function createFromFicha() {
        if (!game.user.isGM) return;

        const text = await promptFichaJson();
        if (!text) return;

        try {
          const actor = await createActorFromFicha(text);
          ui.notifications.info(`Personagem criado: ${actor.name}`);
          actor.sheet?.render(true);
          this.render(false);
        } catch (error) {
          ui.notifications.error(`Criação falhou: ${error.message}`);
        }
      },
    };
  });

  const addCreateButton = (app, controls) => {
    if (app.collection?.documentName !== "Actor") return;
    if (!game.user.isGM) return;
    if (controls.some((c) => c.action === "createFromFicha")) return;

    controls.push({
      action: "createFromFicha",
      icon: "fa-solid fa-file-import",
      label: game.i18n.localize("JUNGLEJUICE.CreateFromFicha"),
      tooltip: game.i18n.localize("JUNGLEJUICE.CreateFromFichaHint"),
    });
  };

  Hooks.on("getHeaderControlsActorDirectory", addCreateButton);
  Hooks.on("getHeaderControlsDocumentDirectory", addCreateButton);
}
