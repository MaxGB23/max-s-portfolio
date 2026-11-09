/**
 * Tiempo transcurrido desde que un proyecto salio a produccion.
 *
 * Por que existe: la ficha publicaba "+10 meses en produccion" escrito a mano,
 * asi que la cifra envejecia cada mes y alguien tenia que acordarse de editarla.
 * Con una fecha de arranque el texto se calcula al renderizar, y el literal
 * escrito queda como respaldo, igual que la cifra de descargas.
 *
 * Formato: "1 year 4 months". Trunca: nunca redondea hacia arriba, asi que el
 * texto publicado nunca afirma mas tiempo del que realmente transcurrio.
 */

export type Tenure = { years: number; months: number; days: number };
export type TenureLang = "es" | "en";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type UnitName = "year" | "month" | "day";

const UNIT: Record<TenureLang, Record<UnitName, readonly [string, string]>> = {
  es: { year: ["año", "años"], month: ["mes", "meses"], day: ["día", "días"] },
  en: { year: ["year", "years"], month: ["month", "months"], day: ["day", "days"] },
};

/** Lee una fecha `YYYY-MM-DD` en UTC, o `null` si no es una fecha real. */
export function parseStartDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match === null) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  const isRealDate =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);

  return isRealDate ? date : null;
}

/** Suma meses de calendario recortando el dia al ultimo del mes destino. */
function addMonths(start: Date, months: number): Date {
  const year = start.getUTCFullYear();
  const month = start.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(Date.UTC(year, month, Math.min(start.getUTCDate(), lastDay)));
}

/**
 * Desglose en años, meses y dias.
 *
 * Devuelve `null` cuando la fecha de arranque no se puede leer o cae en el
 * futuro: en ese caso el llamador publica el respaldo escrito.
 */
export function measureTenure(startValue: string, now: Date = new Date()): Tenure | null {
  const start = parseStartDate(startValue);
  if (start === null) return null;

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (today.getTime() < start.getTime()) return null;

  let months =
    (today.getUTCFullYear() - start.getUTCFullYear()) * 12 + (today.getUTCMonth() - start.getUTCMonth());

  let anchor = addMonths(start, months);
  if (anchor.getTime() > today.getTime()) {
    months -= 1;
    anchor = addMonths(start, months);
  }

  const days = Math.round((today.getTime() - anchor.getTime()) / MS_PER_DAY);

  return { years: Math.floor(months / 12), months: months % 12, days };
}

function unit(lang: TenureLang, name: UnitName, count: number): string {
  const [singular, plural] = UNIT[lang][name];
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Texto del tiempo transcurrido: "+1 year 4 months", "+11 months", "+12 days".
 *
 * Lleva `+` porque el valor es un piso: trunca, nunca redondea hacia arriba, de
 * modo que "+11 meses" significa "once meses cumplidos o mas" y es literalmente
 * cierto. Sin el signo, la cifra se lee como medicion exacta y no lo es.
 *
 * Cuando hay años solo se añaden meses si aportan algo, y los dias se omiten en
 * cuanto la unidad mayor es el mes: "+1 year 4 months" se lee, "+1 year 4 months
 * 9 days" no.
 */
export function formatTenure(tenure: Tenure, lang: TenureLang): string {
  if (tenure.years > 0) {
    const years = unit(lang, "year", tenure.years);
    const text = tenure.months > 0 ? `${years} ${unit(lang, "month", tenure.months)}` : years;
    return `+${text}`;
  }

  if (tenure.months > 0) return `+${unit(lang, "month", tenure.months)}`;

  // El dia de salida a produccion ya cuenta como un dia cumplido.
  return `+${unit(lang, "day", Math.max(1, tenure.days))}`;
}

/** Texto listo para pintar, o `null` para que el llamador use el respaldo escrito. */
export function tenureText(startValue: string, lang: TenureLang, now: Date = new Date()): string | null {
  const tenure = measureTenure(startValue, now);
  return tenure === null ? null : formatTenure(tenure, lang);
}
