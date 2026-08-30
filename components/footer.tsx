"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion-primitives";

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Twitter / X", href: "https://twitter.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-border py-12 px-6 mt-8"
    >
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Branding */}
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-serif font-bold text-lg text-foreground">Funko</span>
              <span className="text-xs text-muted-foreground">
                Frontend Developer & UI Engineer
              </span>
            </div>

            {/* Contact link */}
            <a
              href="mailto:hello@duncanrobert.dev"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              hello@duncanrobert.dev
            </a>

            {/* Social links */}
            <nav aria-label="Social media links" className="flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.1, borderColor: "var(--accent-purple)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </Link>
                </motion.div>
              ))}
            </nav>

          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MaxGB23. Todos los derechos reservados.
          </p>
        </FadeIn>
      </div>
    </footer>
  );
}
