import assert from "node:assert/strict";
import { test } from "node:test";

import { CARLOS, CARGOS, ehCarlos, ehHumano } from "./equipe.ts";

test("mesa tem um Grok só", () => {
  assert.equal(CARGOS.length, 1);
  assert.equal(CARGOS[0].email, "carlos@mai.local");
  assert.equal(CARLOS.ficha, "ceo");
});

test("sócios e Carlos", () => {
  assert.equal(ehHumano("CEO", "humano"), true);
  assert.equal(ehHumano("IA_CEO", "ia"), false);
  assert.equal(ehCarlos("IA_CEO", "ceo"), true);
  assert.equal(ehCarlos("IA", "design"), false);
});
