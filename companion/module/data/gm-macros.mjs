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
  whisper: recipients.map((u) => u.id),
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
  await jj.applyCondition(token.actor, form);
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
  {
    name: "Combate — remover condição (alvo)",
    img: "icons/svg/cancel.svg",
    command: `${JJ}
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Selecione um ou mais tokens no mapa.");
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Remover condição" },
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
  ok: { label: "Remover", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object.id },
  rejectClose: false,
});
if (!form) return;
for (const token of tokens) {
  if (!token.actor) continue;
  await jj.removeCondition(token.actor, form);
}
ui.notifications.info(\`Condição removida de \${tokens.length} token(s).\`);`,
  },
  {
    name: "Combate — aplicar dano (alvo)",
    img: "icons/svg/blood.svg",
    command: `${JJ}
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Selecione um ou mais tokens no mapa.");
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Aplicar dano" },
  content: \`<div style="display:flex;flex-direction:column;gap:8px">
    <label>Fórmula <input name="formula" type="text" value="1d6" style="width:100%"/></label>
    <label>Descrição <input name="label" type="text" placeholder="Ex.: mordida, tiro, queda" style="width:100%"/></label>
  </div>\`,
  ok: { label: "Aplicar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object },
  rejectClose: false,
});
if (!form?.formula?.trim()) return;
const label = form.label?.trim() || "Dano";
for (const token of tokens) {
  if (!token.actor) continue;
  const { damage, newHp } = await jj.applyDamageFromRoll(token.actor, form.formula.trim(), label);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: token.actor }),
    content: \`<div class="jungle-juice-card"><p>💥 <strong>-\${damage}</strong> HP → \${newHp}/\${token.actor.system.hp.max}</p></div>\`,
  });
}
ui.notifications.info(\`Dano aplicado em \${tokens.length} token(s).\`);`,
  },
  {
    name: "Combate — estabilizar (medicina)",
    img: "icons/svg/heal.svg",
    command: `${JJ}
const token = canvas.tokens.controlled[0];
if (!token?.actor) return ui.notifications.warn("Selecione o token Morrendo.");
if (token.actor.system.hp.value > 0) return ui.notifications.warn("Personagem não está Morrendo (HP > 0).");
await jj.stabilizeDying(token.actor);`,
  },
  {
    name: "Investigação — pista revelada",
    img: "icons/svg/book.svg",
    command: `${JJ}
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Pista revelada" },
  content: \`<div style="display:flex;flex-direction:column;gap:8px">
    <label>Título <input name="title" type="text" placeholder="Ex.: Diário rasgado" style="width:100%"/></label>
    <label>Conteúdo <textarea name="body" rows="5" style="width:100%" placeholder="O que os jogadores descobrem..."></textarea></label>
    <label><input type="checkbox" name="whisper" checked/> Sussurrar só para jogadores (não GM)</label>
  </div>\`,
  ok: { label: "Revelar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object },
  rejectClose: false,
});
if (!form?.body?.trim()) return;
const title = form.title?.trim() || "Pista encontrada";
const content = \`<div class="jungle-juice-card"><h3>🔎 \${title}</h3><p>\${form.body.trim()}</p></div>\`;
const msg = { content };
if (form.whisper) {
  msg.whisper = game.users.filter((u) => !u.isGM && u.active).map((u) => u.id);
}
await ChatMessage.create(msg);`,
  },
  {
    name: "Horror — evento (+5 Ins + relógio)",
    img: "icons/svg/skull.svg",
    command: `${JJ}
const tokens = canvas.tokens.controlled;
const actors = tokens.length
  ? tokens.map((t) => t.actor).filter(Boolean)
  : jj.getPartyActors();
if (!actors.length) return ui.notifications.warn("Selecione tokens ou tenha PCs no mundo.");
for (const actor of actors) await jj.adjustInsanity(actor, 5);
const clocks = jj.clocks?.get?.() ?? [];
if (clocks.length) await jj.clocks.advance(clocks[0].id, 1);
await ChatMessage.create({
  content: \`<div class="jungle-juice-card"><h3>☠️ Evento de horror</h3><p>+\${actors.length} alvo(s) receberam <strong>+5 Insanidade</strong>\${clocks.length ? " e o relógio avançou." : "."}</p></div>\`,
});
ui.notifications.info("Evento de horror aplicado.");`,
  },
  {
    name: "Combate — NPC atacar alvo (rápido)",
    img: "icons/svg/creature.svg",
    command: `${JJ}
const attacker = canvas.tokens.controlled[0]?.actor;
const target = jj.getTargetedActor();
if (!attacker) return ui.notifications.warn("Selecione o token do NPC/inimigo.");
if (!target) return ui.notifications.warn("Selecione o alvo com T (targeting).");
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Ataque do NPC" },
  content: \`<div style="display:flex;flex-direction:column;gap:8px">
    <label>Atributo<select name="attr">
      <option value="for">FOR — corpo a corpo</option>
      <option value="pre">PRE — à distância</option>
      <option value="agi">AGI — rápido</option>
    </select></label>
    <label>Dano <input name="damage" type="text" value="1d6" style="width:100%"/></label>
  </div>\`,
  ok: { label: "Atacar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object },
  rejectClose: false,
});
if (!form?.damage?.trim()) return;
await jj.performQuickAttack(attacker, {
  attrKey: form.attr,
  damage: form.damage.trim(),
  targetActor: target,
  label: attacker.name,
});`,
  },
];
