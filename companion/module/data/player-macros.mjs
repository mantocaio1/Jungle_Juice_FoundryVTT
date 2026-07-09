/** Macros de script para jogadores (compêndio jungle-juice.macros-jogador). */

const JJ = `const jj = game.jungleJuice;
if (!jj) return ui.notifications.error("Sistema Jungle Juice não carregado.");`;

const RESOLVE = `
const actor = jj.resolveActor();
if (!actor) return ui.notifications.warn("Selecione seu token no mapa ou use o personagem vinculado.");
`.trim();

const PICK_HEALING_ITEM = `
const items = actor.items.filter((i) => i.type === "gear" && i.name?.trim());
if (!items.length) return ui.notifications.warn("Nenhum item nomeado na ficha. Adicione itens na aba Itens.");
const options = items.map((i) => {
  const tier = i.system.tier ?? "1";
  return \`<option value="\${i.id}">\${i.name.trim()} (Tier \${tier})</option>\`;
}).join("");
const picked = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Item de cura" },
  content: \`<label>Item<select name="id" style="width:100%">\${options}</select></label>\`,
  ok: { label: "Usar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object.id },
  rejectClose: false,
});
if (!picked) return;
`.trim();

export const PLAYER_MACROS = [
  {
    name: "Jogador — Atacar (com opções)",
    img: "icons/svg/sword.svg",
    command: `${JJ}
${RESOLVE}
await jj.performAttack(actor);`,
  },
  {
    name: "Jogador — Ataque corpo a corpo (FOR)",
    img: "icons/svg/sword.svg",
    command: `${JJ}
${RESOLVE}
await jj.performQuickAttack(actor, { attrKey: "for", damage: "1d6", label: "Ataque corpo a corpo" });`,
  },
  {
    name: "Jogador — Ataque à distância (PRE)",
    img: "icons/svg/crosshair.svg",
    command: `${JJ}
${RESOLVE}
await jj.performQuickAttack(actor, { attrKey: "pre", damage: "1d6", label: "Ataque à distância" });`,
  },
  {
    name: "Jogador — Curar a si (item)",
    img: "icons/svg/regen.svg",
    command: `${JJ}
${RESOLVE}
${PICK_HEALING_ITEM}
await jj.useHealingItem(actor, picked, actor);`,
  },
  {
    name: "Jogador — Curar aliado (item)",
    img: "icons/svg/heal.svg",
    command: `${JJ}
${RESOLVE}
const target = jj.getTargetedActor() ?? actor;
if (!jj.getTargetedActor()) ui.notifications.info("Nenhum alvo com T — curando a si mesmo.");
${PICK_HEALING_ITEM}
await jj.useHealingItem(actor, picked, target);`,
  },
  {
    name: "Jogador — Estabilizar aliado",
    img: "icons/svg/heal.svg",
    command: `${JJ}
${RESOLVE}
const target = jj.getTargetedActor();
if (!target) return ui.notifications.warn("Selecione o aliado Morrendo com T (targeting).");
if (target.system.hp.value > 0) return ui.notifications.warn("Alvo não está Morrendo (HP > 0).");
await jj.stabilizeAlly(actor, target);`,
  },
  {
    name: "Jogador — Teste de atributo",
    img: "icons/svg/dice-target.svg",
    command: `${JJ}
${RESOLVE}
const form = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Teste de atributo" },
  content: \`<div style="display:flex;flex-direction:column;gap:8px">
    <label>Atributo<select name="attr">
      <option value="for">FOR — Força</option>
      <option value="agi">AGI — Agilidade</option>
      <option value="res">RES — Resistência</option>
      <option value="men">MEN — Mente</option>
      <option value="per">PER — Percepção</option>
      <option value="pre">PRE — Precisão</option>
      <option value="int">INT — Inteligência</option>
    </select></label>
    <label>CD <input type="number" name="dc" value="12" min="1" max="30" style="width:100%"/></label>
    <label>Descrição <input type="text" name="label" placeholder="Ex.: escalar o muro" style="width:100%"/></label>
    <label><input type="checkbox" name="auditory"/> Percepção auditiva (Surdo falha)</label>
  </div>\`,
  ok: { label: "Rolar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object },
  rejectClose: false,
});
if (!form) return;
await jj.rollTest({
  actor,
  attrKey: form.attr,
  target: Number(form.dc) || 12,
  label: form.label?.trim() || "Teste",
  auditory: Boolean(form.auditory),
});`,
  },
  {
    name: "Jogador — Iniciativa",
    img: "icons/svg/clockwork.svg",
    command: `${JJ}
${RESOLVE}
await jj.rollInitiative(actor);`,
  },
  {
    name: "Jogador — Salvar Morrendo",
    img: "icons/svg/skull.svg",
    command: `${JJ}
${RESOLVE}
if (actor.system.hp.value > 0) return ui.notifications.warn("Você não está Morrendo.");
await jj.rollDyingSave(actor);`,
  },
  {
    name: "Jogador — Recuperar condição",
    img: "icons/svg/upgrade.svg",
    command: `${JJ}
${RESOLVE}
const conditions = ["stunned", "poisoned", "immobilized", "bleeding", "hallucinating", "burning"]
  .filter((id) => actor.statuses?.has(id));
if (!conditions.length) return ui.notifications.warn("Nenhuma condição recuperável ativa.");
const options = conditions.map((id) => {
  const c = CONFIG.statusEffects.find((s) => s.id === id);
  return \`<option value="\${id}">\${c?.name ?? id}</option>\`;
}).join("");
const picked = await foundry.applications.api.DialogV2.prompt({
  window: { title: "Recuperar condição" },
  content: \`<label>Condição<select name="id" style="width:100%">\${options}</select></label>\`,
  ok: { label: "Testar", callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object.id },
  rejectClose: false,
});
if (!picked) return;
await jj.tryRecoverCondition(actor, picked);`,
  },
];
