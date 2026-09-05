"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";
import { useScrollToAnchor } from "@/hooks/use-lenis";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  proof?: string;
}

const tiers: PricingTier[] = [
  {
    name: "Landing Page",
    price: "$6,000",
    period: "MXN · por proyecto",
    description: "Página única que presenta tu negocio y convierte visitas en contactos.",
    features: [
      "Diseño responsivo a medida",
      "SEO básico y velocidad optimizada",
      "Formulario de contacto funcional",
      "Despliegue incluido",
      "Entrega en 1–2 semanas",
    ],
    cta: "Solicitar cotización",
    highlighted: false,
    proof: "Respaldado por: landings de AutoShop, One Click Ti y CAF.",
  },
  {
    name: "Sistema Web a Medida",
    price: "$20,000",
    period: "MXN · por proyecto",
    description: "Plataforma con panel de administración, usuarios y base de datos. Mi especialidad.",
    features: [
      "Panel de administración + PostgreSQL",
      "Autenticación y roles de usuario",
      "Dashboards y reportes",
      "Stack Next.js + TypeScript",
      "Soporte post-entrega incluido",
    ],
    cta: "Cotizar mi proyecto",
    highlighted: true,
    proof: "Respaldado por: CAF en producción y plataforma de Presidencia Municipal.",
  },
  {
    name: "Automatización con IA",
    price: "$25,000",
    period: "MXN · por proyecto",
    description: "Un flujo de tu negocio automatizado con IA, acotado y medible. Sin humo.",
    features: [
      "Piloto acotado: un proceso, un objetivo",
      "Chatbot o integración LLM sobre tus datos",
      "Estimación de costos de tokens incluida",
      "Documentación del piloto entregada",
    ],
    cta: "Agendar llamada",
    highlighted: false,
    proof: "Respaldado por: framework funky-ai (SDD, agentes).",
  },
];

function PricingCard({ tier }: { tier: PricingTier }) {
  const cardRef = useRef<HTMLElement>(null);
  const scrollToAnchor = useScrollToAnchor(64);

  // GSAP hover micro-interaction.
  const handleMouseEnter = async () => {
    const { gsap } = await import("gsap");
    gsap.to(cardRef.current, {
      y: tier.highlighted ? -5 : -7,
      scale: tier.highlighted ? 1.015 : 1.0,
      boxShadow: tier.highlighted
        ? "0 24px 48px -10px rgba(0,0,0,0.22)"
        : "0 16px 36px -10px rgba(0,0,0,0.11)",
      duration: 0.28,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = async () => {
    const { gsap } = await import("gsap");
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
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
      className={cn(
        "pricing-card relative flex flex-col rounded-2xl p-8 border cursor-pointer will-change-transform",
        tier.highlighted
          ? "border-purple-accent shadow-2xl"
          : "border-border bg-card"
      )}
      style={tier.highlighted ? { backgroundColor: "var(--accent-purple)" } : {}}
      aria-label={`${tier.name} plan`}
    >
      {/* Popular badge */}
      {tier.highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-foreground text-background text-xs font-semibold rounded-full shadow whitespace-nowrap">
          Más popular
        </span>
      )}

      {/* Plan name + description */}
      <div className="mb-6">
        <h3
          className={cn(
            "font-serif font-bold text-xl mb-1",
            tier.highlighted ? "text-white" : "text-foreground"
          )}
        >
          {tier.name}
        </h3>
        <p
          className={cn(
            "text-base leading-relaxed",
            tier.highlighted ? "text-white/75" : "text-muted-foreground"
          )}
        >
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-7">
        <span
          className={cn(
            "block text-xs font-medium uppercase tracking-widest mb-1",
            tier.highlighted ? "text-white/70" : "text-muted-foreground"
          )}
        >
          desde
        </span>
        <div className="flex items-end gap-1">
          <span
            className={cn(
              "font-serif font-black text-5xl leading-none",
              tier.highlighted ? "text-white" : "text-foreground"
            )}
          >
            {tier.price}
          </span>
          <span
            className={cn(
              "text-sm mb-1.5",
              tier.highlighted ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {tier.period}
          </span>
        </div>
      </div>

      {/* Feature list */}
      <ul className="space-y-3 mb-8 flex-1" aria-label={`${tier.name} plan features`}>
        {tier.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-2.5 text-base",
              tier.highlighted ? "text-white" : "text-foreground"
            )}
          >
            <Check
              size={15}
              className={cn("mt-0.5 shrink-0", tier.highlighted ? "text-white" : "text-purple-accent")}
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => scrollToAnchor("#contacto")}
        className={cn(
          "w-full py-3.5 rounded-xl text-sm font-semibold transition-colors duration-200",
          tier.highlighted
            ? "bg-white text-purple-accent hover:bg-white/90 shadow-md"
            : "border border-border text-foreground hover:bg-secondary"
        )}
        aria-label={`${tier.cta} - ${tier.name} plan`}
      >
        {tier.cta}
      </button>

      {/* Proof line */}
      {tier.proof && (
        <p
          className={cn(
            "mt-4 text-xs leading-relaxed",
            tier.highlighted ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {tier.proof}
        </p>
      )}
    </article>
  );
}

export function PricingSection() {
  // ScrollTrigger: stagger cards. Pro card gets a slight extra delay for emphasis.
  const sectionRef = useGsapAnimation<HTMLElement>((gsap, ScrollTrigger) => {
    gsap.from(".pricing-header", {
      opacity: 0,
      y: 24,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".pricing-header",
        start: "top 85%",
        once: true,
      },
    });

    // Animate non-highlighted cards first, then Pro card with a slight extra delay.
    gsap.from(".pricing-card:not(.pricing-highlighted)", {
      opacity: 0,
      y: 32,
      scale: 0.97,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.14,
      scrollTrigger: {
        trigger: ".pricing-grid",
        start: "top 80%",
        once: true,
      },
    });

    gsap.from(".pricing-highlighted", {
      opacity: 0,
      y: 32,
      scale: 0.95,
      duration: 0.65,
      ease: "power2.out",
      delay: 0.22,
      scrollTrigger: {
        trigger: ".pricing-grid",
        start: "top 80%",
        once: true,
      },
    });
  });

  return (
    <section
      id="precios"
      ref={sectionRef}
      aria-labelledby="pricing-heading"
      className="py-24 md:py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <header className="pricing-header flex flex-col items-center text-center mb-16">
          <h2 id="pricing-heading" className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground mb-5">
            <span>Servicios</span>
            <span className="text-purple-accent brightness-110">a medida</span>
          </h2>
          <p className="text-fluid-body text-muted-foreground max-w-lg lg:max-w-xl 2xl mx-auto leading-relaxed">
            Precios base por proyecto en MXN. Cada proyecto se cotiza según alcance — sin letras chicas.
          </p>
        </header>

        {/* Cards grid */}
        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => (
            <div key={tier.name} className={tier.highlighted ? "pricing-highlighted" : ""}>
              <PricingCard tier={tier} />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Precios base de referencia. La cotización final depende del alcance. Escríbeme y respondo en 24–48 h.
        </p>

      </div>
    </section>
  );
}
