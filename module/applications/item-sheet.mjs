import { ITEM_TIERS } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class JungleJuiceItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["jungle-juice", "sheet", "item"],
    position: { width: 420, height: 360 },
    window: { title: "Item Jungle Juice" },
    tag: "form",
    form: { submitOnChange: true },
  };

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/jungle-juice/templates/item-sheet.hbs",
      scrollable: [""],
    },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.item.system;
    const tier = ITEM_TIERS[system.tier ?? "1"] ?? ITEM_TIERS["1"];

    context.item = this.item;
    context.document = this.item;
    context.system = system;
    context.config = { itemTiers: ITEM_TIERS };
    context.tierHeal = tier.heal;
    context.tierBonus = tier.bonus;

    return context;
  }
}
