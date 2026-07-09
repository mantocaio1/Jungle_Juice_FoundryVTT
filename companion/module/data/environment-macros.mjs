/** Macros de interação ambiental (camas, objetos, descanso em grupo). */

const JJ = `const jj = game.jungleJuice;
if (!jj) return ui.notifications.error("Sistema Jungle Juice não carregado.");`;

const RESOLVE_ACTOR = `
const ctx = typeof args !== "undefined" ? args : {};
const actor = jj.resolveActor(ctx);
if (!actor) return ui.notifications.warn("Nenhum personagem encontrado. Selecione seu token ou clique no objeto com o token no mapa.");
`.trim();

export const ENVIRONMENT_MACROS = [
  {
    name: "Ambiente — Descanso Curto (1h)",
    img: "icons/svg/bed.svg",
    command: `${JJ}
${RESOLVE_ACTOR}
await jj.shortRest(actor);`,
  },
  {
    name: "Ambiente — Descanso Longo (8h)",
    img: "icons/svg/moon.svg",
    command: `${JJ}
${RESOLVE_ACTOR}
await jj.longRest(actor);`,
  },
  {
    name: "Ambiente — Descanso Curto (grupo)",
    img: "icons/svg/campfire.svg",
    command: `${JJ}
const party = jj.getPartyActors();
if (!party.length) return ui.notifications.warn("Nenhum personagem de jogador no mundo.");
await jj.shortRestParty(party);
ui.notifications.info(\`Descanso curto aplicado a \${party.length} personagem(ns).\`);`,
  },
  {
    name: "Ambiente — Descanso Longo (grupo)",
    img: "icons/svg/temple.svg",
    command: `${JJ}
const party = jj.getPartyActors();
if (!party.length) return ui.notifications.warn("Nenhum personagem de jogador no mundo.");
await jj.longRestParty(party);
ui.notifications.info(\`Descanso longo aplicado a \${party.length} personagem(ns).\`);`,
  },
  {
    name: "Ambiente — Examinar objeto",
    img: "icons/svg/magnifying-glass.svg",
    command: `${JJ}
${RESOLVE_ACTOR}
const label = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Examinar objeto" },
  content: '<input name="label" type="text" style="width:100%" placeholder="Nome do objeto (ex: Cama, Armário, Diário...)"/>',
  ok: {
    label: "Continuar",
    callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object.label,
  },
  rejectClose: false,
});
if (!label?.trim()) return;
const detail = await foundry.applications.api.DialogV2.prompt({
  window: { title: "O que o personagem percebe?" },
  content: '<textarea name="detail" rows="5" style="width:100%" placeholder="Descrição visível ao jogador..."></textarea>',
  ok: {
    label: "Mostrar no chat",
    callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object.detail,
  },
  rejectClose: false,
});
if (!detail?.trim()) return;
await ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor }),
  content: \`<div class="jungle-juice-card"><h3>🔍 \${label.trim()}</h3><p>\${detail.trim()}</p></div>\`,
});`,
  },
  {
    name: "Ambiente — Local inquietante (+5 Ins)",
    img: "icons/svg/ghost.svg",
    command: `${JJ}
${RESOLVE_ACTOR}
const cur = actor.system.insanity?.value ?? 0;
const max = actor.system.insanity?.max ?? 100;
await jj.adjustInsanity(actor, 5);
ui.notifications.info(\`\${actor.name}: o ambiente pesou sobre a mente (+5 Insanidade).\`);`,
  },
  {
    name: "Ambiente — Mensagem de interação",
    img: "icons/svg/speech-bubble.svg",
    command: `${JJ}
const text = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Mensagem de ambiente" },
  content: '<textarea name="text" rows="4" style="width:100%" placeholder="Texto exibido no chat quando o jogador interage..."></textarea>',
  ok: {
    label: "Enviar",
    callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object.text,
  },
  rejectClose: false,
});
if (!text?.trim()) return;
await ChatMessage.create({
  content: \`<div class="jungle-juice-card"><p>\${text.trim()}</p></div>\`,
});`,
  },
];
