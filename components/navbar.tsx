"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollToAnchor, useScrollToTop } from "@/hooks/use-lenis";
import { useActiveSection } from "@/hooks/use-active-section";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/contexts/language-context";
// import { DarkModeToggle } from "@/components/dark-mode-toggle";

const navLinks = [
  { key: "nav.home", href: "/" },
  { key: "nav.about", href: "#sobre-mi" },
  { key: "nav.projects", href: "#proyectos" },
  { key: "nav.pricing", href: "#precios" },
] as const;

// Secciones del scroll-spy en orden documental (D2): se observan TODAS las
// secciones de la home, incluida la hero. `#inicio` limpia el estado (arriba
// no hay link activo). `all-projects` enciende "Proyectos" vía SECTION_ALIAS
// (decisión del usuario: es la misma sección conceptualmente); los ids sin
// link ni alias (contacto, footer) no encienden ningún link.
// Referencia estable (módulo): si cambia, el hook re-observa.
const spySections = [
  "inicio",
  "sobre-mi",
  "proyectos",
  "all-projects",
  "precios",
  "contacto",
  "footer",
] as const;

// Sección activa → link que debe encenderse (alias del scroll-spy).
const SECTION_ALIAS: Record<string, string> = { "all-projects": "proyectos" };

const SCROLL_THRESHOLD = 8; // px mínimos de delta para disparar cambio de visibilidad

export function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  // Link bajo el puntero (D10): el underline es de canal único — al hacer
  // hover en OTRO link el activo se colapsa y el hover toma el canal.
  const [hovered, setHovered] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const scrollToAnchor = useScrollToAnchor(64); // compensa la altura del navbar
  const scrollToTop = useScrollToTop();
  // Estado compartido desktop + mobile: mismo spy, mismo underline (D3).
  const activeSection = useActiveSection(spySections);

  // Un link está activo si su href ancla coincide con la sección activa
  // (directa o vía SECTION_ALIAS). El link "Inicio" ("/") nunca coincide:
  // la hero limpia el estado (D2).
  const isActiveLink = (href: string) => {
    if (!href.startsWith("#")) return false;
    const id = href.slice(1);
    if (activeSection === id) return true;
    return activeSection != null && SECTION_ALIAS[activeSection] === id;
  };

  // Underline de CANAL ÚNICO (D10, revisión 2026-10-01) — desktop y mobile
  // comparten la misma línea: activa = «estás aquí», hover = «puedes ir
  // aquí», nunca ambas a la vez. Al hacer hover en OTRO link el activo se
  // colapsa (w-0, 200ms) y el hover toma el canal al 100%. Handoff
  // SECUENCIAL al retirar el puntero: el activo espera (delay 200ms, a la
  // par de que la línea hover termina de colapsar) y crece LENTO (400ms) —
  // nunca hay dos líneas ni el rebote rápido que se percibía. Hover sobre
  // el propio activo no cambia nada (hovered === own → w-full, sin flicker
  // — D1). Grosor único h-px y bg-purple-accent al 100% en ambas ramas:
  // se retiran el /60 y el 1.5px del activo (D7 queda superseded).
  const underlineClass = (active: boolean, own: string) => {
    const hoveredOther = hovered !== null && hovered !== own;
    return cn(
      "absolute -bottom-0.5 left-0 h-px bg-purple-accent transition-[width] duration-200",
      active
        ? hoveredOther
          ? "w-0"
          : "w-full delay-[200ms] duration-[400ms]"
        : "w-0 group-hover:w-full"
    );
  };

  // El menú mobile se desmonta al cerrarse: el mouseleave del link no llega,
  // así que se limpia `hovered` al cerrar para no dejar el underline activo
  // colapsado por un hover fantasma (D10).
  useEffect(() => {
    if (!mobileOpen) setHovered(null);
  }, [mobileOpen]);

  // Cerrar el menú al hacer clic o tocar fuera del Navbar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileOpen]);

  // Scroll: fondo (desktop) + auto-hide/show (mobile)
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      // Fondo en desktop
      setScrolled(currentY > 20);

      // Siempre visible en el top de la página
      if (currentY === 0) {
        setVisible(true);
        lastY = currentY;
        return;
      }

      // Solo reaccionar si el movimiento supera el threshold
      if (Math.abs(delta) > SCROLL_THRESHOLD) {
        setVisible(delta < 0); // subir → visible, bajar → oculto
        lastY = currentY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Si el menú mobile está abierto, el navbar nunca se oculta
  const effectivelyVisible = mobileOpen ? true : visible;

  // Fondo desktop: condicional por scroll o menú abierto
  const isBgActive = scrolled || mobileOpen;

  // Intercepta clicks en anchors para scrollear con Lenis (desktop).
  // Devuelve false si el link no es un anchor manejable (navegación normal de Next).
  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("#") || !document.getElementById(href.slice(1))) return;
    e.preventDefault();
    // Cerrar el menú ANTES de scrollear: en Android real, iniciar el smooth
    // scroll en el mismo frame que el exit (height:0) del menú móvil lo
    // cancela y el link parece muerto. Tras el cierre commiteado (doble rAF)
    // el scroll arranca contra layout estable.
    setMobileOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToAnchor(href));
    });
  };

  // Híbrido para "Inicio" (/): si ya estamos en la home, hace scroll al top
  // (sin recargar); si estamos en otra página, deja la navegación normal de Next.
  const handleHomeClick = (e: React.MouseEvent, href: string) => {
    const isHome = window.location.pathname === "/";
    if (href === "/" && isHome) {
      e.preventDefault();
      scrollToTop();
      setMobileOpen(false);
    }
  };

  return (
    <motion.header
      ref={navRef}
      // Entrada inicial (reemplaza useGsapAnimation para evitar conflicto en Y)
      initial={{ y: -24, opacity: 0 }}
      animate={{
        // En mobile: ocultar/mostrar según scroll
        // En desktop: siempre visible (y: 0)
        // Framer Motion no tiene media queries, así que manejamos
        // la visibilidad vía translateY en TODOS los breakpoints,
        // pero solo tiene efecto visual en mobile (el desktop no scrollea en esa dirección relevante)
        y: effectivelyVisible ? 0 : "-110%",
        opacity: effectivelyVisible ? 1 : 1, // mantener opacidad, solo mover Y
      }}
      transition={{
        // Primera renderización: animación de entrada
        y: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.45, ease: "easeOut" },
      }}
      className={cn(
        "debug-l1 fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        // Mobile y desktop: fondo condicional — transparente al top, activo al scrollear
        isBgActive
          ? "bg-nav backdrop-blur-none md:backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent backdrop-blur-none border-transparent shadow-none"
      )}
    >
      <nav
        className="debug-l2 max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label={t("nav.aria.main")}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => handleHomeClick(e, "/")}
          className="flex items-center gap-3 group"
          aria-label={t("nav.home")}
        >
          <div className="relative flex lg:size-2.5 size-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full lg:size-2 size-1.5 bg-emerald-500"></span>
          </div>
          <span className="hidden lg:block font-sans font-medium text-sm lg:text-base tracking-wider text-foreground">
            {t("nav.available")}
          </span>
          <span className="lg:hidden font-sans font-medium text-sm md:text-base tracking-wider text-foreground">
            {t("nav.available.short")}
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden nav:flex items-center gap-8" aria-label={t("nav.aria.sections")}>
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  handleAnchorClick(e, link.href);
                  handleHomeClick(e, link.href);
                }}
                onMouseEnter={() => setHovered(link.href)}
                onMouseLeave={() => setHovered((h) => (h === link.href ? null : h))}
                className="text-base font-medium transition-colors duration-100 relative group"
              >
                {t(link.key)}
                <span className={underlineClass(active, link.href)} />
              </Link>
            );
          })}
        </nav>

        {/* Right side: dark mode (hidden) + language + contact */}
        <div className="hidden nav:flex items-center gap-3">
          {/* <DarkModeToggle /> */}
          <LanguageToggle />
          <Button asChild variant="primary" shape="pill" size="sm">
            <Link
              href="#contacto"
              onClick={(e) => handleAnchorClick(e, "#contacto")}
            >
              {t("nav.contact")}
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex nav:hidden items-center gap-2">
          {/* <DarkModeToggle /> */}
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? t("nav.aria.closeMenu") : t("nav.aria.openMenu")}
            className="p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu - Framer AnimatePresence para height/opacity */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className="nav:hidden overflow-hidden border-t border-border/50 bg-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="debug-l2 max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => {
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => {
                      handleAnchorClick(e, link.href);
                      handleHomeClick(e, link.href);
                    }}
                    onMouseEnter={() => setHovered(link.href)}
                    onMouseLeave={() => setHovered((h) => (h === link.href ? null : h))}
                    className="group text-base pl-5 py-2.5 text-foreground font-medium hover:text-foreground transition-colors"
                  >
                    {/* Wrapper que abraza SOLO el label: es el contexto de
                        posicionamiento del underline, así el marker cae en el
                        eje 44px (px-6 + pl-5) con el ancho del texto — mismo
                        lenguaje visual que desktop (D3). `py-2.5` amplía el
                        target táctil a 44px (Apple HIG); con `gap-3` el ritmo
                        texto-a-texto queda en 56px = el `gap-8` histórico. */}
                    <span className="relative inline-block">
                      {t(link.key)}
                      <span className={underlineClass(active, link.href)} />
                    </span>
                  </Link>
                );
              })}
              <Button
                asChild
                variant="primary"
                shape="pill"
                size="sm"
                fullWidth
                className="py-2.5 mt-7"
              >
                <Link
                  href="#contacto"
                  onClick={(e) => handleAnchorClick(e, "#contacto")}
                >
                  {t("nav.contact")}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
