import { SYSTEM_ID } from "./config.mjs";

const HUD_ID = "jj-scene-clocks";

/** @returns {object[]} */
function getClocks(scene = canvas?.scene) {
  if (!scene) return [];
  return scene.getFlag(SYSTEM_ID, "clocks") ?? [];
}

/** @param {object[]} clocks @param {Scene} [scene] */
async function saveClocks(clocks, scene = canvas?.scene) {
  if (!scene) return;
  await scene.setFlag(SYSTEM_ID, "clocks", clocks);
  renderClockHud();
}

/** @param {Scene} scene */
function shouldShowClockHud(scene = canvas?.scene) {
  if (!scene) return false;
  if (game.user.isGM) return true;
  return getClocks(scene).some((c) => c.visibleToPlayers);
}

function getHudMount() {
  return document.getElementById("interface") ?? document.body;
}

function segmentHtml(filled, total) {
  const parts = [];
  for (let i = 0; i < total; i++) {
    parts.push(`<span class="jj-clock-seg ${i < filled ? "filled" : ""}"></span>`);
  }
  return parts.join("");
}

function renderClockHud() {
  let root = document.getElementById(HUD_ID);
  const scene = canvas?.scene;

  if (!shouldShowClockHud(scene)) {
    root?.remove();
    return;
  }

  const clocks = getClocks(scene);
  const mount = getHudMount();
  if (!mount) return;

  if (!root) {
    root = document.createElement("div");
    root.id = HUD_ID;
    root.className = "jungle-juice jj-scene-clocks";
    root.addEventListener("click", onClockHudClick);
    mount.append(root);
  } else if (root.parentElement !== mount) {
    mount.append(root);
  }

  const gmControls = game.user.isGM
    ? `<div class="jj-clocks-toolbar">
        <button type="button" data-jj-clock="add" title="Novo relógio">+</button>
        <button type="button" data-jj-clock="collapse" title="Recolher">${root.dataset.collapsed === "1" ? "▸" : "▾"}</button>
      </div>`
    : "";

  const body =
    root.dataset.collapsed === "1"
      ? ""
      : clocks
          .map((clock) => {
            const controls = game.user.isGM
              ? `<div class="jj-clock-actions">
                  <button type="button" data-jj-clock="dec" data-id="${clock.id}" title="Recuar">−</button>
                  <button type="button" data-jj-clock="inc" data-id="${clock.id}" title="Avançar">+</button>
                  <button type="button" data-jj-clock="toggle-vis" data-id="${clock.id}" title="Visível aos jogadores">${clock.visibleToPlayers ? "👁" : "🔒"}</button>
                  <button type="button" data-jj-clock="remove" data-id="${clock.id}" title="Remover">✕</button>
                </div>`
              : "";
            return `<div class="jj-clock" data-id="${clock.id}">
              <div class="jj-clock-name">${foundry.utils.escapeHTML(clock.name)}</div>
              <div class="jj-clock-segments">${segmentHtml(clock.filled, clock.segments)}</div>
              ${controls}
            </div>`;
          })
          .join("");

  root.innerHTML = `<div class="jj-clocks-header"><span>⏱ Relógios</span>${gmControls}</div><div class="jj-clocks-body">${body || '<p class="jj-clocks-empty">Nenhum relógio nesta cena.</p>'}</div>`;
}

/** @param {PointerEvent} event */
async function onClockHudClick(event) {
  const button = event.target.closest("[data-jj-clock]");
  if (!button || !game.user.isGM) return;

  const action = button.dataset.jjClock;
  const scene = canvas?.scene;
  if (!scene) return;

  if (action === "collapse") {
    const root = document.getElementById(HUD_ID);
    if (root) root.dataset.collapsed = root.dataset.collapsed === "1" ? "0" : "1";
    renderClockHud();
    return;
  }

  if (action === "add") {
    const name = await foundry.applications.api.DialogV2.prompt({
      window: { title: "Novo relógio de cena" },
      content: `<label>Nome<input name="name" type="text" style="width:100%" placeholder="Tensão, Investigação, Perseguição..."/></label>
        <label style="display:block;margin-top:8px">Segmentos<input name="segments" type="number" min="2" max="12" value="4" style="width:100%"/></label>`,
      ok: {
        label: "Criar",
        callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object,
      },
      rejectClose: false,
    });
    if (!name?.name?.trim()) return;
    const segments = Math.max(2, Math.min(12, Number(name.segments) || 4));
    const clocks = getClocks(scene);
    clocks.push({
      id: foundry.utils.randomID(),
      name: name.name.trim(),
      segments,
      filled: 0,
      visibleToPlayers: false,
    });
    await saveClocks(clocks, scene);
    return;
  }

  const id = button.dataset.id;
  if (!id) return;
  const clocks = getClocks(scene);
  const clock = clocks.find((c) => c.id === id);
  if (!clock) return;

  if (action === "inc") clock.filled = Math.min(clock.segments, clock.filled + 1);
  else if (action === "dec") clock.filled = Math.max(0, clock.filled - 1);
  else if (action === "toggle-vis") clock.visibleToPlayers = !clock.visibleToPlayers;
  else if (action === "remove") {
    await saveClocks(
      clocks.filter((c) => c.id !== id),
      scene
    );
    if (clock.filled >= clock.segments) {
      ui.notifications.info(`Relógio "${clock.name}" completou antes de ser removido.`);
    }
    return;
  }

  await saveClocks(clocks, scene);

  if (clock.filled >= clock.segments) {
    ui.notifications.warn(`Relógio "${clock.name}" completo!`);
    const content = `<div class="jungle-juice-card"><h3>⏱ Relógio completo</h3><p><strong>${foundry.utils.escapeHTML(clock.name)}</strong> encheu todos os segmentos.</p></div>`;
    await ChatMessage.create({
      content,
      whisper: clock.visibleToPlayers ? [] : ChatMessage.getWhisperRecipients("GM"),
    });
  }
}

/** Relógios de cena visuais (investigação / tensão). */
export function registerSceneClocks() {
  Hooks.once("ready", () => {
    game.jungleJuice ??= {};
    game.jungleJuice.clocks = {
      get: () => getClocks(),
      advance: async (id, amount = 1) => {
        const scene = canvas?.scene;
        if (!scene || !game.user.isGM) return;
        const clocks = getClocks(scene);
        const clock = clocks.find((c) => c.id === id);
        if (!clock) return;
        clock.filled = Math.min(clock.segments, clock.filled + amount);
        await saveClocks(clocks, scene);
      },
      reset: async (id) => {
        const scene = canvas?.scene;
        if (!scene || !game.user.isGM) return;
        const clocks = getClocks(scene);
        const clock = clocks.find((c) => c.id === id);
        if (!clock) return;
        clock.filled = 0;
        await saveClocks(clocks, scene);
      },
    };
    if (canvas?.scene) renderClockHud();
  });

  Hooks.on("canvasReady", renderClockHud);
  Hooks.on("activateCanvasScene", renderClockHud);
  Hooks.on("canvasTearDown", () => document.getElementById(HUD_ID)?.remove());

  Hooks.on("updateScene", (scene, changed) => {
    if (canvas?.scene?.id !== scene.id) return;
    if ("flags" in changed) renderClockHud();
  });
}
