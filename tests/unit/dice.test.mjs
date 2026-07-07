import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { appendItemBonus } from "../../module/dice.mjs";

describe("dice", () => {
  it("appendItemBonus — soma dado do tier", () => {
    const item = { name: "Faca", system: { tier: "2" } };
    assert.equal(appendItemBonus("1d6", item), "1d6 + 1d6");
  });

  it("appendItemBonus — só o bônus se sem dano base", () => {
    const item = { name: "Pedra", tier: "1" };
    assert.equal(appendItemBonus("", item), "1d4");
  });

  it("appendItemBonus — ignora item sem nome", () => {
    assert.equal(appendItemBonus("1d6", { name: "  ", tier: "3" }), "1d6");
    assert.equal(appendItemBonus("1d6", null), "1d6");
  });
});
