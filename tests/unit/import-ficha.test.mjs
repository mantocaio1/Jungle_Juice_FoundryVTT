import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseFichaJson } from "../../module/import-ficha.mjs";

const SAMPLE = {
  version: 1,
  name: "Rex",
  insect: "Escorpião",
  origin: "Ex-militar infectado.",
  motivation: "Proteger a equipe.",
  faction: "NEST",
  attrs: { for: 3, agi: 2, res: 4, men: 2, per: 3, pre: 2, int: 5 },
  abilities: [
    {
      name: "Garra Venenosa",
      type: "ativa_l",
      desc: "Ataque extra",
      weakness: "Fogo",
      damage: "1d6",
    },
  ],
  extraWeak: 1,
  items: [{ name: "Kit médico", tier: "2", desc: "Cura de campo" }],
  insanity: 15,
};

describe("import-ficha", () => {
  it("parseFichaJson — aceita ficha válida", () => {
    const data = parseFichaJson(SAMPLE);
    assert.equal(data.name, "Rex");
    assert.equal(data.attrs.res, 4);
    assert.equal(data.abilities.length, 1);
    assert.equal(data.items[0].tier, "2");
    assert.match(data.origin, /^<p>/);
  });

  it("parseFichaJson — rejeita orçamento excedido", () => {
    const bad = {
      ...SAMPLE,
      attrs: { for: 7, agi: 7, res: 7, men: 1, per: 0, pre: 0, int: 0 },
    };
    assert.throws(() => parseFichaJson(bad), /orçamento/i);
  });

  it("parseFichaJson — aceita string JSON", () => {
    const data = parseFichaJson(JSON.stringify(SAMPLE));
    assert.equal(data.insect, "Escorpião");
  });
});
