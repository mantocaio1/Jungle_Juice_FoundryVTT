/** Macros de script para o Mestre (compêndio jungle-juice.macros-mestre). */

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
];
