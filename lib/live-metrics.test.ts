/**
 * Tests de la metrica en vivo: el formateo es puro y la lectura del registry se
 * prueba con un `fetch` falso, sin red. Lo que se afirma es el contrato visible:
 * la cifra que aparece en la ficha y la garantia de que un registry caido no la
 * rompe.
 */

import assert from "node:assert/strict";
import test from "node:test";
import type { ProjectL } from "../data/projects/types.ts";
import { formatDownloads, getLiveMetrics, getOpenVsxDownloads, getZedDownloads, sumDownloads, withLiveMetric } from "./live-metrics.ts";

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
      fakeProject("funky-theme", { index: 0, sources: [{ kind: "openvsx", url: "https://example.test/api" }] }),
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
      fakeProject("funky-theme", { index: 0, sources: [{ kind: "openvsx", url: "https://example.test/api" }] }),
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

// -- Zed: el payload trae una fila por version publicada ----------------------

function zedRows(rows: unknown[]) {
  return new Response(JSON.stringify({ data: rows }), { status: 200 });
}

test("el parser de Zed toma la version mas reciente, no la ultima del array", async () => {
  const restore = withFetch((async () =>
    zedRows([
      { version: "0.1.0", published_at: "2026-10-09T11:58:03Z", download_count: 330 },
      { version: "0.2.1", published_at: "2026-10-21T09:19:43Z", download_count: 331 },
      { version: "0.2.0", published_at: "2026-10-15T09:24:06Z", download_count: 300 },
    ])) as typeof fetch);
  try {
    assert.equal(await getZedDownloads("https://example.test/zed"), 331);
  } finally {
    restore();
  }
});

test("una lista de versiones vacia no es cero descargas, es no disponible", async () => {
  // Zed responde 200 con `data: []` cuando el id no existe: publicar 0 seria
  // afirmar que la extension no tiene descargas.
  const restore = withFetch((async () => zedRows([])) as typeof fetch);
  try {
    assert.equal(await getZedDownloads("https://example.test/zed"), null);
  } finally {
    restore();
  }
});

function twoSources() {
  return [
    { kind: "openvsx" as const, url: "https://example.test/openvsx" },
    { kind: "zed" as const, url: "https://example.test/zed" },
  ];
}

test("la cifra publicada es la suma de los registries declarados", async () => {
  const restore = withFetch((async (input: RequestInfo | URL) => {
    if (String(input).includes("zed")) {
      return zedRows([{ version: "0.2.1", published_at: "2026-10-21T09:19:43Z", download_count: 330 }]);
    }
    return new Response(JSON.stringify({ downloadCount: 4450 }), { status: 200 });
  }) as typeof fetch);
  try {
    assert.equal(await sumDownloads(twoSources()), 4780);
    assert.equal(formatDownloads(4780), "4.7k");
    const map = await getLiveMetrics([fakeProject("funky-theme", { index: 0, sources: twoSources() })]);
    assert.deepEqual(map, { "funky-theme": "4.7k" });
  } finally {
    restore();
  }
});

test("si un registry falla no se publica una suma parcial", async () => {
  const restore = withFetch((async (input: RequestInfo | URL) => {
    if (String(input).includes("zed")) throw new Error("sin red");
    return new Response(JSON.stringify({ downloadCount: 4450 }), { status: 200 });
  }) as typeof fetch);
  try {
    // Sumar solo Open VSX (4.4k) publicaria menos traccion que la real.
    assert.equal(await sumDownloads(twoSources()), null);
    const map = await getLiveMetrics([fakeProject("funky-theme", { index: 0, sources: twoSources() })]);
    assert.deepEqual(map, {});
  } finally {
    restore();
  }
});
