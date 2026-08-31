const brandSlug: Record<string, string> = {
  React: "react.svg",
  TypeScript: "typescript.svg",
  "Next.js": "nextjs.svg",
  PostgreSQL: "postgres.svg",
  "Tailwind CSS": "tailwind.svg",
  Prisma: "prisma.svg",
  Vue: "vue.svg",
  "Vue 3": "vue.svg",
  Laravel: "laravel.svg",
  MySQL: "mysql.svg",
  PHP: "php.svg",
  Unity: "unity.svg",
  "C#": "csharp.svg",
  Blender: "blender.svg",
  "Node.js": "nodejs.svg",
  pnpm: "pnpm.svg",
  Vitest: "vitest.svg",
  esbuild: "esbuild.svg",
  "GitHub Actions": "github-actions.svg",
  "VS Code": "vscode.svg",
  JavaScript: "javascript.svg",
  Bootstrap: "bootstrap.svg",
  HTML5: "html5.svg",
  CSS3: "css3.svg",
  "Inertia.js": "inertia.svg",
  "ML-Agents": "ml-agents.svg",
}

interface StackIconProps {
  name: string
  className?: string
  labelClassName?: string
}

export function StackIcon({ name, className, labelClassName }: StackIconProps) {
  const brandFile = brandSlug[name]

  if (brandFile) {
    return (
      <img
        src={`/brands/${brandFile}`}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={className}
      />
    )
  }

  return (
    <span className={labelClassName ?? className} aria-hidden="true">
      {name.substring(0, 2)}
    </span>
  )
}