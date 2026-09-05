"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollToAnchor, useScrollToTop } from "@/hooks/use-lenis";
import { Button } from "@/components/ui/button";
// import { DarkModeToggle } from "@/components/dark-mode-toggle";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Precios", href: "#precios" },
];

const SCROLL_THRESHOLD = 8; // px mínimos de delta para disparar cambio de visibilidad

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);
  const scrollToAnchor = useScrollToAnchor(64); // compensa la altura del navbar
  const scrollToTop = useScrollToTop();

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
    if (scrollToAnchor(href)) {
      e.preventDefault();
      setMobileOpen(false);
    }
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
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        // Mobile y desktop: fondo condicional — transparente al top, activo al scrollear
        isBgActive
          ? "bg-nav backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent backdrop-blur-none border-transparent shadow-none"
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => handleHomeClick(e, "/")}
          className="flex items-center gap-3 group"
          aria-label="Inicio"
        >
          <div className="relative flex lg:size-2.5 size-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full lg:size-2 size-1.5 bg-emerald-500"></span>
          </div>
          <span className="hidden lg:block font-sans font-medium text-sm lg:text-base tracking-wider text-foreground">
            Disponible para trabajo remoto
          </span>
          <span className="lg:hidden font-sans font-medium text-sm md:text-base tracking-wider text-foreground">
            Disponible en remoto
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Site sections">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => {
                handleAnchorClick(e, link.href);
                handleHomeClick(e, link.href);
              }}
              className="text-base font-medium transition-colors duration-100 relative group"
            >
              {link.label}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-200 bg-purple-accent"
              />
            </Link>
          ))}
        </nav>

        {/* Right side: dark mode (hidden) + contact */}
        <div className="hidden md:flex items-center gap-3">
          {/* <DarkModeToggle /> */}
          <Button asChild variant="primary" shape="pill" size="sm">
            <Link
              href="#contacto"
              onClick={(e) => handleAnchorClick(e, "#contacto")}
            >
              Contacto
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {/* <DarkModeToggle /> */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
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
            className="md:hidden overflow-hidden border-t border-border/50"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    handleAnchorClick(e, link.href);
                    handleHomeClick(e, link.href);
                  }}
                  className="text-base pl-5 text-foreground font-medium hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                variant="primary"
                shape="pill"
                size="sm"
                fullWidth
                className="py-2.5"
              >
                <Link
                  href="#contacto"
                  onClick={(e) => handleAnchorClick(e, "#contacto")}
                >
                  Contacto
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
