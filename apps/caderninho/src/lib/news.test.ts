import assert from "node:assert/strict";
import { test } from "node:test";

import { corpoNews, linkSeguro, prateleiraCanon, tituloNews } from "./news-form.ts";

test("prateleira só git ou mundo", () => {
  assert.equal(prateleiraCanon("git"), "git");
  assert.equal(prateleiraCanon("Nosso Git"), "git");
  assert.equal(prateleiraCanon("mundo"), "mundo");
  assert.equal(prateleiraCanon("x"), null);
});

test("link só http(s)", () => {
  assert.equal(linkSeguro(""), "");
  assert.equal(linkSeguro("https://github.com/mvicxn/MAILAB-WORKSPACE/pull/3"), "https://github.com/mvicxn/MAILAB-WORKSPACE/pull/3");
  assert.equal(linkSeguro("javascript:alert(1)"), null);
  assert.equal(linkSeguro("not-a-url"), null);
});

test("titulo e corpo têm teto", () => {
  assert.equal(tituloNews("a"), null);
  assert.equal(tituloNews("PR 3 subiu"), "PR 3 subiu");
  assert.equal(corpoNews("x"), null);
  assert.ok(corpoNews("Digesto curto de Cursor e Next."));
});
