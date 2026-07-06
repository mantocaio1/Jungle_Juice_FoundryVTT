import {
  ATTRIBUTES,
  ABILITY_TYPES,
  ITEM_TIERS,
  ATTRIBUTE_POINTS,
  MAX_ATTRIBUTE_AT_CREATION,
  MAX_ABILITIES,
} from "../config.mjs";
import { rollTest, rollAttack, rollInitiative, rollDyingSave } from "../dice.mjs";

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
    },
  };

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/jungle-juice/templates/actor-sheet.hbs",
      scrollable: [""],
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
    };

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

    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.tabGroups ??= { primary: "identity" };

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
  }

  /** @param {PointerEvent} event */
  static async #onAdjustAttr(event, target) {
    const sheet = this;
    const attr = target.dataset.attr;
    const delta = Number(target.dataset.delta);
    const current = sheet.actor.system.attributes[attr] ?? 0;
    const next = current + delta;

    if (next < 0 || next > MAX_ATTRIBUTE_AT_CREATION) return;
    if (delta > 0 && sheet.actor.system.points.remaining <= 0) {
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
    const attrKey = target.dataset.attr;
    const ac = Number(prompt("AC do alvo:", "12") ?? 12);
    await rollAttack({ actor: sheet.actor, attrKey, ac });
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
}
