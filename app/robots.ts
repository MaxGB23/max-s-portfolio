import type { MetadataRoute } from 'next'
import { PERSON, SITE_URL } from '@/lib/site'

/**
 * The hero portrait is the only file name matched, with a wildcard on each
 * side: the same photo is served from `/_next/image?url=%2Fimages%2F...`, where
 * the path prefix is neither `/images/` nor anything stable. Deriving the
 * pattern from `PERSON.image` keeps the exclusion working if the photo is
 * renamed, instead of failing silently.
 */
const PORTRAIT_NAME = PERSON.image.split('/').pop() ?? PERSON.image

/**
 * The page stays public and fully crawlable for every crawler; the hero
 * portrait is the one thing held back from Google Images. The owner does not
 * want that photo in image results, and a path disallow for `Googlebot-Image`
 * is the only documented lever that targets one file: the alternatives either
 * blank the whole tab or drop the images from the index. The About photo and
 * the Open Graph card stay outside this group on purpose, because they are the
 * ones worth showing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot-Image', disallow: [`/*${PORTRAIT_NAME}*`] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
