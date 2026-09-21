const es = {
  // Navbar
  'nav.available': 'Disponible para trabajo remoto',
  'nav.available.short': 'Disponible en remoto',
  'nav.home': 'Inicio',
  'nav.about': 'Sobre mí',
  'nav.projects': 'Proyectos',
  'nav.pricing': 'Precios',
  'nav.contact': 'Contacto',
  'nav.aria.openMenu': 'Abrir menú',
  'nav.aria.closeMenu': 'Cerrar menú',
  'nav.aria.main': 'Navegación principal',
  'nav.aria.sections': 'Secciones del sitio',

  // Hero
  'hero.greeting': 'Hola, soy Max',
  'hero.role': 'Full Stack Developer',
  'hero.description': 'Desarrollo aplicaciones web rápidas y escalables con Next.js y React, cuidando el rendimiento, la experiencia de usuario y calidad del código.',
  'hero.cta': 'Ver proyectos',
  'hero.cta.projects': 'Ver Proyectos',
  'hero.cta.cv': 'Descargar CV',
  'hero.contact': 'Contacto',
  'hero.stack': 'Stack Principal',
  'hero.scroll': 'Deslizar',
  'hero.aria.intro': 'Introducción',
} as const;

// Claves tipadas: t('nav.abut') NO compila
export type TranslationKey = keyof typeof es;

const en = {
  'nav.available': 'Available for remote work',
  'nav.available.short': 'Available remotely',
  'nav.home': 'Home',
  'nav.about': 'About me',
  'nav.projects': 'Projects',
  'nav.pricing': 'Pricing',
  'nav.contact': 'Contact',
  'nav.aria.openMenu': 'Open menu',
  'nav.aria.closeMenu': 'Close menu',
  'nav.aria.main': 'Main navigation',
  'nav.aria.sections': 'Site sections',

  'hero.greeting': "Hi, I'm Max",
  'hero.role': 'Full Stack Developer',
  'hero.description': 'I build fast, scalable web applications with Next.js and React, caring about performance, user experience and code quality.',
  'hero.cta': 'View projects',
  'hero.cta.projects': 'View Projects',
  'hero.cta.cv': 'Download CV',
  'hero.contact': 'Contact',
  'hero.stack': 'Main Stack',
  'hero.scroll': 'Scroll',
  'hero.aria.intro': 'Introduction',
} as const satisfies Record<TranslationKey, string>;

export const translations = { es, en } as const;

export type Lang = keyof typeof translations;