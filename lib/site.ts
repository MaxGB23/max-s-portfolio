/**
 * Canonical identity of the site.
 *
 * Everything that needs an absolute URL or the person's name reads it here:
 * `metadataBase`, `robots.txt`, `sitemap.xml` and the JSON-LD graph. Changing
 * the deployment origin (a custom domain, for example) is one environment
 * variable instead of a search across the codebase.
 */
export const SITE_URL = (
  process.env.SITE_URL ?? 'https://max-gonzalez-ballesteros.vercel.app'
).replace(/\/$/, '')

/**
 * The legal name is the entity's canonical identity in structured data; the
 * short form is what the site and the title use. `alternateName` keeps both
 * discoverable, because a search for the legal name and a search for "Max"
 * are not the same query to a crawler.
 */
export const PERSON = {
  name: 'Maximiliano González Ballesteros',
  alternateName: 'Max González Ballesteros',
  // The hero eyebrow says FULL STACK DEVELOPER; the CV and LinkedIn say the
  // same. The title follows them rather than the other way around.
  jobTitle: 'Full Stack Developer',
  locality: 'Acámbaro',
  region: 'Guanajuato',
  country: 'MX',
  image: '/images/max-gb-pfp.webp',
} as const

export const SITE = {
  // Owner's choice: the short form is the exact string a name search types and
  // fits the result line without truncation. The legal name opens the
  // description instead, so that query still matches.
  title: 'Max González Ballesteros — Full Stack Developer',
  // What Google may use as the site name instead of the hosting provider's.
  name: PERSON.alternateName,
  // What the site actually is, in the words the hero and the about section use:
  // web apps in production plus self-built products with thousands of
  // downloads. 155 characters, inside the snippet Google shows (~155).
  description:
    'Maximiliano González Ballesteros, full stack developer in México. Web apps in production with React and Next.js, plus products with thousands of downloads.',
  // Social previews cut around 125 characters on mobile, so this one is shorter
  // on purpose: 121. The previous single description was 156 and truncated on
  // "…experiences with".
  socialDescription:
    'Full stack developer in México. Web apps in production with React and Next.js, plus products with thousands of downloads.',
} as const

export const PROFILES = [
  'https://github.com/MaxGB23',
  'https://www.linkedin.com/in/maxballesteros',
] as const
