/**
 * Tests de la metrica en vivo: el formateo es puro y la lectura del registry se
 * prueba con un `fetch` falso, sin red. Lo que se afirma es el contrato visible:
 * la cifra que aparece en la ficha y la garantia de que un registry caido no la
 * rompe.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { formatDownloads, getOpenVsxDownloads } from "./live-metrics.ts";

test("las cuentas chicas se escriben sin sufijo", () => {
  assert.equal(formatDownloads(0), "0");
  assert.equal(formatDownloads(999), "999");
});

test("desde mil se escribe con k y sin decimal trivial", () => {
  assert.equal(formatDownloads(1000), "1k");
  assert.equal(formatDownloads(4450), "4.4k");
  assert.equal(formatDownloads(12000), "12k");
  assert.equal(formatDownloads(12345), "12.3k");
});

test("la cifra trunca en vez de redondear: nunca queda por encima de la real", () => {
  assert.equal(formatDownloads(4499), "4.4k");
  assert.equal(formatDownloads(4599), "4.5k");
});

test("una cuenta invalida no produce una cifra falsa", () => {
  assert.throws(() => formatDownloads(Number.NaN), RangeError);
  assert.throws(() => formatDownloads(-1), RangeError);
  assert.throws(() => formatDownloads(Number.POSITIVE_INFINITY), RangeError);
});

function withFetch(impl: typeof fetch) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return () => {
    globalThis.fetch = original;
  };
}

test("lee downloadCount del registry", async () => {
  const restore = withFetch((async () => new Response(JSON.stringify({ downloadCount: 4450 }), { status: 200 })) as typeof fetch);
  try {
    assert.equal(await getOpenVsxDownloads("https://example.test/api"), 4450);
  } finally {
    restore();
  }
});

test("una respuesta de error devuelve null en vez de romper la ficha", async () => {
  const restore = withFetch((async () => new Response("nope", { status: 500 })) as typeof fetch);
  try {
    assert.equal(await getOpenVsxDownloads("https://example.test/api"), null);
  } finally {
    restore();
  }
});

test("un payload sin numero devuelve null", async () => {
  const restore = withFetch((async () => new Response(JSON.stringify({ downloadCount: "4450" }), { status: 200 })) as typeof fetch);
  try {
    assert.equal(await getOpenVsxDownloads("https://example.test/api"), null);
  } finally {
    restore();
  }
});

test("un registry que lanza tampoco rompe la ficha", async () => {
  const restore = withFetch((async () => {
    throw new Error("sin red");
  }) as typeof fetch);
  try {
    assert.equal(await getOpenVsxDownloads("https://example.test/api"), null);
  } finally {
    restore();
  }
});

test("el registry se consulta con un tope de espera", async () => {
  let received: RequestInit | undefined;
  const restore = withFetch((async (_input: RequestInfo | URL, init?: RequestInit) => {
    received = init;
    return new Response(JSON.stringify({ downloadCount: 1 }), { status: 200 });
  }) as typeof fetch);
  try {
    await getOpenVsxDownloads("https://example.test/api");
    assert.ok(received?.signal, "el fetch debe llevar senal de cancelacion");
  } finally {
    restore();
  }
});
