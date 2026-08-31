import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProjectById } from "@/data/projects";
import { ProjectDetail } from "@/components/project-detail";
import { ScrollProgress } from "@/components/scroll-progress";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  return {
    title: `${project.title} | MaxGB23`,
    description: project.hook,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <ProjectDetail project={project} />
    </main>
  );
}