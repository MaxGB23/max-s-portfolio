import * as React from "react"

import { ReactIcon } from "./react-icon"
import { TypeScriptIcon } from "./typescript-icon"
import { NextJsIcon } from "./nextjs-icon"
import { PostgresIcon } from "./postgres-icon"
import { TailwindIcon } from "./tailwind-icon"
import { PrismaIcon } from "./prisma-icon"
import { VueJsIcon } from "./vuejs-icon"
import { LaravelIcon } from "./laravel-icon"
import { MySqlIcon } from "./mysql-icon"
import { PhpIcon } from "./php-icon"
import { UnityIcon } from "./unity-icon"
import { CSharpIcon } from "./csharp-icon"
import { BlenderIcon } from "./blender-icon"
import { NodeJsIcon } from "./nodejs-icon"
import { PnpmIcon } from "./pnpm-icon"
import { VitestIcon } from "./vitest-icon"
import { EsbuildIcon } from "./esbuild-icon"
import { GitHubActionsIcon } from "./github-actions-icon"
import { VsCodeIcon } from "./vscode-icon"
import { JavaScriptIcon } from "./javascript-icon"
import { BootstrapIcon } from "./bootstrap-icon"
import { Html5Icon } from "./html5-icon"
import { Css3Icon } from "./css3-icon"
import { InertiaIcon } from "./inertia-icon"
import { MlAgentsIcon } from "./ml-agents-icon"

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  React: ReactIcon,
  TypeScript: TypeScriptIcon,
  "Next.js": NextJsIcon,
  PostgreSQL: PostgresIcon,
  "Tailwind CSS": TailwindIcon,
  Prisma: PrismaIcon,
  Vue: VueJsIcon,
  "Vue 3": VueJsIcon,
  Laravel: LaravelIcon,
  MySQL: MySqlIcon,
  PHP: PhpIcon,
  Unity: UnityIcon,
  "C#": CSharpIcon,
  Blender: BlenderIcon,
  "Node.js": NodeJsIcon,
  pnpm: PnpmIcon,
  Vitest: VitestIcon,
  esbuild: EsbuildIcon,
  "GitHub Actions": GitHubActionsIcon,
  "VS Code": VsCodeIcon,
  JavaScript: JavaScriptIcon,
  Bootstrap: BootstrapIcon,
  HTML5: Html5Icon,
  CSS3: Css3Icon,
  "Inertia.js": InertiaIcon,
  "ML-Agents": MlAgentsIcon,
}

const brandSlug: Record<string, string> = {
  React: "react.svg",
  TypeScript: "typescript.svg",
  Prisma: "prisma.svg",
  Vue: "vue.svg",
  "Vue 3": "vue.svg",
  Laravel: "laravel.svg",
  "C#": "csharp.svg",
  "Node.js": "nodejs.svg",
  pnpm: "pnpm.svg",
  Vitest: "vitest.svg",
  "GitHub Actions": "github-actions.svg",
  Bootstrap: "bootstrap.svg",
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

  const Icon = iconMap[name]

  if (Icon) {
    return <Icon className={className} />
  }

  return (
    <span className={labelClassName ?? className} aria-hidden="true">
      {name.substring(0, 2)}
    </span>
  )
}