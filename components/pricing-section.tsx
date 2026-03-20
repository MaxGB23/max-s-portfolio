"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Basic",
    price: "$29",
    period: "/ mes",
    description: "Perfecto para desarrolladores independientes y freelancers que están comenzando.",
    features: [
      "Acceso al UI Kit (50 componentes)",
      "Soporte en la comunidad de Discord",
      "Actualizaciones mensuales",
      "Licencia personal",
    ],
    cta: "Empezar",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/ mes",
    description: "Para constructores serios que necesitan el conjunto completo de herramientas y soporte prioritario.",
    features: [
      "UI Kit completo (200+ componentes)",
      "Animaciones de Motion Studio incluidas",
      "Soporte prioritario por email y chat",
      "Acceso a archivos fuente de Figma",
      "Licencia comercial",
    ],
    cta: "Iniciar Prueba Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$199",
    period: "/ mes",
    description: "Acceso de nivel empresarial con soporte dedicado y trabajo personalizado.",
    features: [
      "Todo lo de Pro",
      "Kit de inicio Deploy Blueprint",
      "Llamada de incorporación 1 a 1 (mensual)",
      "Solicitudes de componentes personalizados",
      "Asientos de equipo ilimitados",
      "Licencia de marca blanca",
    ],
    cta: "Contactar por Premium",
    highlighted: false,
  },
];

function PricingCard({ tier }: { tier: PricingTier }) {
  const cardRef = useRef<HTMLElement>(null);

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
          Most Popular
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
            "text-sm leading-relaxed",
            tier.highlighted ? "text-white/75" : "text-muted-foreground"
          )}
        >
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-7 flex items-end gap-1">
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

      {/* Feature list */}
      <ul className="space-y-3 mb-8 flex-1" aria-label={`${tier.name} plan features`}>
        {tier.features.map((feature) => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-2.5 text-sm",
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
        <header className="pricing-header text-center mb-16">
          <span
            className="inline-block text-xs uppercase tracking-[0.2em] font-medium mb-4 text-purple-accent"
          >
            Precios
          </span>
          <h2
            id="pricing-heading"
            className="font-serif font-black text-4xl md:text-5xl text-foreground text-balance"
          >
            Planes simples y transparentes
          </h2>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
            Sin cargos ocultos. Cancela en cualquier momento. Elige el plan que se adapte a tu flujo de trabajo y escala
            a medida que creces.
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
          Todos los planes incluyen una prueba gratuita de 14 días. No se requiere tarjeta de crédito para comenzar.
        </p>

      </div>
    </section>
  );
}
