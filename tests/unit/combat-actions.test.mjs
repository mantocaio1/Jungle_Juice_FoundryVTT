import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isActionBlocked } from "../../module/combat-actions.mjs";

function mockActor(statusIds) {
  return {
    statuses: new Set(statusIds),
    system: { actions: {} },
  };
}

describe("combat-actions", () => {
  it("isActionBlocked — Atordoado bloqueia Livre", () => {
    const actor = mockActor(["stunned"]);
    assert.equal(isActionBlocked(actor, "free"), "Atordoado");
    assert.equal(isActionBlocked(actor, "principal"), null);
  });

  it("isActionBlocked — Imobilizado bloqueia Movimentação e Suporte", () => {
    const actor = mockActor(["immobilized"]);
    assert.equal(isActionBlocked(actor, "movement"), "Imobilizado");
    assert.equal(isActionBlocked(actor, "support"), "Imobilizado");
    assert.equal(isActionBlocked(actor, "principal"), null);
  });
});
