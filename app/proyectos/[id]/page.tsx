import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLang } from "@/lib/lang";
import { projects, getProjectById, localizeProject } from "@/data/projects";
import { formatDownloads, sumDownloads } from "@/lib/live-metrics";
import { ProjectDetail } from "@/components/project-detail";
import { ScrollProgress } from "@/components/scroll-progress";
import { translations } from "@/data/translations";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  // The same resolver the root layout uses, so metadata can never disagree
  // with the UI language. This used to read only the cookie while the layout
  // also honored Accept-Language.
  const lang = await resolveLang();

  if (!project) {
    return {
      title: translations[lang]["section.projects.notFound"],
    };
  }

  // Server path, SOLO para metadata: la pagina sigue pasando el proyecto CRUD a
  // <ProjectDetail /> porque ese componente es cliente y el toggle de idioma es
  // state de cliente — una ficha localizada aqui quedaria stale al cambiar el
  // idioma. El copy de la metadata si necesita el locale, y `cookies()` ya lo
  // resuelve (misma fuente que el layout).
  const localized = localizeProject(project, lang);

  return {
    title: localized.title,
    description: localized.hook,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  // Una metrica puede venir de varios registries: solo se consultan si el
  // proyecto los declara. La respuesta se cachea 24 h y, si alguna API no
  // responde, la ficha usa la cifra escrita en `data/projects` como respaldo.
  const live = project.liveMetric;
  const downloads = live ? await sumDownloads(live.sources) : null;
  // Un solo reloj por render, resuelto en el servidor y pasado como dato: la
  // ficha cliente no debe calcular el tiempo en produccion con su propio reloj.
  const productionClock = new Date().toISOString();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <ProjectDetail
        project={project}
        productionClock={productionClock}
        liveMetric={
          live && downloads !== null
            ? { index: live.index, value: formatDownloads(downloads) }
            : undefined
        }
      />
    </main>
  );
}