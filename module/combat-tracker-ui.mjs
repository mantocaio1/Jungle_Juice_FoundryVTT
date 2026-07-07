import { SYSTEM_ID } from "./config.mjs";
import {
  getTurnActionsState,
  toggleTurnAction,
  resetTurnActions,
} from "./combat-actions.mjs";

const JJ_TYPES = new Set(["character", "npc"]);
const PANEL_CLASS = "jj-combat-actions";

/** @param {Actor|undefined|null} actor */
function isJjActor(actor) {
  return Boolean(actor?.type && JJ_TYPES.has(actor.type));
}

/** @param {import("./combat-actions.mjs").getTurnActionsState extends Function ? ReturnType<typeof getTurnActionsState>[number] : never} action */
function actionButtonHtml(action, canControl) {
  const classes = ["jj-turn-action"];
  if (action.spent) classes.push("spent");
  if (action.blocked) classes.push("blocked");
  const title = `${action.hint}${action.blocked ? ` — Bloqueada por ${action.blockedBy}` : ""}`;
  const disabled = !canControl || action.blocked ? "disabled" : "";

  return `<button type="button" class="${classes.join(" ")}" data-action-id="${action.id}" title="${title}" ${disabled}>
    <span class="jj-turn-action-emoji">${action.emoji}</span>
    <span class="jj-turn-action-label">${action.label}</span>
  </button>`;
}

/** @param {Actor} actor */
function buildPanelHtml(actor) {
  const canControl = actor.isOwner || game.user.isGM;
  const actions = getTurnActionsState(actor);
  const chips = actions.map((action) => actionButtonHtml(action, canControl)).join("");

  return `<div class="${PANEL_CLASS}-header">
      <span>Ações do turno — ${foundry.utils.escapeHTML(actor.name)}</span>
      ${canControl ? `<button type="button" class="jj-reset-actions" data-jj-action="reset" title="Resetar ações manualmente">↺</button>` : ""}
    </div>
    <div class="${PANEL_CLASS}-grid">${chips}</div>`;
}

/** @param {HTMLElement} root */
function findPanelMount(root) {
  return (
    root.querySelector(".combat-tracker") ??
    root.querySelector('[data-application-part="tracker"]') ??
    root.querySelector(".directory-list") ??
    root
  );
}

/** @param {foundry.applications.sidebar.tabs.CombatTracker} app */
function getCombat(app) {
  return app.combat ?? game.combat ?? null;
}

/** @param {foundry.applications.sidebar.tabs.CombatTracker} app @param {HTMLElement} root */
function refreshCombatActions(app, root) {
  const combat = getCombat(app);
  let panel = root.querySelector(`.${PANEL_CLASS}`);

  if (!combat?.started) {
    panel?.remove();
    return;
  }

  const actor = combat.combatant?.actor;
  if (!isJjActor(actor)) {
    panel?.remove();
    return;
  }

  if (!panel) {
    panel = document.createElement("div");
    panel.className = `${PANEL_CLASS} jungle-juice`;
    const mount = findPanelMount(root);
    mount.append(panel);
  }

  panel.innerHTML = buildPanelHtml(actor);
}

/** @param {PointerEvent} event */
async function onPanelClick(event) {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;

  const panel = button.closest(`.${PANEL_CLASS}`);
  if (!panel) return;

  const combat = game.combat;
  const actor = combat?.combatant?.actor;
  if (!isJjActor(actor)) return;
  if (!actor.isOwner && !game.user.isGM) return;

  if (button.dataset.jjAction === "reset") {
    await resetTurnActions(actor);
  } else if (button.dataset.actionId) {
    await toggleTurnAction(actor, button.dataset.actionId);
  }

  const tracker = ui.combat;
  if (tracker?.rendered) tracker.render(false);
}

const boundRoots = new WeakSet();

/** @param {HTMLElement} root */
function bindPanelEvents(root) {
  if (boundRoots.has(root)) return;
  boundRoots.add(root);
  root.addEventListener("click", onPanelClick);
}

/** Painel de ações do turno no Combat Tracker (combatente ativo). */
export function registerCombatTrackerUi() {
  const onRender = (app, root) => {
    if (app.constructor.name !== "CombatTracker") return;
    bindPanelEvents(root);
    refreshCombatActions(app, root);
  };

  Hooks.on("renderCombatTracker", onRender);
  Hooks.on("renderApplicationV2", (app, root) => onRender(app, root));

  Hooks.on("updateCombat", (combat, changed) => {
    if (!("turn" in changed || "round" in changed || "started" in changed)) return;
    const tracker = ui.combat;
    if (tracker?.rendered) tracker.render(false);
  });

  Hooks.on("updateActor", (actor, changed) => {
    if (!changed.system?.actions) return;
    if (!game.combat?.started) return;
    if (game.combat.combatant?.actor?.id !== actor.id) return;
    const tracker = ui.combat;
    if (tracker?.rendered) tracker.render(false);
  });
}
