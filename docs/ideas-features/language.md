# 🌐 Feature: Language Switcher (ES / EN)

> Estado: **Planificado** — sin implementar aún.

---

## Objetivo

Añadir un botón en el Navbar que permita cambiar el idioma de la página entre **Español (ES)** e **Inglés (EN)**, con:

- **Detección automática** del idioma preferido del usuario al entrar por primera vez.
- **Persistencia** de la elección en visitas posteriores.
- **Sin flash de contenido**: el primer render del servidor ya usa el idioma correcto.
- Integración limpia en el Navbar existente (desktop + mobile).

---

## Enfoque recomendado: Cookie + Context (sin `next-intl`)

Dado que el portfolio es una **SPA de una sola ruta** (no hay rutas `/es` o `/en`), la solución más simple y sin overhead es manejar el idioma con:

1. Una **cookie** (`lang`) como fuente de verdad: legible en el **servidor** para el primer render y escribible en el cliente al cambiar de idioma.
2. Un **React Context** (`LanguageContext`) que expone el idioma activo (inicializado desde el servidor) y la función para cambiarlo.
3. **`navigator.language`** como fallback de detección automática en el primer acceso (resuelto en el cliente solo cuando no hay cookie).

> **¿Por qué cookie y no `localStorage`?**
> `localStorage` no es accesible durante SSR. Si el default del servidor es `'es'`, un usuario con navegador en inglés ve contenido en español que "salta" a inglés después de hidratar (flash de contenido). La cookie viaja en cada request, así que el servidor renderiza directamente en el idioma correcto. Cero parpadeo.

> **¿Por qué no `next-intl`?**
> `next-intl` está pensado para apps con rutas por idioma (`/es/about`, `/en/about`). Para un portfolio de una sola página añadiría complejidad innecesaria (middleware, configuración de routing, etc.).

---

## Detección automática del idioma

El orden de prioridad es:

```
Servidor (primer render):
1. Cookie 'lang' → si ya eligió antes → renderiza en ese idioma

Cliente (solo si no hay cookie válida):
2. navigator.language / navigator.languages → preferencia del navegador
3. Fallback: 'es' → default si nada coincide
```

### Snippet de detección (cliente)

```ts
function detectLanguage(): Lang {
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  return browserLang === 'en' ? 'en' : 'es';
}
```

> **Vercel no es necesario aquí.** La geolocalización por IP de Vercel (Edge Middleware) requeriría rutas separadas. `navigator.language` da la preferencia del sistema operativo/navegador del usuario, lo cual es suficiente y más preciso.

---

## Arquitectura de archivos

```
contexts/
  language-context.tsx      ← Context + Provider + hook useLanguage()

data/
  translations.ts           ← Objeto tipado con todos los textos ES/EN

components/
  navbar.tsx                ← Añadir <LanguageToggle /> aquí
  language-toggle.tsx       ← Botón ES | EN (nuevo componente)

app/
  layout.tsx                ← Leer cookie (server) y envolver con <LanguageProvider>
```

---

## Implementación paso a paso

### 1. `data/translations.ts`

```ts
export const translations = {
  es: {
    // Navbar
    'nav.available': 'Disponible para trabajo remoto',
    'nav.available.short': 'Disponible en remoto',
    'nav.home': 'Inicio',
    'nav.about': 'Sobre mí',
    'nav.projects': 'Proyectos',
    'nav.pricing': 'Precios',
    'nav.contact': 'Contacto',

    // Hero
    'hero.greeting': 'Hola, soy Max',
    'hero.role': 'Full Stack Developer',
    'hero.cta': 'Ver proyectos',
    'hero.contact': 'Contacto',

    // Agregar secciones según se necesite...
  },
  en: {
    'nav.available': 'Available for remote work',
    'nav.available.short': 'Available remotely',
    'nav.home': 'Home',
    'nav.about': 'About me',
    'nav.projects': 'Projects',
    'nav.pricing': 'Pricing',
    'nav.contact': 'Contact',

    'hero.greeting': "Hi, I'm Max",
    'hero.role': 'Full Stack Developer',
    'hero.cta': 'View projects',
    'hero.contact': 'Contact',
  },
} as const;

export type Lang = keyof typeof translations;

// Claves tipadas: t('nav.abut') NO compila ✅
export type TranslationKey = keyof typeof translations['es'];
```

> **Type safety garantizada:** `TranslationKey` se deriva de `es`; si `en` llega a quedarse sin alguna clave, el tipo `satisfies` del paso siguiente lo detecta en compilación.

### 2. `contexts/language-context.tsx`

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Lang, type TranslationKey } from '@/data/translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang); // ← viene del servidor, sin flash

  // Solo la primera vez: si no había cookie válida, detectar por navegador
  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lang='))
      ?.split('=')[1];

    if (stored !== 'es' && stored !== 'en') {
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      const detected: Lang = browserLang === 'en' ? 'en' : 'es';
      setLangState(detected);
      document.cookie = `lang=${detected}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; samesite=lax`;
  };

  const t = (key: TranslationKey): string => translations[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
```

Puntos clave:

- **Cero flash**: el estado inicial viene del servidor vía `initialLang`.
- **Import estático**: sin `require()` — ESM puro, tree-shakeable y lint-friendly.
- **Claves tipadas**: `t` acepta solo claves existentes; typo = error de compilación.
- **Cookie compartida**: la misma cookie que lee el servidor escribe el cliente, así ambas partes siempre coinciden.

### 3. `app/layout.tsx` (Server Component)

```tsx
import { cookies } from 'next/headers';
import { LanguageProvider } from '@/contexts/language-context';
import { translations, type Lang } from '@/data/translations';

// Next 15+: cookies() es asíncrono
async function getInitialLang(): Promise<Lang> {
  const store = await cookies();
  const lang = store.get('lang')?.value;
  return lang === 'es' || lang === 'en' ? lang : 'es';
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialLang = await getInitialLang();

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body>
        <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
```

Bonus: `<html lang={initialLang}>` ahora refleja el idioma real desde SSR — mejora accesibilidad (screen readers) y SEO sin esfuerzo extra.

> Si tu versión de Next es < 15, `cookies()` es síncrono: `const store = cookies()` sin `await`.

### 4. `components/language-toggle.tsx` (nuevo)

```tsx
'use client';

import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

const options = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
] as const satisfies ReadonlyArray<{ value: Lang; label: string }>;

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border px-1 py-0.5 text-xs font-medium">
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={cn(
            'rounded-full px-2 py-0.5 transition-colors duration-150',
            lang === value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={lang === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### 5. Integrar en `components/navbar.tsx`

**Desktop** — dentro del `div` de la derecha junto al botón Contacto:

```tsx
import { LanguageToggle } from '@/components/language-toggle';

{/* Right side */}
<div className="hidden md:flex items-center gap-3">
  <LanguageToggle />
  <Link href="#contacto" ...>Contacto</Link>
</div>
```

**Mobile** — dentro del `div` junto al botón de hamburguesa:

```tsx
<div className="flex md:hidden items-center gap-2">
  <LanguageToggle />
  <button onClick={() => setMobileOpen(!mobileOpen)} ...>
    ...
  </button>
</div>
```

### 6. Usar traducciones en los componentes

Cualquier componente que necesite texto internacionalizado simplemente usa el hook:

```tsx
'use client';
import { useLanguage } from '@/contexts/language-context';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section>
      <h1>{t('hero.greeting')}</h1>
      <p>{t('hero.role')}</p>
    </section>
  );
}
```

---

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `app/layout.tsx` | Leer cookie con `next/headers` + envolver con `<LanguageProvider initialLang={...}>` |
| `components/navbar.tsx` | Añadir `<LanguageToggle />` (desktop + mobile) + usar `t()` en textos |
| `components/hero-section.tsx` | Usar `t()` en todos los textos visibles |
| *(resto de secciones)* | Usar `t()` según se implementen |
| `data/translations.ts` | **Nuevo** — Objeto tipado con todos los textos + tipos `Lang` y `TranslationKey` |
| `contexts/language-context.tsx` | **Nuevo** — Context, Provider, hook |
| `components/language-toggle.tsx` | **Nuevo** — Botón ES / EN |

---

## Notas y decisiones

- **Cero flash real**: la cookie permite al servidor conocer el idioma antes del primer byte. A diferencia del enfoque con `localStorage`, no hay cambio visible de idioma tras hidratar.
- **Cookie vs `localStorage` tradeoff aceptado**: la cookie añade ~10 bytes al header de cada request. Para un portfolio estático, el beneficio (SSR correcto) supera con creces el costo.
- **Sin librería extra**: no se instala `next-intl`, `i18next` ni nada externo. Cero dependencias nuevas.
- **Type-safe end-to-end**: `TranslationKey` derivado de las traducciones hace imposible usar una clave inexistente; añadir una clave nueva sin su traducción falla en compilación.
- **Extensible**: añadir más idiomas es agregar una entrada a `translations.ts` y una opción al toggle.
- **Accesibilidad/SEO**: `<html lang>` se emite correcto desde el servidor.
