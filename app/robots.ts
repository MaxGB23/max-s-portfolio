import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * Nothing is hidden: the site is a home page and a set of project pages, all
 * public. The sitemap line is the only part that earns this file, since it
 * points crawlers at the URL list they would otherwise discover by following
 * links.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
