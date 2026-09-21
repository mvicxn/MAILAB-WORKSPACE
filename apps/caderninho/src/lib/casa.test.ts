import assert from "node:assert/strict";
import { test } from "node:test";

import { adicionarDias, chaveDia, instanteSp, prazoDe, tipoUteis } from "./datas.ts";

test("prazo De usa São Paulo, não o relógio ingênuo", () => {
  const d = prazoDe("2026-09-21");
  assert.equal(chaveDia(d), "2026-09-21");
});

test("instante sp não vira dia anterior", () => {
  const d = instanteSp("2026-03-01", "00:00");
  assert.equal(chaveDia(d), "2026-03-01");
});

test("úteis ignora sábado", () => {
  assert.equal(tipoUteis("2026-09-26"), false);
  assert.equal(tipoUteis("2026-09-21"), true);
});

test("série diária pula exceção e não duplica", () => {
  const skip = new Set(["2026-09-22"]);
  const dias: string[] = [];
  let dia = "2026-09-21";
  for (let n = 0; n < 3; n += 1) {
    if (!skip.has(dia)) {
      dias.push(dia);
    }
    dia = adicionarDias(dia, 1);
  }
  assert.deepEqual(dias, ["2026-09-21", "2026-09-23"]);
  assert.equal(new Set(dias).size, dias.length);
});

test("adicionar dias", () => {
  assert.equal(adicionarDias("2026-09-30", 1), "2026-10-01");
});

test("id de tarefa rejeita path traversal", () => {
  const idSeguro = (v: string) => /^[a-z0-9]{16,40}$/i.test(v.trim());
  assert.equal(idSeguro("../../../etc"), false);
  assert.equal(idSeguro("cmuaq4ifd000bv86ua78oo1m3"), true);
});
