/**
 * Tests del tiempo en produccion calculado: la ficha declara `productionSince` y
 * `localizeProject` publica el texto medido para el idioma activo, o nada si la
 * fecha no sirve — en cuyo caso el consumidor publica la cifra escrita.
 *
 * Todo se prueba con fichas FIXTURE, nunca con las reales: las reales no llevan
 * fecha (no se inventa ninguna), asi que solo una ficha de prueba puede fijar el
 * contrato sin convertir un dato desconocido en una afirmacion.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  localizeProject,
  productionMetricValue,
  type ProjectL,
} from "./projects/types.ts";

const at = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

/**
 * Ficha minima valida con la metrica de tiempo escrita a mano, exactamente como
 * la publican hoy los proyectos sin fecha.
 */
function fixture(overrides: { productionSince?: string } = {}): ProjectL {
  return {
    id: "fixture",
    title: { es: "Fixture", en: "Fixture" },
    category: { es: "Web", en: "Web" },
    hook: { es: "Hook de prueba.", en: "Test hook." },
    metric: {
      es: "+10 meses en producción sin caídas",
      en: "+10 months in production with zero outages",
    },
    tags: ["Next.js"],
    image: "/images/projects/fixture/fixture.webp",
    imageAlt: { es: "Captura de prueba", en: "Test capture" },
    links: [],
    productionSince: overrides.productionSince,
    detail: {
      headline: { es: "Titular de prueba.", en: "Test headline." },
      summary: { es: "Resumen de prueba.", en: "Test summary." },
      metrics: [
        {
          value: { es: "+10 meses", en: "+10 months" },
          label: { es: "Tiempo en producción", en: "Time in production" },
        },
      ],
      solution: [{ es: "Solución de prueba.", en: "Test solution." }],
      stack: [],
      gallery: [],
      cta: { es: "Ver más", en: "See more" },
    },
  };
}

const TENURE_ES = "+1 año 4 meses";
const TENURE_EN = "+1 year 4 months";

describe("localizeProject - tiempo en produccion", () => {
  it("calcula el texto en los dos idiomas desde productionSince", () => {
    const entry = fixture({ productionSince: "2025-11-22" });

    assert.equal(localizeProject(entry, "es", at("2027-03-22")).productionTenure, TENURE_ES);
    assert.equal(localizeProject(entry, "en", at("2027-03-22")).productionTenure, TENURE_EN);
  });

  it("sin productionSince no agrega el campo y la metrica escrita queda intacta", () => {
    const localized = localizeProject(fixture(), "es", at("2027-03-22"));

    // La clave no existe: no es `undefined` colgado en el objeto.
    assert.equal("productionTenure" in localized, false);
    assert.equal(localized.metric, "+10 meses en producción sin caídas");
    assert.equal(localized.detail.metrics[0].value, "+10 meses");
  });

  it("una fecha ilegible no produce texto calculado", () => {
    for (const productionSince of ["22/11/2025", "2025-02-30", ""]) {
      const localized = localizeProject(fixture({ productionSince }), "es", at("2027-03-22"));

      assert.equal(localized.productionTenure, undefined, productionSince);
      assert.equal(localized.metric, "+10 meses en producción sin caídas", productionSince);
    }
  });

  it("una fecha futura no produce texto calculado", () => {
    const localized = localizeProject(
      fixture({ productionSince: "2027-03-23" }),
      "es",
      at("2027-03-22"),
    );

    assert.equal(localized.productionTenure, undefined);
    assert.equal(localized.metric, "+10 meses en producción sin caídas");
  });
});

describe("productionMetricValue - precedencia en la card", () => {
  it("sustituye solo la duracion inicial y conserva la afirmacion que sigue", () => {
    assert.equal(
      productionMetricValue(TENURE_ES, "+10 meses en producción sin caídas"),
      "+1 año 4 meses en producción sin caídas",
    );
    assert.equal(
      productionMetricValue("+1 year 4 months", "+10 months in production with zero outages"),
      "+1 year 4 months in production with zero outages",
    );
  });

  it("reemplaza el valor entero cuando la metrica es solo la duracion", () => {
    assert.equal(productionMetricValue(TENURE_ES, "+10 meses"), TENURE_ES);
  });

  it("sin texto calculado devuelve la cifra escrita", () => {
    assert.equal(
      productionMetricValue(undefined, "+10 meses en producción sin caídas"),
      "+10 meses en producción sin caídas",
    );
  });

  it("si la frase no empieza por una duracion publica el texto calculado", () => {
    // Contrato de las fichas: la duracion va primero. Si no va, no se adivina
    // donde cortar: se publica el dato calculado.
    assert.equal(productionMetricValue(TENURE_ES, "en producción sin caídas"), TENURE_ES);
  });
});
