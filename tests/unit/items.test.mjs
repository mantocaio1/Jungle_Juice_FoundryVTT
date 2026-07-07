import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { itemRollData, extractLegacyItemsFromCreateData } from "../../module/items.mjs";

describe("items", () => {
  it("itemRollData — documento Foundry", () => {
    const data = itemRollData({ name: "Faca", system: { tier: "2" } });
    assert.deepEqual(data, { name: "Faca", tier: "2" });
  });

  it("itemRollData — legado inline", () => {
    const data = itemRollData({ name: "Tocha", tier: "3", desc: "luz" });
    assert.deepEqual(data, { name: "Tocha", tier: "3" });
  });

  it("itemRollData — null para vazio", () => {
    assert.equal(itemRollData(null), null);
  });

  it("extractLegacyItemsFromCreateData — converte system.items", () => {
    const data = {
      system: {
        items: [
          { name: "Kit médico", tier: "2", desc: "cura" },
          { name: "", tier: "1", desc: "" },
        ],
      },
    };
    extractLegacyItemsFromCreateData(data);
    assert.equal(data.items.length, 1);
    assert.equal(data.items[0].type, "gear");
    assert.equal(data.items[0].name, "Kit médico");
    assert.equal(data.items[0].system.tier, "2");
    assert.equal(data.system.items.length, 2);
    assert.equal(data.system.items[0].name, "");
  });

  it("extractLegacyItemsFromCreateData — ignora se sem itens nomeados", () => {
    const data = { system: { items: [{ name: "", tier: "1", desc: "" }] } };
    extractLegacyItemsFromCreateData(data);
    assert.equal(data.items, undefined);
  });
});
