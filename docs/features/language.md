# 🌐 Feature: Language Switcher (ES / EN)

> Estado: **Planificado** — sin implementar aún.

---

## Objetivo

Añadir un botón en el Navbar que permita cambiar el idioma de la página entre **Español (ES)** y **Inglés (EN)**, con:

- **Detección automática** del idioma preferido del usuario al entrar por primera vez.
- **Persistencia** de la elección en visitas posteriores.
- Integración limpia en el Navbar existente (desktop + mobile).

---

## Enfoque recomendado: Context + `localStorage` (sin `next-intl`)

Dado que el portfolio es una **SPA de una sola ruta** (no hay rutas `/es` o `/en`), la solución más simple y sin overhead es manejar el idioma con:

1. Un **React Context** (`LanguageContext`) que expone el idioma activo y una función para cambiarlo.
2. **`localStorage`** para persistir la elección.
3. **`navigator.language`** como fallback de detección automática en el primer acceso.

> **¿Por qué no `next-intl`?**
> `next-intl` está pensado para apps con rutas por idioma (`/es/about`, `/en/about`). Para un portfolio de una sola página añadiría complejidad innecesaria (middleware, configuración de routing, etc.).

---

## Detección automática del idioma

Al entrar por primera vez (sin nada en `localStorage`), el orden de prioridad es:

```
1. localStorage.getItem('lang')          → si ya eligió antes
2. navigator.language / navigator.languages → preferencia del navegador
3. Fallback: 'es'                         → default si nada coincide
```

### Snippet de detección

```ts
function detectLanguage(): 'es' | 'en' {
  // 1. Persistido
  const stored = localStorage.getItem('lang');
  if (stored === 'es' || stored === 'en') return stored;

  // 2. Navegador
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (browserLang === 'en') return 'en';

  // 3. Default
  return 'es';
}
```

> **Vercel no es necesario aquí.** La geolocalización por IP de Vercel (Edge Middleware) requeriría rutas separadas. `navigator.language` da la preferencia del sistema operativo/navegador del usuario, lo cual es suficiente y más preciso.

---

## Arquitectura de archivos

```
contexts/
  language-context.tsx      ← Context + Provider + hook useLanguage()

data/
  translations.ts           ← Objeto con todos los textos en ES/EN

components/
  navbar.tsx                ← Añadir <LanguageToggle /> aquí
  language-toggle.tsx       ← Botón ES | EN (nuevo componente)

app/
  layout.tsx                ← Envolver con <LanguageProvider>
```

---

## Implementación paso a paso

### 1. `contexts/language-context.tsx`

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'es' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'es';
  const stored = localStorage.getItem('lang');
  if (stored === 'es' || stored === 'en') return stored;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return browser === 'en' ? 'en' : 'es';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es'); // SSR-safe default

  useEffect(() => {
    setLangState(detectLanguage()); // cliente: detecta idioma real
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  // Importa las traducciones (ver paso 2)
  const { translations } = require('@/data/translations');
  const t = (key: string): string =>
    translations[lang]?.[key] ?? translations['es']?.[key] ?? key;

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

---

### 2. `data/translations.ts`

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

    // Hero (ejemplos — añadir según contenido real)
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

    'hero.greeting': 'Hi, I\'m Max',
    'hero.role': 'Full Stack Developer',
    'hero.cta': 'View projects',
    'hero.contact': 'Contact',
  },
} as const;
```

---

### 3. `components/language-toggle.tsx` (nuevo)

```tsx
'use client';

import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border px-1 py-0.5 text-xs font-medium">
      <button
        onClick={() => setLang('es')}
        className={cn(
          'rounded-full px-2 py-0.5 transition-colors duration-150',
          lang === 'es'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
      <button
        onClick={() => setLang('en')}
        className={cn(
          'rounded-full px-2 py-0.5 transition-colors duration-150',
          lang === 'en'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
}
```

---

### 4. Integrar en `app/layout.tsx`

```tsx
// Añadir el provider
import { LanguageProvider } from '@/contexts/language-context';

// Envolver children:
<LanguageProvider>
  <SmoothScroll>
    {children}
  </SmoothScroll>
</LanguageProvider>
```

---

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

---

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
| `app/layout.tsx` | Envolver con `<LanguageProvider>` |
| `components/navbar.tsx` | Añadir `<LanguageToggle />` (desktop + mobile) + usar `t()` en textos |
| `components/hero-section.tsx` | Usar `t()` en todos los textos visibles |
| *(resto de secciones)* | Usar `t()` según se implementen |
| `contexts/language-context.tsx` | **Nuevo** — Context, Provider, hook |
| `data/translations.ts` | **Nuevo** — Objeto con todos los textos |
| `components/language-toggle.tsx` | **Nuevo** — Botón ES / EN |

---

## Notas y decisiones

- **SSR-safe**: el default inicial es `'es'` en el servidor; el `useEffect` corrige al idioma real en el cliente (evita hidration mismatch).
- **Sin parpadeo**: el cambio ocurre en el mismo render, no requiere recarga.
- **Sin librería extra**: no se instala `next-intl`, `i18next` ni nada externo. Cero dependencias nuevas.
- **Extensible**: añadir más idiomas es editar `translations.ts` y el toggle.
- **`suppressHydrationWarning`** ya está en el `<html>` del layout, así que no hay problema con el mismatch de `lang`.