"use client";

import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion-primitives";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/MaxGB23", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/maxballesteros", icon: Linkedin },
];

export function Footer() {
  return (
    <footer
      id="footer"
      className="debug-l1 border-t border-border bg-background/50 backdrop-blur-md pt-16 pb-8 px-6 mt-20 relative overflow-hidden"
    >
      {/* Background Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-accent-purple/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="debug-l2 max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Footer Navigation Columns */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-border/60">
            
            {/* Col 1: Branding & Bio */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl text-foreground">
                  MaxGB<span className="text-purple-accent">23</span>
                </span>                
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded border border-border">
                  Dev
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                FullStack Developer enfocado en construir experiencias web accesibles, rápidas y visualmente deslumbrantes.
              </p>
            </div>

            {/* Col 2: Social Icons */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Redes sociales</h3>
              <nav aria-label="Social media links" className="flex items-center gap-3 pt-1">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-purple-accent transition-colors duration-200"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

          </div>
        </FadeIn>

        {/* Bottom Bar: Copyright & Live Time */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} MaxGB23. Todos los derechos reservados.
            </div>
          </div>
        </FadeIn>

      </div>
    </footer>
  );
}


