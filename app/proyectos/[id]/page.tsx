import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { projects, getProjectById, localizeProject } from "@/data/projects";
import { formatDownloads, getOpenVsxDownloads } from "@/lib/live-metrics";
import { ProjectDetail } from "@/components/project-detail";
import { ScrollProgress } from "@/components/scroll-progress";
import { translations, type Lang } from "@/data/translations";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  // Server-side language resolution (no hook available here): the cookie is
  // the same source the layout uses, so metadata matches the UI language.
  const store = await cookies();
  const lang: Lang = store.get("lang")?.value === "en" ? "en" : "es";

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
    title: `${localized.title} | MaxGB23`,
    description: localized.hook,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  // Una metrica puede venir de un registry: solo se consulta si el proyecto la
  // declara. La respuesta se cachea 24 h y, si la API no responde, la ficha usa
  // la cifra escrita en `data/projects` como respaldo.
  const source = project.liveMetric;
  const downloads = source && source.kind === "openvsx" ? await getOpenVsxDownloads(source.url) : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <ProjectDetail
        project={project}
        liveMetric={
          source && downloads !== null
            ? { index: source.index, value: formatDownloads(downloads) }
            : undefined
        }
      />
    </main>
  );
}