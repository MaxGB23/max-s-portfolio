/**
 * Tests de la metrica en vivo: el formateo es puro y la lectura del registry se
 * prueba con un `fetch` falso, sin red. Lo que se afirma es el contrato visible:
 * la cifra que aparece en la ficha y la garantia de que un registry caido no la
 * rompe.
 */

import assert from "node:assert/strict";
import test from "node:test";
import type { ProjectL } from "../data/projects/types.ts";
import { formatDownloads, getLiveMetrics, getOpenVsxDownloads, withLiveMetric } from "./live-metrics.ts";

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

// `getLiveMetrics` solo lee `id` y `liveMetric`: el resto de la ficha no hace
// falta para probar el contrato del mapa.
function fakeProject(id: string, liveMetric?: ProjectL["liveMetric"]): ProjectL {
  return { id, liveMetric } as unknown as ProjectL;
}

test("solo los proyectos que declaran liveMetric entran al mapa", async () => {
  const consulted: string[] = [];
  const restore = withFetch((async (input: RequestInfo | URL) => {
    consulted.push(String(input));
    return new Response(JSON.stringify({ downloadCount: 4450 }), { status: 200 });
  }) as typeof fetch);
  try {
    const map = await getLiveMetrics([
      fakeProject("funky-theme", { index: 0, kind: "openvsx", url: "https://example.test/api" }),
      fakeProject("color-highlight"),
    ]);
    // Una sola clave: el id del que declara la metrica, con la cifra formateada.
    assert.deepEqual(map, { "funky-theme": "4.4k" });
    assert.deepEqual(consulted, ["https://example.test/api"]);
  } finally {
    restore();
  }
});

test("si el registry falla, el mapa queda vacio y el llamador cae al valor estatico", async () => {
  const restore = withFetch((async () => {
    throw new Error("sin red");
  }) as typeof fetch);
  try {
    const map = await getLiveMetrics([
      fakeProject("funky-theme", { index: 0, kind: "openvsx", url: "https://example.test/api" }),
    ]);
    assert.deepEqual(map, {});
    assert.equal(Object.keys(map).length, 0);
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

test("el valor vivo reemplaza la cifra y deja el texto de la card intacto", () => {
  assert.equal(withLiveMetric("4.4k descargas en Open VSX", "4.6k"), "4.6k descargas en Open VSX");
  assert.equal(withLiveMetric("4.4k downloads on Open VSX", "12.3k"), "12.3k downloads on Open VSX");
  assert.equal(withLiveMetric("999 descargas en Open VSX", "1k"), "1k descargas en Open VSX");
});

test("una metrica sin cifra inicial se queda como esta", () => {
  assert.equal(withLiveMetric("Verified Open VSX Publisher", "4.6k"), "Verified Open VSX Publisher");
});
