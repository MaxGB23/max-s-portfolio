/**
 * Dibujo de los badges de descargas que muestra el README del perfil.
 *
 * Por que existe: antes la cifra era un SVG versionado que un cron reescribia a
 * diario. Cuando GitHub omitia la ejecucion programada, el README publicaba una
 * cifra vieja, y cada refresco dejaba un commit en el repo. Servir el SVG desde
 * aqui deja la cifra en vivo y sin historial.
 *
 * La geometria copia la de shields `for-the-badge`: alto 28, Verdana bold de
 * 10 px en mayusculas, 12 px de padding por segmento y un estiramiento de 1.16x
 * sobre el ancho natural del texto, que es su espaciado entre letras.
 *
 * El dibujo es el mismo para las dos familias de badge: descargas (una cifra que
 * llega de un registry) y tiempo en produccion (una fecha de arranque). Lo unico
 * que cambia es el texto del segmento de color.
 */

import { CAF_PRODUCTION_SINCE } from "./production-since.ts";
import { formatDownloads } from "./live-metrics.ts";
import { tenureText } from "./tenure.ts";

export const BADGE_HEIGHT = 28;
/** AA para texto chico: la etiqueta del badge son 10 px en negrita. */
export const BADGE_MIN_CONTRAST = 4.5;
/**
 * Ventana de cache del SVG. La misma que la de la ficha del proyecto
 * (`LIVE_METRIC_REVALIDATE_SECONDS`): dos veces al dia es suficiente para un dato
 * que se mueve de a unidades, y una sola cadencia es una regla menos que recordar.
 */
export const BADGE_CACHE_SECONDS = 12 * 60 * 60;

const PADDING = 12;
const STRETCH = 1.16;
const FALLBACK_GLYPH_WIDTH = 7.5;
const TEXT_COLOR = "#ffffff";
const LABEL_COLOR = "#555555";
const TEXT_FONT = "Verdana,Geneva,DejaVu Sans,sans-serif";

/** Anchos de glifo de Verdana bold 10 px, medidos con canvas `measureText`. */
const GLYPH_WIDTH: Record<string, number> = {
  A: 7.764, B: 7.617, C: 7.236, D: 8.301, E: 6.831, F: 6.504, G: 8.11, H: 8.374,
  I: 5.459, J: 5.552, K: 7.71, L: 6.372, M: 9.478, N: 8.467, O: 8.501, P: 7.329,
  Q: 8.501, R: 7.822, S: 7.104, T: 6.816, U: 8.12, V: 7.637, W: 11.284, X: 7.637,
  Y: 7.368, Z: 6.919,
  "0": 7.109, "1": 7.109, "2": 7.109, "3": 7.109, "4": 7.109,
  "5": 7.109, "6": 7.109, "7": 7.109, "8": 7.109, "9": 7.109,
  " ": 3.418, ",": 3.613, ".": 3.613,
};

export type DownloadSource = "open-vsx" | "zed";
export type BadgeId = DownloadSource | "uptime" | "uptime-only";

/** De donde sale el texto del badge. */
export type BadgeValue =
  | {
      kind: "downloads";
      source: { kind: DownloadSource; url: string };
      /**
       * Respaldo escrito: lo que se publica si el registry no responde. Son las
       * cifras medidas el 6 nov 2026, las mismas que documenta
       * `data/projects/funky-theme.ts` como respaldo de la ficha.
       */
      fallbackCount: number;
    }
  | {
      kind: "tenure";
      /** Fecha de arranque en produccion, `YYYY-MM-DD`. */
      start: string;
      /** Respaldo escrito en mayusculas: si la fecha no se puede leer se publica esto. */
      fallbackText: string;
      /**
       * Texto que sigue al dato, en mayusculas: "IN PRODUCTION". Sirve para el
       * badge de un solo segmento, donde la etiqueta gris desaparece y las
       * palabras tienen que viajar dentro de la pildora de color.
       */
      qualifier?: string;
    };

export type BadgeSpec = {
  /** Nombre del archivo que se pide al endpoint, con extension. */
  file: string;
  /**
   * Etiqueta del segmento gris. Vacia significa que no hay segmento gris: el
   * badge es una sola pildora con el dato dentro.
   */
  label: string;
  /** Color del segmento que lleva el dato. */
  color: string;
  /** Texto que lee un lector de pantalla cuando la imagen no se ve. */
  ariaLabel: string;
  /**
   * Razon escrita para publicar un color por debajo de AA. Sin este campo el
   * dibujo falla: un color nuevo no puede bajar el contraste sin decirlo.
   */
  contrastException?: string;
  value: BadgeValue;
};

export const BADGES: Record<BadgeId, BadgeSpec> = {
  "open-vsx": {
    file: "open-vsx.svg",
    label: "OPEN VSX",
    // El verde es la identidad del tema: se queda aunque no llegue a AA.
    color: "#7aa800",
    ariaLabel: "Open VSX downloads",
    contrastException: "verde de marca",
    value: {
      kind: "downloads",
      source: { kind: "open-vsx", url: "https://open-vsx.org/api/MaxGB23/funky-theme-vscode" },
      fallbackCount: 5104,
    },
  },
  zed: {
    file: "zed.svg",
    label: "ZED",
    color: "#6e56cf",
    ariaLabel: "Zed downloads",
    value: {
      kind: "downloads",
      source: { kind: "zed", url: "https://api.zed.dev/extensions/funky-theme" },
      fallbackCount: 1711,
    },
  },
  uptime: {
    file: "uptime.svg",
    // El dato es de CAF, no del sitio: la etiqueta lo dice para que el README no
    // lo lea como tiempo de vida del portafolio.
    label: "CAF IN PRODUCTION",
    // Azul cielo. Con texto blanco alcanza 3.94:1, por debajo de AA: la
    // excepcion de abajo lo dice y el test comprueba que el numero declarado sea
    // el medido, no uno escrito a mano.
    color: "#2f7cf6",
    ariaLabel: "CAF time in production",
    contrastException: "azul cielo, 3.94:1 medido con texto blanco",
    value: {
      kind: "tenure",
      // Misma fecha que la ficha del proyecto: una sola constante.
      start: CAF_PRODUCTION_SINCE,
      // Lo que se publica si la fecha se vuelve ilegible: once meses cumplidos.
      fallbackText: "+11 MONTHS",
    },
  },
  // Variante de un solo segmento, para comparar en el README: sin etiqueta gris
  // porque la viñeta ya nombra el proyecto, y las palabras viajan dentro de la
  // pildora. Existe solo mientras se decide el diseño.
  "uptime-only": {
    file: "uptime-only.svg",
    label: "",
    color: "#2f7cf6",
    ariaLabel: "CAF time in production",
    contrastException: "azul cielo, 3.94:1 medido con texto blanco",
    value: {
      kind: "tenure",
      start: CAF_PRODUCTION_SINCE,
      fallbackText: "+11 MONTHS",
      qualifier: "IN PRODUCTION",
    },
  },
};

/** Busca el badge por el nombre de archivo que llega en la URL. */
export function findBadge(file: string): BadgeSpec | null {
  return Object.values(BADGES).find((badge) => badge.file === file) ?? null;
}

const round = (value: number): number => Math.round(value * 100) / 100;

/** Ancho del texto en px, ya estirado como lo dibuja el SVG. */
function textWidth(text: string): number {
  const natural = [...text].reduce((sum, glyph) => sum + (GLYPH_WIDTH[glyph] ?? FALLBACK_GLYPH_WIDTH), 0);
  return natural * STRETCH;
}

const channelLuminance = (hex: string, offset: number): number => {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (hex: string): number =>
  0.2126 * channelLuminance(hex, 1) + 0.7152 * channelLuminance(hex, 3) + 0.0722 * channelLuminance(hex, 5);

/** Contraste WCAG entre dos colores `#rrggbb`. */
export function contrastRatio(colorA: string, colorB: string): number {
  const [lighter, darker] = [relativeLuminance(colorA), relativeLuminance(colorB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

type Segment = { text: string; color: string };

/**
 * Dibuja el badge con el texto ya resuelto del segmento de color.
 *
 * Falla si ese texto no llega a AA y el badge no declara una excepcion escrita:
 * el contraste es una decision, no un accidente.
 */
function drawBadge(spec: BadgeSpec, valueText: string): string {
  // Una etiqueta vacia no dibuja segmento gris: el badge queda como una sola
  // pildora de color con el dato y sus palabras dentro.
  const segments: Segment[] = [
    ...(spec.label === "" ? [] : [{ text: spec.label, color: LABEL_COLOR }]),
    { text: valueText, color: spec.color },
  ];

  const rects: string[] = [];
  const texts: string[] = [];
  let cursor = 0;

  for (const segment of segments) {
    const ratio = contrastRatio(TEXT_COLOR, segment.color);
    if (ratio < BADGE_MIN_CONTRAST && !spec.contrastException) {
      throw new RangeError(
        `${spec.file}: el texto sobre ${segment.color} solo alcanza ${ratio.toFixed(2)}:1, debajo del minimo de ${BADGE_MIN_CONTRAST}:1`,
      );
    }

    const width = round(textWidth(segment.text) + PADDING * 2);
    rects.push(`<rect x="${round(cursor)}" width="${width}" height="${BADGE_HEIGHT}" fill="${segment.color}"/>`);

    // Los <text> van escalados por 0.1, asi que `x`, `y` y `textLength` se
    // expresan en decimas de pixel. Pasar pixeles aqui aplasta los glifos.
    const centerX = cursor + width / 2;
    texts.push(
      `<text transform="scale(.1)" x="${round(centerX * 10)}" y="${round(17.5 * 10)}" textLength="${round(
        textWidth(segment.text) * 10,
      )}" font-weight="bold">${segment.text}</text>`,
    );

    cursor += width;
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${round(cursor)}" height="${BADGE_HEIGHT}" role="img" aria-label="${spec.ariaLabel}">`,
    `<title>${spec.ariaLabel}</title>`,
    `<g shape-rendering="crispEdges">${rects.join("")}</g>`,
    `<g fill="${TEXT_COLOR}" text-anchor="middle" font-family="${TEXT_FONT}" text-rendering="geometricPrecision" font-size="100">${texts.join("")}</g>`,
    "</svg>",
    "",
  ].join("\n");
}

/** Dibuja el badge de descargas para una cifra concreta. */
export function renderBadge(spec: BadgeSpec, count: number): string {
  if (!Number.isFinite(count) || count < 0) {
    throw new RangeError(`descargas invalidas: ${count}`);
  }

  return drawBadge(spec, `${formatDownloads(count).toUpperCase()} DOWNLOADS`);
}

/**
 * Dibuja el badge de tiempo en produccion.
 *
 * Si la fecha de arranque no se puede leer se publica el respaldo escrito: el
 * endpoint nunca devuelve una imagen rota.
 */
export function renderTenureBadge(spec: BadgeSpec, now: Date = new Date()): string {
  if (spec.value.kind !== "tenure") {
    throw new RangeError(`${spec.file}: no es un badge de tiempo en produccion`);
  }

  const { start, fallbackText, qualifier } = spec.value;
  const measured = tenureText(start, "en", now) ?? fallbackText;
  const text = qualifier === undefined ? measured : `${measured} ${qualifier}`;

  return drawBadge(spec, text.toUpperCase());
}
