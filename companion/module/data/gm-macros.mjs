/** Macros de script para o Mestre (compêndio jungle-juice.macros-mestre). */

const JJ = `const jj = game.jungleJuice; if (!jj) return ui.notifications.error("Sistema Jungle Juice não carregado.");`;

const INSANITY_TARGET = `
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Selecione um ou mais tokens no mapa.");
for (const token of tokens) {
  if (!token.actor) continue;
  const cur = token.actor.system.insanity?.value ?? 0;
  const max = token.actor.system.insanity?.max ?? 100;
  await token.actor.update({ "system.insanity.value": Math.min(max, cur + AMOUNT) });
}
ui.notifications.info(\`+\${tokens.length} alvo(s): +AMOUNT Insanidade.\`);
`.trim();

export const GM_MACROS = [
  {
    name: "Horror — +5 Insanidade (alvo)",
    img: "icons/svg/skull.svg",
    command: INSANITY_TARGET.replaceAll("AMOUNT", "5"),
  },
  {
    name: "Horror — +10 Insanidade (alvo)",
    img: "icons/svg/skull.svg",
    command: INSANITY_TARGET.replaceAll("AMOUNT", "10"),
  },
  {
    name: "Horror em massa — +5 Insanidade (todos PCs)",
    img: "icons/svg/hazard.svg",
    command: `
const pcs = game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner);
if (!pcs.length) return ui.notifications.warn("Nenhum personagem de jogador encontrado.");
for (const actor of pcs) {
  const cur = actor.system.insanity?.value ?? 0;
  const max = actor.system.insanity?.max ?? 100;
  await actor.update({ "system.insanity.value": Math.min(max, cur + 5) });
}
ui.notifications.info(\`Evento de horror: +\${pcs.length} personagem(ns) receberam +5 Insanidade.\`);
`.trim(),
  },
  {
    name: "Rolagem de Terror (D20)",
    img: "icons/svg/dice-target.svg",
    command: `
const roll = await new Roll("1d20").evaluate();
await roll.toMessage({ flavor: "Rolagem de Terror — evento sobrenatural" });
`.trim(),
  },
  {
    name: "Whisper — alucinação (token selecionado)",
    img: "icons/svg/eye.svg",
    command: `
const token = canvas.tokens.controlled[0];
if (!token?.actor) return ui.notifications.warn("Selecione um token com personagem.");
const recipients = game.users.filter(
  (u) => !u.isGM && token.actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
);
if (!recipients.length) return ui.notifications.warn("Nenhum jogador dono deste token.");
await ChatMessage.create({
  content: \`<div class="jungle-juice-card"><h3>👁️ Alucinação</h3><p><em>(Edite o texto desta mensagem antes de enviar, se necessário.)</em></p><p>Você vê algo que não deveria estar ali...</p></div>\`,
  whisper: ChatMessage.getWhisperRecipients(recipients.map((u) => u.name)),
});
`.trim(),
  },
  {
    name: "Resetar ações de turno (token selecionado)",
    img: "icons/svg/clockwork.svg",
    command: `
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Selecione um ou mais tokens.");
for (const token of tokens) {
  if (!token.actor) continue;
  await token.actor.update({
    "system.actions.principal": false,
    "system.actions.movement": false,
    "system.actions.support": false,
    "system.actions.free": false,
  });
}
ui.notifications.info(\`Ações de turno resetadas para \${tokens.length} token(s).\`);
`.trim(),
  },
  {
    name: "Investigação — teste em grupo (PER)",
    img: "icons/svg/search.svg",
    command: `${JJ}
const tokens = canvas.tokens.controlled;
const actors = tokens.length
  ? tokens.map((t) => t.actor).filter(Boolean)
  : jj.getPartyActors();
if (!actors.length) return ui.notifications.warn("Selecione tokens no mapa ou tenha PCs no mundo.");
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Teste em grupo" },
  content: \`<div style="display:flex;flex-direction:column;gap:8px">
    <label>Atributo<select name="attr"><option value="per">PER — Percepção</option><option value="int">INT — Investigação</option><option value="men">MEN — Intuição</option></select></label>
    <label>CD <input type="number" name="dc" value="14" min="1" max="30" style="width:100%"/></label>
    <label>Descrição <input type="text" name="label" placeholder="Ex.: encontrar pistas na sala" style="width:100%"/></label>
  </div>\`,
  ok: { label: "Rolar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object },
  rejectClose: false,
});
if (!form) return;
const dc = Number(form.dc) || 14;
const label = form.label?.trim() || "Teste em grupo";
let successes = 0;
for (const actor of actors) {
  const result = await jj.rollTest({ actor, attrKey: form.attr, target: dc, label });
  if (result.success) successes += 1;
}
await ChatMessage.create({
  content: \`<div class="jungle-juice-card"><h3>Investigação em grupo</h3><p><strong>\${successes}/\${actors.length}</strong> sucesso(s) — CD \${dc} (\${label})</p></div>\`,
});`,
  },
  {
    name: "Combate — aplicar condição (alvo)",
    img: "icons/svg/aura.svg",
    command: `${JJ}
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Selecione um ou mais tokens no mapa.");
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Aplicar condição" },
  content: \`<label>Condição<select name="id" style="width:100%">
    <option value="stunned">Atordoado</option>
    <option value="poisoned">Envenenado</option>
    <option value="immobilized">Imobilizado</option>
    <option value="bleeding">Sangrando</option>
    <option value="hallucinating">Alucinado</option>
    <option value="blinded">Cego</option>
    <option value="deafened">Surdo</option>
    <option value="burning">Queimando</option>
  </select></label>\`,
  ok: { label: "Aplicar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object.id },
  rejectClose: false,
});
if (!form) return;
for (const token of tokens) {
  if (!token.actor) continue;
  await jj.toggleCondition(token.actor, form);
}
ui.notifications.info(\`Condição aplicada em \${tokens.length} token(s).\`);`,
  },
  {
    name: "Combate — curar alvo (+1d6 HP)",
    img: "icons/svg/regen.svg",
    command: `${JJ}
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Selecione um ou mais tokens.");
for (const token of tokens) {
  if (!token.actor) continue;
  const roll = await new Roll("1d6").evaluate();
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: token.actor }), flavor: "Cura rápida" });
  await jj.applyHealing(token.actor, roll.total);
}
ui.notifications.info(\`Cura aplicada em \${tokens.length} token(s).\`);`,
  },
];
