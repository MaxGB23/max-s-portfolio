import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatTenure, measureTenure, parseStartDate, tenureText } from "./tenure.ts";

const at = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

describe("parseStartDate", () => {
  it("lee una fecha ISO en UTC", () => {
    assert.equal(parseStartDate("2025-11-22")?.toISOString(), "2025-11-22T00:00:00.000Z");
  });

  it("rechaza formatos que no son YYYY-MM-DD", () => {
    for (const value of ["22/11/2025", "nov 22 2025", "2025-11", ""]) {
      assert.equal(parseStartDate(value), null, value);
    }
  });

  it("rechaza fechas que no existen en el calendario", () => {
    assert.equal(parseStartDate("2025-02-30"), null);
    assert.equal(parseStartDate("2025-13-01"), null);
  });
});

describe("measureTenure", () => {
  it("cumple el año exacto el dia del aniversario", () => {
    assert.deepEqual(measureTenure("2025-11-22", at("2026-11-22")), { years: 1, months: 0, days: 0 });
  });

  it("desglosa año y meses", () => {
    assert.deepEqual(measureTenure("2025-11-22", at("2027-03-22")), { years: 1, months: 4, days: 0 });
  });

  it("no adelanta el mes cuando el dia aun no llega", () => {
    assert.deepEqual(measureTenure("2025-11-22", at("2026-11-09")), { years: 0, months: 11, days: 18 });
  });

  it("recorta al ultimo dia del mes destino", () => {
    // 31 de enero + 1 mes es 28 de febrero: no existe el 31.
    assert.deepEqual(measureTenure("2026-01-31", at("2026-03-01")), { years: 0, months: 1, days: 1 });
  });

  it("devuelve null si la fecha cae en el futuro", () => {
    assert.equal(measureTenure("2026-11-22", at("2026-11-09")), null);
  });

  it("devuelve null si la fecha no se puede leer", () => {
    assert.equal(measureTenure("sin fecha", at("2026-11-09")), null);
  });
});

describe("formatTenure", () => {
  it("compone años y meses", () => {
    assert.equal(formatTenure({ years: 1, months: 4, days: 9 }, "en"), "+1 year 4 months");
    assert.equal(formatTenure({ years: 1, months: 4, days: 9 }, "es"), "+1 año 4 meses");
  });

  it("omite los meses cuando son cero", () => {
    assert.equal(formatTenure({ years: 2, months: 0, days: 40 }, "en"), "+2 years");
  });

  it("bajo el año usa meses y omite los dias", () => {
    assert.equal(formatTenure({ years: 0, months: 11, days: 18 }, "en"), "+11 months");
    assert.equal(formatTenure({ years: 0, months: 1, days: 1 }, "es"), "+1 mes");
  });

  it("bajo el mes usa dias, con singular y plural", () => {
    assert.equal(formatTenure({ years: 0, months: 0, days: 12 }, "en"), "+12 days");
    assert.equal(formatTenure({ years: 0, months: 0, days: 1 }, "es"), "+1 día");
  });

  it("el dia de salida cuenta como un dia cumplido", () => {
    assert.equal(formatTenure({ years: 0, months: 0, days: 0 }, "en"), "+1 day");
  });
});

describe("tenureText", () => {
  it("devuelve el texto listo para pintar", () => {
    assert.equal(tenureText("2025-11-22", "en", at("2027-03-22")), "+1 year 4 months");
    assert.equal(tenureText("2025-11-22", "es", at("2026-11-09")), "+11 meses");
  });

  it("devuelve null para que el llamador publique el respaldo", () => {
    assert.equal(tenureText("2026-11-22", "en", at("2026-11-09")), null);
    assert.equal(tenureText("", "en", at("2026-11-09")), null);
  });
});
