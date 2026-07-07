import {
  ATTRIBUTES,
  ABILITY_TYPES,
  ITEM_TIERS,
  ATTRIBUTE_POINTS,
  MAX_ATTRIBUTE_AT_CREATION,
  MAX_ABILITIES,
  CONDITIONS,
  FACTION_NAMES,
  MAX_ITEMS,
} from "../config.mjs";
import {
  rollTest,
  rollAttack,
  rollInitiative,
  rollDyingSave,
  useAbility,
  applyAbilityInsanity,
  rollDamage,
  applyDamage,
  appendItemBonus,
} from "../dice.mjs";
import { toggleCondition, tryRecoverCondition } from "../conditions.mjs";
import { unlockRunaway, activateRunaway, exitRunaway, sendHallucination } from "../insanity.mjs";
import { useHealingItem, shortRest, longRest, stabilizeDying } from "../healing.mjs";
import {
  getTurnActionsState,
  toggleTurnAction,
  resetTurnActions,
  spendTurnAction,
} from "../combat-actions.mjs";
import {
  getGearItems,
  migrateLegacyItems,
  createGearItem,
  deleteGearItem,
  itemRollData,
} from "../items.mjs";
import { applyFichaToActor, exportFichaJson, promptFichaJson } from "../import-ficha.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class JungleJuiceActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["jungle-juice", "sheet", "actor"],
    position: { width: 860, height: 780 },
    window: { title: "Jungle Juice RPG" },
    tag: "form",
    form: { submitOnChange: true },
    actions: {
      adjustAttr: JungleJuiceActorSheet.#onAdjustAttr,
      rollTest: JungleJuiceActorSheet.#onRollTest,
      rollAttack: JungleJuiceActorSheet.#onRollAttack,
      rollInit: JungleJuiceActorSheet.#onRollInit,
      rollDying: JungleJuiceActorSheet.#onRollDying,
      adjustInsanity: JungleJuiceActorSheet.#onAdjustInsanity,
      addAbility: JungleJuiceActorSheet.#onAddAbility,
      removeAbility: JungleJuiceActorSheet.#onRemoveAbility,
      useAbility: JungleJuiceActorSheet.#onUseAbility,
      toggleCondition: JungleJuiceActorSheet.#onToggleCondition,
      recoverCondition: JungleJuiceActorSheet.#onRecoverCondition,
      stabilizeDying: JungleJuiceActorSheet.#onStabilizeDying,
      unlockRunaway: JungleJuiceActorSheet.#onUnlockRunaway,
      activateRunaway: JungleJuiceActorSheet.#onActivateRunaway,
      exitRunaway: JungleJuiceActorSheet.#onExitRunaway,
      sendHallucination: JungleJuiceActorSheet.#onSendHallucination,
      useHealingItem: JungleJuiceActorSheet.#onUseHealingItem,
      shortRest: JungleJuiceActorSheet.#onShortRest,
      longRest: JungleJuiceActorSheet.#onLongRest,
      toggleTurnAction: JungleJuiceActorSheet.#onToggleTurnAction,
      resetTurnActions: JungleJuiceActorSheet.#onResetTurnActions,
      addItem: JungleJuiceActorSheet.#onAddItem,
      removeItem: JungleJuiceActorSheet.#onRemoveItem,
      importFicha: JungleJuiceActorSheet.#onImportFicha,
      exportFicha: JungleJuiceActorSheet.#onExportFicha,
    },
  };

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/jungle-juice/templates/actor-sheet.hbs",
      scrollable: [".sheet-body"],
    },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.config = {
      attributes: ATTRIBUTES,
      abilityTypes: ABILITY_TYPES,
      itemTiers: ITEM_TIERS,
      attributePoints: ATTRIBUTE_POINTS,
      maxAttribute: MAX_ATTRIBUTE_AT_CREATION,
      factionNames: FACTION_NAMES,
    };

    context.actor = this.actor;
    context.document = this.document;
    context.system = system;
    context.isCharacter = this.actor.type === "character";
    context.activeTab = this.tabGroups?.primary ?? "identity";
    context.tabs = [
      { id: "identity", label: "Identidade" },
      { id: "attributes", label: "Atributos" },
      { id: "complex", label: "Complex" },
      { id: "items", label: "Itens" },
      { id: "rolls", label: "Rolagens" },
    ];

    context.abilityPointsUsed = (system.abilities ?? []).reduce((sum, ab) => {
      return sum + (ABILITY_TYPES[ab.type]?.cost ?? 0);
    }, 0);

    context.abilityPointsTotal = system.complexPointsTotal ?? 5;
    context.abilityPointsRemaining = context.abilityPointsTotal - context.abilityPointsUsed;

    context.conditions = CONDITIONS.map((c) => ({
      ...c,
      active: this.actor.statuses.has(c.id),
      canRecover: Boolean(c.recovery),
      showRecover: this.actor.statuses.has(c.id) && Boolean(c.recovery),
      recoveryLabel: c.recovery
        ? `${ATTRIBUTES[c.recovery.attr]?.abbr ?? c.recovery.attr.toUpperCase()} CD ${c.recovery.dc}`
        : null,
    }));

    context.isGM = game.user.isGM;
    context.canHallucinate = system.canHallucinate ?? false;
    context.canRunaway = system.canRunaway ?? false;
    context.isCollapse = system.isCollapse ?? false;
    context.runawayUnlocked = system.runaway?.unlocked ?? false;
    context.runawayActive = system.runaway?.active ?? false;
    context.turnActions = getTurnActionsState(this.actor);
    context.gearItems = getGearItems(this.actor);
    context.canAddItem = context.gearItems.length < MAX_ITEMS;

    return context;
  }

  /**
   * Impede que submits automáticos sobrescrevam o nome do documento com um
   * valor vazio/indefinido, e remove quaisquer leaves `undefined`.
   * @override
   */
  _prepareSubmitData(event, form, formData, ...rest) {
    const obj = formData.object;
    if (obj.name === undefined || obj.name === null || obj.name === "") {
      delete obj.name;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) delete obj[key];
    }
    return super._prepareSubmitData(event, form, formData, ...rest);
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.tabGroups ??= { primary: "identity" };

    if (!this._jjItemsMigrated) {
      this._jjItemsMigrated = true;
      migrateLegacyItems(this.actor).then((did) => {
        if (did) this.render(false);
      });
    }

    this.element.querySelectorAll(".sheet-tabs [data-tab]").forEach((tab) => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        this.tabGroups.primary = tab.dataset.tab;
        this.render(false);
      });
    });

    this.element.querySelectorAll(".sheet-body .tab").forEach((panel) => {
      panel.hidden = panel.dataset.tab !== this.tabGroups.primary;
    });

    this.element.querySelectorAll(".sheet-tabs [data-tab]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === this.tabGroups.primary);
    });

    // ArrayFields (habilidades/itens) são atualizados por completo, fora do
    // submit automático, para evitar diffs parciais inválidos do AppV2.
    // stopPropagation impede que o change suba para o handler de submit do
    // AppV2 e cause uma corrida de re-render + submit de form defasado.
    this.element.querySelectorAll(".ability-card [data-ab-field]").forEach((el) => {
      el.addEventListener("change", (event) => {
        event.stopPropagation();
        this.actor.update({ "system.abilities": this.#collectAbilities() });
      });
    });

    this.element.querySelectorAll(".item-card [data-it-field]").forEach((el) => {
      el.addEventListener("change", (event) => {
        event.stopPropagation();
        const card = el.closest(".item-card");
        const itemId = card?.dataset.itemId;
        const item = itemId ? this.actor.items.get(itemId) : null;
        if (!item) return;

        const update = {
          name: card.querySelector('[data-it-field="name"]')?.value ?? item.name,
          "system.tier": card.querySelector('[data-it-field="tier"]')?.value ?? item.system.tier,
          "system.desc": card.querySelector('[data-it-field="desc"]')?.value ?? item.system.desc,
        };
        item.update(update);
      });
    });
  }

  /** @returns {object[]} */
  #collectAbilities() {
    return Array.from(this.element.querySelectorAll(".ability-card")).map((card) => ({
      name: card.querySelector('[data-ab-field="name"]')?.value ?? "",
      type: card.querySelector('[data-ab-field="type"]')?.value ?? "passiva",
      desc: card.querySelector('[data-ab-field="desc"]')?.value ?? "",
      weakness: card.querySelector('[data-ab-field="weakness"]')?.value ?? "",
      damage: card.querySelector('[data-ab-field="damage"]')?.value ?? "",
    }));
  }

  /** @param {PointerEvent} event */
  static async #onAdjustAttr(event, target) {
    const sheet = this;
    const attr = target.dataset.attr;
    const delta = Number(target.dataset.delta);
    const current = sheet.actor.system.attributes[attr] ?? 0;
    const next = current + delta;

    if (next < 0 || next > MAX_ATTRIBUTE_AT_CREATION) return;

    // Apenas personagens têm orçamento de pontos; NPCs não são limitados.
    const points = sheet.actor.system.points;
    if (delta > 0 && points && points.remaining <= 0) {
      ui.notifications.warn("Sem pontos de atributo restantes.");
      return;
    }

    await sheet.actor.update({ [`system.attributes.${attr}`]: next });
  }

  /** @param {PointerEvent} event */
  static async #onRollTest(event, target) {
    const sheet = this;
    const attrKey = target.dataset.attr;
    const targetCd = Number(target.dataset.cd ?? 12);
    await rollTest({ actor: sheet.actor, attrKey, target: targetCd });
  }

  /** @param {PointerEvent} event */
  static async #onRollAttack(event, target) {
    const sheet = this;
    const presetAttr = target.dataset.attr;
    const abilities = sheet.actor.system.abilities ?? [];
    const items = getGearItems(sheet.actor).filter((item) => item.name?.trim());

    // Alvo selecionado (targeting) do usuário atual.
    const targetTokens = Array.from(game.user.targets);
    const targetActor = targetTokens[0]?.actor ?? null;
    const targetAc = targetActor?.system.ac.value ?? null;

    if (targetTokens.length > 1) {
      ui.notifications.info("Múltiplos alvos selecionados — usando o primeiro.");
    }

    const attrOptions = Object.entries(ATTRIBUTES)
      .map(
        ([key, info]) =>
          `<option value="${key}" ${key === presetAttr ? "selected" : ""}>${info.abbr} — ${info.label}</option>`
      )
      .join("");

    const abilityOptions = abilities
      .map((ab, i) => {
        const type = ABILITY_TYPES[ab.type] ?? ABILITY_TYPES.passiva;
        const cost = type.insanity ? ` · +${type.insanity} ins` : "";
        const dmg = ab.damage?.trim() ? ` · ${ab.damage.trim()}` : "";
        return `<option value="${i}">${ab.name?.trim() || "Sem nome"} (${type.label}${cost}${dmg})</option>`;
      })
      .join("");

    const itemOptions = items
      .map((item) => {
        const tier = ITEM_TIERS[item.system.tier ?? "1"];
        return `<option value="${item.id}">${item.name.trim()} (Tier ${item.system.tier} ${tier?.bonus ?? ""})</option>`;
      })
      .join("");

    const itemBlock = items.length
      ? `<div class="form-group">
           <label>Bônus de item no dano</label>
           <select name="item">
             <option value="-1">Nenhum</option>
             ${itemOptions}
           </select>
         </div>`
      : "";

    const targetBlock = targetActor
      ? `<p class="jj-target">🎯 Alvo: <strong>${targetActor.name}</strong> (AC ${targetAc} · HP ${targetActor.system.hp.value}/${targetActor.system.hp.max})</p>`
      : `<div class="form-group">
           <label>AC do alvo <em>(nenhum alvo selecionado)</em></label>
           <input type="number" name="ac" value="12"/>
         </div>`;

    const content = `
      <div class="jj-attack-dialog">
        ${targetBlock}
        <div class="form-group">
          <label>Atributo do ataque</label>
          <select name="attr">${attrOptions}</select>
        </div>
        <div class="form-group">
          <label>Usar habilidade do Complex?</label>
          <select name="ability">
            <option value="-1">Nenhuma (ataque comum)</option>
            ${abilityOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Dano (opcional — usado se não houver dado na habilidade)</label>
          <input type="text" name="damage" placeholder="ex: 1d6 + 2"/>
        </div>
        ${itemBlock}
      </div>`;

    const data = await foundry.applications.api.DialogV2.wait({
      window: { title: "Atacar" },
      content,
      buttons: [
        {
          action: "attack",
          label: "Atacar",
          default: true,
          callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
        },
        { action: "cancel", label: "Cancelar", callback: () => null },
      ],
      rejectClose: false,
    });

    if (!data) return;

    await spendTurnAction(sheet.actor, "principal");

    const attrKey = data.attr ?? presetAttr;
    const ac = targetActor ? targetAc : Number(data.ac ?? 12);
    const abilityIndex = Number(data.ability ?? -1);
    const ability = abilityIndex >= 0 ? abilities[abilityIndex] : null;
    const attackItemDoc = data.item && data.item !== "-1" ? sheet.actor.items.get(data.item) : null;
    const attackItem = itemRollData(attackItemDoc);

    // Rola o ataque contra o AC do alvo.
    const { hit, natural20 } = await rollAttack({ actor: sheet.actor, attrKey, ac });

    // Custo de insanidade da habilidade, se houver.
    if (ability) await applyAbilityInsanity(sheet.actor, ability);

    if (!hit) return;

    // Determina a fórmula de dano: dado da habilidade ou campo manual + bônus de item.
    let damageFormula = (ability?.damage?.trim() || data.damage?.trim() || "").trim();
    damageFormula = appendItemBonus(damageFormula, attackItem);

    if (!damageFormula || !Roll.validate(damageFormula)) return;

    const label = ability?.name?.trim() || attackItem?.name?.trim() || "Ataque";
    const damage = await rollDamage(sheet.actor, damageFormula, label);

    if (targetActor) {
      if (targetActor.isOwner) {
        const newHp = await applyDamage(targetActor, damage);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: sheet.actor }),
          content: `<div class="jungle-juice-card"><p>💥 <strong>${damage}</strong> de dano em <strong>${targetActor.name}</strong>${natural20 ? " (Natural 20!)" : ""} → HP ${newHp}/${targetActor.system.hp.max}</p></div>`,
        });
      } else {
        // Sem permissão para alterar o alvo: registra para o Mestre aplicar.
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: sheet.actor }),
          content: `<div class="jungle-juice-card"><p>💥 <strong>${damage}</strong> de dano em <strong>${targetActor.name}</strong>${natural20 ? " (Natural 20!)" : ""} — <em>aguardando o Mestre aplicar (sem permissão).</em></p></div>`,
        });
      }
    }
  }

  /** @param {PointerEvent} event */
  static async #onRollInit() {
    await rollInitiative(this.actor);
  }

  /** @param {PointerEvent} event */
  static async #onRollDying() {
    await rollDyingSave(this.actor);
  }

  /** @param {PointerEvent} event */
  static async #onAdjustInsanity(event, target) {
    const delta = Number(target.dataset.delta);
    const current = this.actor.system.insanity.value;
    const next = Math.max(0, Math.min(100, current + delta));
    await this.actor.update({ "system.insanity.value": next });
  }

  /** @param {PointerEvent} event */
  static async #onAddAbility() {
    const abilities = [...(this.actor.system.abilities ?? [])];
    if (abilities.length >= MAX_ABILITIES) return;
    abilities.push({ name: "", type: "passiva", desc: "", weakness: "", damage: "" });
    await this.actor.update({ "system.abilities": abilities });
  }

  /** @param {PointerEvent} event */
  static async #onRemoveAbility(event, target) {
    const index = Number(target.dataset.index);
    const abilities = [...(this.actor.system.abilities ?? [])];
    abilities.splice(index, 1);
    await this.actor.update({ "system.abilities": abilities });
  }

  /** @param {PointerEvent} event */
  static async #onUseAbility(event, target) {
    const index = Number(target.dataset.index);
    await useAbility({ actor: this.actor, index });
  }

  /** @param {PointerEvent} event */
  static async #onToggleCondition(event, target) {
    const conditionId = target.dataset.condition;
    await toggleCondition(this.actor, conditionId);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onRecoverCondition(event, target) {
    const conditionId = target.dataset.condition;
    await tryRecoverCondition(this.actor, conditionId);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onStabilizeDying() {
    await stabilizeDying(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onUnlockRunaway() {
    await unlockRunaway(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onActivateRunaway() {
    await activateRunaway(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onExitRunaway() {
    await exitRunaway(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onSendHallucination() {
    const text = await foundry.applications.api.DialogV2.prompt({
      window: { title: "Enviar alucinação" },
      content: `<textarea name="text" rows="4" style="width:100%" placeholder="Descreva o que o personagem vê/ouve/sente..."></textarea>`,
      ok: {
        label: "Enviar",
        callback: (ev, button) => new foundry.applications.ux.FormDataExtended(button.form).object.text,
      },
      rejectClose: false,
    });
    if (text) await sendHallucination(this.actor, text);
  }

  /** @param {PointerEvent} event */
  static async #onUseHealingItem(event, target) {
    const itemId = target.dataset.itemId;
    await useHealingItem(this.actor, itemId);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onShortRest() {
    await shortRest(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onLongRest() {
    await longRest(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onToggleTurnAction(event, target) {
    const actionId = target.dataset.actionId;
    await toggleTurnAction(this.actor, actionId);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onResetTurnActions() {
    await resetTurnActions(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onAddItem() {
    await createGearItem(this.actor);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onRemoveItem(event, target) {
    const itemId = target.dataset.itemId;
    await deleteGearItem(this.actor, itemId);
    this.render(false);
  }

  /** @param {PointerEvent} event */
  static async #onImportFicha() {
    if (!game.user.isGM) return;

    const text = await promptFichaJson();
    if (!text) return;

    try {
      await applyFichaToActor(this.actor, text);
      ui.notifications.info(`Ficha importada: ${this.actor.name}`);
      this.render(false);
    } catch (error) {
      ui.notifications.error(`Importação falhou: ${error.message}`);
    }
  }

  /** @param {PointerEvent} event */
  static async #onExportFicha() {
    if (!game.user.isGM) return;
    const json = exportFichaJson(this.actor);

    await foundry.applications.api.DialogV2.wait({
      window: { title: "Exportar ficha JSON" },
      content: `<textarea readonly rows="14" style="width:100%;font-family:monospace">${json.replace(/</g, "&lt;")}</textarea>`,
      buttons: [{ action: "ok", label: "Fechar", default: true }],
      rejectClose: false,
    });

    try {
      await navigator.clipboard.writeText(json);
      ui.notifications.info("JSON copiado para a área de transferência.");
    } catch {
      ui.notifications.info("Selecione e copie o JSON manualmente.");
    }
  }
}
