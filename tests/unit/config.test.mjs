import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasDisadvantage,
  getInsanityState,
  getCondition,
  autoFailsAuditoryTest,
  TURN_ACTIONS,
  ITEM_TIERS,
  ATTRIBUTE_POINTS,
} from "../../module/config.mjs";

describe("config", () => {
  it("hasDisadvantage — Atordoado afeta todos os testes", () => {
    const statuses = new Set(["stunned"]);
    assert.equal(hasDisadvantage(statuses, "men"), true);
    assert.equal(hasDisadvantage(statuses, "for", true), true);
  });

  it("hasDisadvantage — Envenenado só afeta físicos", () => {
    const statuses = new Set(["poisoned"]);
    assert.equal(hasDisadvantage(statuses, "for"), true);
    assert.equal(hasDisadvantage(statuses, "men"), false);
  });

  it("hasDisadvantage — Cego afeta ataques", () => {
    const statuses = new Set(["blinded"]);
    assert.equal(hasDisadvantage(statuses, "pre", true), true);
    assert.equal(hasDisadvantage(statuses, "pre", false), false);
  });

  it("getInsanityState — faixas corretas", () => {
    assert.equal(getInsanityState(0).label, "Estável");
    assert.equal(getInsanityState(30).label, "Tenso");
    assert.equal(getInsanityState(50).label, "Abalado");
    assert.equal(getInsanityState(90).label, "Perturbado");
    assert.equal(getInsanityState(100).label, "COLAPSO");
  });

  it("getCondition — retorna condição por id", () => {
    assert.equal(getCondition("stunned")?.name, "Atordoado");
    assert.equal(getCondition("invalid"), undefined);
  });

  it("TURN_ACTIONS — 4 ações definidas", () => {
    assert.equal(TURN_ACTIONS.length, 4);
    assert.deepEqual(
      TURN_ACTIONS.map((a) => a.id),
      ["principal", "movement", "support", "free"]
    );
  });

  it("autoFailsAuditoryTest — Surdo falha percepção auditiva", () => {
    assert.equal(autoFailsAuditoryTest(new Set(["deafened"])), true);
    assert.equal(autoFailsAuditoryTest(new Set(["blinded"])), false);
    assert.equal(autoFailsAuditoryTest(new Set()), false);
  });

  it("constantes de criação", () => {
    assert.equal(ATTRIBUTE_POINTS, 21);
    assert.equal(ITEM_TIERS["2"].heal, "1d6");
    assert.equal(ITEM_TIERS["3"].bonus, "+1d8");
  });
});
