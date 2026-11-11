import { cookies, headers } from 'next/headers'
import type { Lang } from '@/data/translations'

/**
 * Initial language decided on the SERVER (zero flash):
 * 1. Cookie 'lang' → honors a previous choice
 * 2. Accept-Language → browser preference on first visit
 * 3. Fallback: 'es'
 *
 * Shared by the root layout and by route metadata. Before this existed, the
 * layout honored Accept-Language while the project metadata only read the
 * cookie, so a first visit could render in one language and describe itself in
 * the other.
 */
export async function resolveLang(): Promise<Lang> {
  const store = await cookies()
  const cookieLang = store.get('lang')?.value
  if (cookieLang === 'es' || cookieLang === 'en') return cookieLang

  const accept = (await headers()).get('accept-language') ?? ''
  return accept.startsWith('en') ? 'en' : 'es'
}
