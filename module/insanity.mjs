import {
  RUNAWAY_THRESHOLD,
  COLLAPSE_VALUE,
  RUNAWAY_STATUS_ID,
  getInsanityState,
} from "./config.mjs";

/**
 * Reage a mudanças de insanidade: avisa o Mestre ao atingir Colapso (100) e
 * desativa o Runaway se a insanidade cair abaixo do limiar.
 * Chamado a partir do hook updateActor (apenas no cliente do GM ativo).
 * @param {Actor} actor
 * @param {number} oldValue
 * @param {number} newValue
 */
export async function onInsanityChange(actor, oldValue, newValue) {
  // Cruzou para Colapso: NÃO força Runaway — apenas comunica ao Mestre que
  // ele pode desbloquear a ativação para este personagem.
  if (oldValue < COLLAPSE_VALUE && newValue >= COLLAPSE_VALUE) {
    await ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <div class="jungle-juice-card">
          <h3>🧠 COLAPSO — ${actor.name}</h3>
          <p>Insanidade atingiu <strong>100/100</strong>.</p>
          <p><em>O Complex Runaway está disponível para desbloqueio. Você (Mestre) decide se e quando ativá-lo.</em></p>
        </div>`,
    });
  }

  // Caiu abaixo do limiar de Runaway: encerra qualquer Runaway ativo e relacked.
  if (newValue < RUNAWAY_THRESHOLD && (actor.system.runaway?.active || actor.system.runaway?.unlocked)) {
    await actor.update({
      "system.runaway.active": false,
      "system.runaway.unlocked": false,
    });
    if (actor.statuses?.has(RUNAWAY_STATUS_ID)) {
      await actor.toggleStatusEffect(RUNAWAY_STATUS_ID, { active: false });
    }
  }
}

/**
 * Mestre desbloqueia o Runaway para um personagem específico.
 * @param {Actor} actor
 */
export async function unlockRunaway(actor) {
  if (!game.user.isGM) {
    ui.notifications.warn("Apenas o Mestre pode desbloquear o Runaway.");
    return;
  }
  await actor.update({ "system.runaway.unlocked": true });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="jungle-juice-card"><h3>🔓 Runaway desbloqueado</h3><p><strong>${actor.name}</strong> pode entrar em Complex Runaway.</p></div>`,
  });
}

/**
 * Ativa o Complex Runaway (requer estar desbloqueado pelo Mestre).
 * @param {Actor} actor
 */
export async function activateRunaway(actor) {
  if (!actor.system.runaway?.unlocked) {
    ui.notifications.warn("O Runaway ainda não foi desbloqueado pelo Mestre.");
    return;
  }
  await actor.update({ "system.runaway.active": true });
  if (!actor.statuses?.has(RUNAWAY_STATUS_ID)) {
    await actor.toggleStatusEffect(RUNAWAY_STATUS_ID, { active: true });
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="jungle-juice-card">
        <h3>🐛💢 COMPLEX RUNAWAY — ${actor.name}</h3>
        <p>O inseto tomou a frente. O personagem perdeu o controle consciente do Complex.</p>
        <p><em>Habilidades ativas ganham poder aumentado, mas sem controle. O Mestre assume parcialmente as ações relacionadas ao Complex.</em></p>
      </div>`,
  });
}

/**
 * Tenta sair do Runaway com um teste de Mente contra uma CD.
 * @param {Actor} actor
 * @param {number} cd
 */
export async function exitRunaway(actor, cd = 14) {
  const men = actor.system.attributes?.men ?? 0;
  const roll = await new Roll(`1d20 + ${men}`).evaluate();
  const success = roll.total >= cd;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `Sair do Runaway — Mente vs CD ${cd} · ${success ? "Sucesso" : "Falha"}`,
  });

  if (success) {
    await actor.update({ "system.runaway.active": false });
    if (actor.statuses?.has(RUNAWAY_STATUS_ID)) {
      await actor.toggleStatusEffect(RUNAWAY_STATUS_ID, { active: false });
    }
  }

  return { success, roll };
}

/**
 * Mestre envia uma alucinação privada ao(s) dono(s) do personagem.
 * @param {Actor} actor
 * @param {string} text
 */
export async function sendHallucination(actor, text) {
  if (!game.user.isGM) {
    ui.notifications.warn("Apenas o Mestre pode enviar alucinações.");
    return;
  }
  if (!text?.trim()) return;

  const owners = game.users.filter((u) => !u.isGM && actor.testUserPermission(u, "OWNER")).map((u) => u.id);
  const recipients = [game.user.id, ...owners];

  const state = getInsanityState(actor.system.insanity.value);

  await ChatMessage.create({
    whisper: recipients,
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="jungle-juice-card jj-hallucination">
        <h3>👁️ Alucinação</h3>
        <p>${text.trim()}</p>
        <p class="hint" style="color:${state.color}">Insanidade ${actor.system.insanity.value}/100 · ${state.label}</p>
      </div>`,
  });
}
