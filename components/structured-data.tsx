import { PERSON, PROFILES, SITE, SITE_URL } from '@/lib/site'

/**
 * Machine-readable identity.
 *
 * Google already finds the site for a name search, but it shows the hosting
 * provider as the site name and has no explicit statement that the person on
 * this page is the same `MaxGB23` on GitHub and `maxballesteros` on LinkedIn.
 * `Person` with `sameAs` is how that link is declared; `WebSite.name` is what
 * Google may use instead of "Vercel" for a `vercel.app` subdomain.
 *
 * The graph is built from the same constants the metadata uses, so a name or
 * handle changes in one place.
 */
export function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PERSON.name,
        alternateName: PERSON.alternateName,
        url: SITE_URL,
        image: `${SITE_URL}${PERSON.image}`,
        jobTitle: PERSON.jobTitle,
        address: {
          '@type': 'PostalAddress',
          addressLocality: PERSON.locality,
          addressRegion: PERSON.region,
          addressCountry: PERSON.country,
        },
        sameAs: [...PROFILES],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        inLanguage: ['es-MX', 'en'],
        publisher: { '@id': `${SITE_URL}/#person` },
      },
    ],
  }

  // `<` is escaped so no value can close the script element early.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  )
}
