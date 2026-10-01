import type { Lang } from "@/data/translations";

/**
 * CV document per language — single source for the hero and contact download
 * links (both must point at the same file for a given locale).
 *
 * Both locales currently serve the EN PDF: there is no Spanish version yet and
 * the link must not end up empty. Drop the ES file into `public/documents/`
 * and swap the `es` entry when it exists.
 */
const CV_FILES: Record<Lang, string> = {
  en: "/documents/Maximiliano_Gonzalez_AI_Engineer_Resume.pdf",
  es: "/documents/Maximiliano_Gonzalez_AI_Engineer_Resume.pdf",
};

export const cvHref = (lang: Lang): string => CV_FILES[lang];
