// Navbar active-state audit: desktop scroll-spy + mobile menu geometry.
// Usage: node scripts/navbar-active.mjs [--url http://localhost:<port>]
//
// Asserts (feature navbar-active-state, T5):
//   (a) top/hero -> NO desktop link has aria-current (hero clears the state)
//   (b) scrolling to each linked section -> exactly that desktop link has
//       aria-current="page" and an underline with width > 0 while the others
//       are 0; hovering the active link keeps the underline (D1: no flicker);
//       back to top -> the hero clears again
//   (c) 390px, menu open -> link label axis = 44px, CTA label = 44px, CTA
//       spans the full content width, gap links->CTA ~ 40px vs 24px between
//       links; the open menu mirrors the same active state (T3)
//   (d) hovering an INACTIVE desktop link: exactly ONE underline (hover takes
//       the single channel at full strength and the active line collapses —
//       D10); aria-current persists on the active link; pointer away restores
//       the active line
//   (e) 768x1024 portrait, menu tap -> animated anchor landing: exactly the
//       TAPPED section is active (regression: the batch-local tie-break let
//       the next section override while both shared the band - About is
//       short at md and Projects pokes into it on that viewport)
import { chromium } from "playwright";
import { resolveBase } from "./audit-base.mjs";

const BASE = await resolveBase("navbar-active");

const failures = [];
function check(ok, label, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"} ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});

// ---------------------------------------------------------------- desktop ---
console.log("\n==== desktop 1280x800 - scroll-spy ====");
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // GSAP settle (same as section-spacing.mjs)

  // Desktop links = inner <nav> of the header (scoped: hero also links to
  // #proyectos and the contact pill to #contacto, both OUTSIDE this nav).
  const links = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("header nav nav a")].map((a) => {
        const u = a.querySelector("span");
        return {
          href: a.getAttribute("href"),
          aria: a.getAttribute("aria-current"),
          uw: u ? Math.round(u.getBoundingClientRect().width * 10) / 10 : -1,
        };
      })
    );
  const dump = (s) => JSON.stringify(s.map((l) => `${l.href}:${l.aria ?? "-"}:${l.uw}`));

  // Land with the section straddling the centered band (rootMargin -40%/-40%
  // -> middle 20% of the viewport), the way a user scroll leaves it.
  const centerOn = async (id) => {
    await page.evaluate((sid) => {
      if (sid === "top") {
        window.scrollTo(0, 0);
        return;
      }
      const el = document.getElementById(sid);
      if (!el) throw new Error(`missing #${sid}`);
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top + el.offsetHeight / 2 - window.innerHeight / 2));
    }, id);
    await page.waitForTimeout(700); // IO callback + GSAP/Lenis settle
  };

  let state = await links();
  check(state.length === 4, "desktop renders 4 nav links", `count=${state.length}`);
  check(
    state.every((l) => l.aria === null) && state.every((l) => l.uw === 0),
    "(a) top/hero: no aria-current, no underline",
    dump(state)
  );

  for (const id of ["sobre-mi", "proyectos", "precios"]) {
    await centerOn(id);
    state = await links();
    const active = state.filter((l) => l.aria === "page");
    const target = state.find((l) => l.href === `#${id}`);
    check(
      active.length === 1 && active[0].href === `#${id}`,
      `(b) #${id}: exactly that link has aria-current="page"`,
      dump(state)
    );
    check(
      !!target && target.uw > 0,
      `(b) #${id}: active underline width > 0`,
      `uw=${target ? target.uw : "missing"}`
    );
    check(
      state.filter((l) => l.href !== `#${id}`).every((l) => l.uw === 0),
      `(b) #${id}: other underlines width 0`,
      dump(state)
    );
  }

  // Alias del scroll-spy (decisión del usuario): dentro de #all-projects
  // debe quedar encendido el link "#proyectos" (misma sección conceptual).
  await centerOn("all-projects");
  state = await links();
  const lit = state.filter((l) => l.aria === "page");
  check(
    lit.length === 1 && lit[0].href === "#proyectos",
    "(b) #all-projects: SECTION_ALIAS lights #proyectos",
    dump(state)
  );
  const proj = state.find((l) => l.href === "#proyectos");
  check(
    !!proj && proj.uw > 0,
    "(b) #all-projects: #proyectos underline width > 0",
    `uw=${proj ? proj.uw : "missing"}`
  );

  // Hover sobre el link ACTIVO: el underline no debe parpadear (D1). Saltamos
  // de #precios hacia arriba a #sobre-mi para que el header auto-oculto vuelva
  // a y:0 (hover() necesita el elemento en viewport).
  await centerOn("sobre-mi");
  await page.locator('header nav nav a[href="#sobre-mi"]').hover();
  await page.waitForTimeout(350);
  state = await links();
  const hovered = state.find((l) => l.href === "#sobre-mi");
  check(
    !!hovered && hovered.aria === "page" && hovered.uw > 0,
    "(b) hover over active link keeps aria-current + underline (no flicker)",
    dump(state)
  );
  await page.mouse.move(1270, 780);
  await page.waitForTimeout(350);
  state = await links();
  check(
    state.filter((l) => l.uw > 0).length === 1,
    "(b) pointer away: exactly one underline visible",
    dump(state)
  );

  // D10 (canal unico, revision 2026-10-01): hover sobre un link INACTIVO ->
  // el activo se colapsa (w-0) y el hover toma el canal al 100%; NUNCA dos
  // lineas a la vez (se retira D7 "reduced state"). aria-current permanece
  // en el activo (accesibilidad). Al retirar el puntero se restaura.
  await page.locator('header nav nav a[href="#precios"]').hover();
  await page.waitForTimeout(350); // transition 200ms + margin
  state = await links();
  const hoverCls = await page.evaluate(
    () => document.querySelector('header nav nav a[href="#precios"] span')?.className ?? "missing"
  );
  const activeNow = state.find((l) => l.aria === "page");
  const hoveredNow = state.find((l) => l.href === "#precios");
  check(
    !!activeNow &&
      activeNow.href === "#sobre-mi" &&
      activeNow.uw === 0 &&
      !!hoveredNow &&
      hoveredNow.uw > 0,
    "(d) hover inactive: active collapses (uw=0), hover expands (uw>0), aria-current persists",
    dump(state)
  );
  check(
    state.filter((l) => l.uw > 0).length === 1,
    "(d) exactly ONE underline visible while hovering an inactive link",
    dump(state)
  );
  check(
    hoverCls.includes("bg-purple-accent") &&
      !hoverCls.includes("bg-purple-accent/") &&
      hoverCls.includes("h-px"),
    "(d) hover underline: full-strength purple + h-px (no /60, no 1.5px)",
    hoverCls
  );
  await page.mouse.move(1270, 780);
  // Slow return (D10): the hover line collapses first (200ms); the active
  // line waits for it (delay 200ms) and grows slowly (400ms) — sequential
  // handoff, never two lines. At ~150ms after pointer-away the active must
  // STILL be hidden (old code: already ~75% expanded -> FAIL).
  await page.waitForTimeout(150);
  state = await links();
  const midReturn = state.find((l) => l.href === "#sobre-mi");
  check(
    !!midReturn && midReturn.aria === "page" && midReturn.uw === 0,
    "(d) pointer away: active still hidden during the delay (slow return)",
    dump(state)
  );
  await page.waitForTimeout(400); // total 550ms > delay 200 + grow 400*0.87
  state = await links();
  const restored = state.find((l) => l.href === "#sobre-mi");
  check(
    !!restored &&
      restored.aria === "page" &&
      restored.uw > 0 &&
      state.filter((l) => l.uw > 0).length === 1,
    "(d) pointer away: active underline restored, exactly one line",
    dump(state)
  );

  await centerOn("top");
  state = await links();
  check(
    state.every((l) => l.aria === null) && state.every((l) => l.uw === 0),
    "(a) back to top: hero cleared the state",
    dump(state)
  );

  await page.close();
}

// ----------------------------------------------------------------- mobile ---
console.log("\n==== mobile 390x844 - menu geometry ====");
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  await page.locator('button[aria-controls="mobile-menu"]').click();
  await page.waitForTimeout(500); // height animation (0.28s)

  const geo = await page.evaluate(() => {
    const r1 = (n) => Math.round(n * 10) / 10;
    const container = document.querySelector("#mobile-menu > div");
    if (!container) return null;
    // Button asChild renderiza el <a> del CTA como hijo directo (Slot no crea
    // wrapper): los links de navegación son los <a> SIN data-slot.
    const links = [...container.children].filter(
      (el) => el.tagName === "A" && !el.hasAttribute("data-slot")
    );
    const cta = container.querySelector('[data-slot="button"]');
    // Left edge del label: primer rect de contenido (Range) — excluye bordes
    // y paddings, mide el eje REAL del texto.
    const labelLeft = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0);
      return rects.length ? r1(Math.min(...rects.map((r) => r.left))) : null;
    };
    const labelW = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0);
      if (!rects.length) return null;
      const left = Math.min(...rects.map((r) => r.left));
      const right = Math.max(...rects.map((r) => r.right));
      return r1(right - left);
    };
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r1(r.left), top: r1(r.top), bottom: r1(r.bottom), width: r1(r.width) };
    };
    return {
      links: links.map((a) => ({
        href: a.getAttribute("href"),
        aria: a.getAttribute("aria-current"),
        labelLeft: labelLeft(a),
        box: box(a),
        uw: r1(a.querySelector("span span")?.getBoundingClientRect().width ?? -1),
      })),
      cta: cta
        ? { labelLeft: labelLeft(cta), labelW: labelW(cta), box: box(cta) }
        : null,
    };
  });

  if (!geo) {
    check(false, "mobile menu container found", "missing #mobile-menu > div");
  } else {
    check(geo.links.length === 4, "menu renders 4 nav links", `count=${geo.links.length}`);

    // (c1) eje de alineación: label de cada link a 44px (px-6 + pl-5)
    for (const l of geo.links) {
      check(
        l.labelLeft !== null && Math.abs(l.labelLeft - 44) <= 1,
        `(c) ${l.href} label left = 44px`,
        `measured=${l.labelLeft}`
      );
    }

    // (c2) CTA: label CENTRADO en su caja (decisión revisada: es un button,
    // no un item de la lista — el eje 44px es contrato de la lista de links,
    // el action va centrado como en desktop), ancho completo del contenido.
    if (geo.cta) {
      const labelCenter =
        geo.cta.labelLeft !== null && geo.cta.labelW !== null
          ? geo.cta.labelLeft + geo.cta.labelW / 2
          : null;
      const boxCenter = geo.cta.box.left + geo.cta.box.width / 2;
      check(
        labelCenter !== null && Math.abs(labelCenter - boxCenter) <= 2,
        "(c) CTA label centered in its box",
        `labelCenter=${labelCenter} boxCenter=${Math.round(boxCenter * 10) / 10}`
      );
      const ref = geo.links[0].box;
      check(
        Math.abs(geo.cta.box.width - ref.width) <= 1,
        "(c) CTA spans full content width",
        `cta=${geo.cta.box.width}px link=${ref.width}px`
      );
      check(
        Math.abs(geo.cta.box.left - ref.left) <= 1,
        "(c) CTA box flush with links box",
        `cta.left=${geo.cta.box.left} link.left=${ref.left}`
      );

      // (c3) targets y ritmo: link box = 44px (py-2.5, Apple HIG), gap entre
      // targets = 12px (gap-3 >= 8dp Material) → ritmo texto-a-texto = 56px =
      // idéntico al gap-8 histórico; 40px de separación al CTA (gap-3 + mt-7).
      for (const l of geo.links) {
        const h = l.box.bottom - l.box.top;
        check(
          Math.abs(h - 44) <= 2,
          `(c) ${l.href} target height = 44px`,
          `measured=${r1Print(h)}px`
        );
      }
      for (let i = 0; i < geo.links.length - 1; i++) {
        const gap = geo.links[i + 1].box.top - geo.links[i].box.bottom;
        check(
          Math.abs(gap - 12) <= 2,
          `(c) gap ${geo.links[i].href} -> ${geo.links[i + 1].href} = 12px (gap-3)`,
          `measured=${r1Print(gap)}px`
        );
      }
      const ctaGap = geo.cta.box.top - geo.links[geo.links.length - 1].box.bottom;
      check(
        Math.abs(ctaGap - 40) <= 2,
        "(c) gap last link -> CTA = 40px (gap-3 + mt-7)",
        `measured=${r1Print(ctaGap)}px`
      );
    } else {
      check(false, "(c) CTA button found in menu", "missing [data-slot=button]");
    }

    // (c4) mismo estado que desktop: en la hero, ningún link del menú activo
    check(
      geo.links.every((l) => l.aria === null),
      "(a) menu at top/hero: no aria-current",
      JSON.stringify(geo.links.map((l) => `${l.href}:${l.aria ?? "-"}`))
    );
  }

  // (c5) scroll con el menú abierto: mismo estado activo + marker en el eje 44
  await page.evaluate(() => {
    const el = document.getElementById("sobre-mi");
    if (!el) throw new Error("missing #sobre-mi");
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.round(top + el.offsetHeight / 2 - window.innerHeight / 2));
  });
  await page.waitForTimeout(700);

  const menuState = await page.evaluate(() => {
    const r1 = (n) => Math.round(n * 10) / 10;
    const container = document.querySelector("#mobile-menu > div");
    const links = container
      ? [...container.children].filter(
          (el) => el.tagName === "A" && !el.hasAttribute("data-slot")
        )
      : [];
    return links.map((a) => {
      const u = a.querySelector("span span");
      const r = u?.getBoundingClientRect();
      return {
        href: a.getAttribute("href"),
        aria: a.getAttribute("aria-current"),
        uw: r ? r1(r.width) : -1,
        uLeft: r ? r1(r.left) : -1,
      };
    });
  });
  const dumpMenu = (s) => JSON.stringify(s.map((l) => `${l.href}:${l.aria ?? "-"}:${l.uw}@${l.uLeft}`));
  const activeMenu = menuState.filter((l) => l.aria === "page");
  check(
    activeMenu.length === 1 && activeMenu[0].href === "#sobre-mi",
    "(c) menu open + scrolled: same active state (aria-current)",
    dumpMenu(menuState)
  );
  const activeLink = menuState.find((l) => l.href === "#sobre-mi");
  check(
    !!activeLink && activeLink.uw > 0,
    "(c) menu active underline width > 0",
    `uw=${activeLink ? activeLink.uw : "missing"}`
  );
  check(
    !!activeLink && Math.abs(activeLink.uLeft - 44) <= 1,
    "(c) menu active marker inside the 44px axis",
    `uLeft=${activeLink ? activeLink.uLeft : "missing"}`
  );
  check(
    menuState.filter((l) => l.href !== "#sobre-mi").every((l) => l.uw === 0),
    "(c) menu other underlines width 0",
    dumpMenu(menuState)
  );

  await page.close();
}

// --------------------------------------------------------------- tablet ---
console.log("\n==== tablet 768x1024 portrait - anchor landing spy ====");
{
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Reproduce el flujo real del usuario (el reporte del iPad Mini portrait):
  // tap en la hamburguesa -> tap en un link de seccion. centerOn() saltaria
  // INSTANTANEAMENTE (todos los targets cambian en UN solo batch y el
  // tie-break local gana bien); el tap de ancla scrollea ANIMADO (Lenis 1.4s
  // a 768px) y entrega las secciones en batches SUCESIVOS: About entra,
  // luego Projects entra mientras About sigue en la banda y lo pisa. Con
  // About corto a 2 columnas (md) Projects mete el top en la banda a este
  // viewport (banda 409..819, top Projects ~552).
  const tapAndAssert = async (href) => {
    await page.locator('button[aria-controls="mobile-menu"]').click();
    await page.waitForTimeout(500); // menu height animation (0.28s) + double rAF
    await page.locator(`#mobile-menu a[href="${href}"]`).click();
    // menu close (0.28s) + double rAF + Lenis scroll (1.4s) + IO settle
    await page.waitForTimeout(2400);

    // El auto-hide del navbar lo saco del viewport durante el scroll hacia
    // abajo (mismo caso real: el usuario hace swipe hacia arriba para
    // recuperarlo): pequeno scroll up -> header visible -> hamburguesa clic.
    await page.evaluate(() => window.scrollBy(0, -32));
    await page.waitForTimeout(500); // header y transition (0.35s)

    // El menu se cerro tras el tap; reabrir para leer el estado renderizado.
    await page.locator('button[aria-controls="mobile-menu"]').click();
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      const container = document.querySelector("#mobile-menu > div");
      const links = container
        ? [...container.children].filter(
            (el) => el.tagName === "A" && !el.hasAttribute("data-slot")
          )
        : [];
      return links.map((a) => ({
        href: a.getAttribute("href"),
        aria: a.getAttribute("aria-current"),
      }));
    });
    const dump = JSON.stringify(state.map((l) => `${l.href}:${l.aria ?? "-"}`));
    const active = state.filter((l) => l.aria === "page");
    check(
      active.length === 1 && active[0].href === href,
      `(e) tap ${href}: exactly that menu link has aria-current (animated landing)`,
      dump
    );

    // Cerrar el menu para la siguiente ronda.
    await page.locator('button[aria-controls="mobile-menu"]').click();
    await page.waitForTimeout(400);
  };

  await tapAndAssert("#sobre-mi");
  await tapAndAssert("#proyectos");

  await page.close();
}

function r1Print(n) {
  return Math.round(n * 10) / 10;
}

await browser.close();

if (failures.length) {
  console.error(`\nNAVBAR-ACTIVE FAIL [${failures.length}] - aserciones fallidas:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exitCode = 1;
} else {
  console.log("\nNAVBAR-ACTIVE OK - spy de seccion + geometria del menu mobile dentro de contrato.");
}
