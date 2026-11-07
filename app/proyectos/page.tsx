import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ScrollProgress } from "@/components/scroll-progress";
import { Navbar } from "@/components/navbar";
import { ProjectsCatalog } from "@/components/projects-catalog";
import { Footer } from "@/components/footer";
import { translations, type Lang } from "@/data/translations";

// El catalogo es un INDICE, no una superficie de lectura: monta la navbar y el
// footer, a diferencia de `/proyectos/[id]`, que esconde el chrome (S5/D10).
// Sin navbar el catalogo queda sin menu -en movil el menu vive solo ahi- y sin
// acceso a Precios o Contacto salvo scrolleando hasta el footer.
export async function generateMetadata(): Promise<Metadata> {
  // Server-side language resolution, mismo patron que `/proyectos/[id]`: el
  // cookie es la fuente del layout, asi que la metadata sigue al idioma de la
  // UI.
  const store = await cookies();
  const lang: Lang = store.get("lang")?.value === "en" ? "en" : "es";

  const heading = `${translations[lang]["section.allProjects.title.first"]} ${translations[lang]["section.allProjects.title.second"]}`;

  return { title: `${heading} | MaxGB23` };
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <Navbar />
      <ProjectsCatalog />
      <Footer />
    </main>
  );
}
