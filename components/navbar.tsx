"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "#productos" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Precios", href: "#precios" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // GSAP entrance: fade + slide down on load.
  const navRef = useGsapAnimation<HTMLElement>((gsap) => {
    gsap.from(navRef.current, {
      y: -24,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      clearProps: "all",
    });
  });

  // Scroll-driven background state.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-[var(--nav-bg)] backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Funko - Inicio"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-border transition-all duration-200 group-hover:ring-[var(--accent-purple)]">
            <Image
              src="/images/avatar.jpg"
              alt="Funko avatar"
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <span className="font-serif font-semibold text-sm tracking-tight text-foreground hidden sm:block">
            Funko
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Site sections">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
            >
              {link.label}
              {/* Underline - CSS transition, no library overhead needed here */}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-200"
                style={{ backgroundColor: "var(--accent-purple)" }}
              />
            </Link>
          ))}
        </nav>

        {/* Right side: dark mode + contact */}
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          <Link
            href="#contacto"
            className="inline-flex items-center px-5 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity duration-200"
          >
            Contacto
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <DarkModeToggle />
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

      {/* Mobile menu - Framer AnimatePresence for height/opacity */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden bg-[var(--nav-bg)] backdrop-blur-md border-b border-border overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="#contacto"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity w-full"
              >
                Contacto
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
