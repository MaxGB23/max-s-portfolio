"use client";

import { useRef } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";

interface Product {
  name: string;
  description: string;
  features: string[];
  tag: string;
}

const products: Product[] = [
  {
    name: "UI Kit Pro",
    description:
      "A comprehensive Figma & React component library built for speed - covering every pattern you need to ship a polished product.",
    features: [
      "200+ production-ready React components",
      "Full Figma source files included",
      "Storybook documentation & live preview",
    ],
    tag: "Design System",
  },
  {
    name: "Motion Studio",
    description:
      "Plug-and-play Framer Motion presets and animation hooks that bring your interfaces to life without sacrificing performance.",
    features: [
      "50+ pre-built animation variants",
      "Custom React hooks for scroll & hover",
      "Zero-dependency, tree-shakable bundle",
    ],
    tag: "Animation",
  },
  {
    name: "Deploy Blueprint",
    description:
      "A Next.js starter template with auth, database, payments, and CI/CD pre-wired so you can go from idea to production in hours.",
    features: [
      "Next.js 16 + Tailwind + Supabase auth",
      "Stripe payments integrated out of the box",
      "GitHub Actions CI/CD pipeline included",
    ],
    tag: "Starter Template",
  },
];

function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLElement>(null);

  // GSAP hover micro-interaction - lift + shadow.
  const handleMouseEnter = async () => {
    const { gsap } = await import("gsap");
    gsap.to(cardRef.current, {
      y: -7,
      boxShadow: "0 20px 40px -12px rgba(0,0,0,0.13)",
      duration: 0.28,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = async () => {
    const { gsap } = await import("gsap");
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: "0 0px 0px 0px rgba(0,0,0,0)",
      duration: 0.28,
      ease: "power2.out",
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="product-card group relative flex flex-col bg-card border border-border rounded-2xl p-7 cursor-pointer will-change-transform"
      aria-label={product.name}
    >
      {/* Tag */}
      <span
        className="self-start px-3 py-1 rounded-full text-xs font-medium mb-5"
        style={{
          backgroundColor: "var(--accent-purple-light)",
          color: "var(--accent-purple)",
        }}
      >
        {product.tag}
      </span>

      {/* Name */}
      <h3 className="font-serif font-bold text-xl text-foreground mb-2 text-balance">
        {product.name}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground mb-6 flex-1">
        {product.description}
      </p>

      {/* Feature list */}
      <ul className="space-y-2.5 mb-7" aria-label={`${product.name} features`}>
        {product.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--accent-purple)" }}
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className="mt-auto inline-flex items-center justify-between w-full px-5 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary hover:border-[var(--accent-purple)] transition-colors duration-200"
        aria-label={`Saber más sobre ${product.name}`}
      >
        Saber más
        <ArrowUpRight size={16} style={{ color: "var(--accent-purple)" }} aria-hidden="true" />
      </button>
    </article>
  );
}

export function ProductsSection() {
  // ScrollTrigger: stagger cards as section enters viewport (80% start).
  const sectionRef = useGsapAnimation<HTMLElement>((gsap, ScrollTrigger) => {
    gsap.from(".product-card", {
      opacity: 0,
      y: 36,
      duration: 0.65,
      ease: "power2.out",
      stagger: 0.14,
      scrollTrigger: {
        trigger: ".products-grid",
        start: "top 80%",
        once: true,
      },
    });

    gsap.from(".products-header", {
      opacity: 0,
      y: 24,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".products-header",
        start: "top 85%",
        once: true,
      },
    });
  });

  return (
    <section
      id="productos"
      ref={sectionRef}
      aria-labelledby="products-heading"
      className="py-24 md:py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <header className="products-header text-center mb-16">
          <span
            className="inline-block text-xs uppercase tracking-[0.2em] font-medium mb-4"
            style={{ color: "var(--accent-purple)" }}
          >
            Lo que construyo
          </span>
          <h2
            id="products-heading"
            className="font-serif font-black text-4xl md:text-5xl text-foreground text-balance"
          >
            Productos y Herramientas
          </h2>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
            Productos digitales cuidadosamente elaborados para ayudar a desarrolladores y diseñadores a construir más rápido
            y lanzar con confianza.
          </p>
        </header>

        {/* Cards grid */}
        <div className="products-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
