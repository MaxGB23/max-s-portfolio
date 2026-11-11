import type { MetadataRoute } from 'next'
import { projects } from '@/data/projects'
import { SITE_URL } from '@/lib/site'

/**
 * The whole site: the home page plus one entry per project, read from the same
 * `data/projects` array the route's `generateStaticParams` uses, so the sitemap
 * cannot advertise a page that does not exist.
 *
 * `lastModified` is deliberately absent. Deriving it from git at build time is
 * fragile and Google ignores it in practice; `priority` and `changeFrequency`
 * are absent for the same reason.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    ...projects.map((project) => ({ url: `${SITE_URL}/proyectos/${project.id}` })),
  ]
}
