import type { ArchitectureNode } from "@/data/projects";

/** Nodo hijo: tarjeta numerada + sub-rail de nietos (indicador de profundidad
    por borde izquierdo, no por iconos falsos). El grid lo pone el padre; aquí
    solo se renderizan las cards, con la clase de conector de la primera fila. */
function ArchitectureChildren({ nodes }: { nodes: ArchitectureNode[] }) {
  return (
    <>
      {nodes.map((child, index) => {
        const label = `0${index + 1}`.slice(-2);
        return (
          <div
            key={index}
            className="architecture-connector-child relative rounded-2xl border border-border/80 bg-card/80 p-5 hover:border-purple-accent/30 transition-colors duration-200"
          >
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-sm font-bold tabular-nums text-muted-foreground">
                {label}
              </span>
              <h4 className="font-semibold text-base text-foreground">
                {child.name}
              </h4>
            </div>
            {child.description && (
              <p className="text-sm text-content leading-relaxed mb-3">
                {child.description}
              </p>
            )}
            {child.children && child.children.length > 0 && (
              <ul className="mt-3 space-y-1.5 pl-2">
                {child.children.map((grandchild, grandIndex) => (
                  <li key={grandIndex} className="text-sm leading-relaxed">
                    <span className="text-foreground">
                      ● {grandchild.name}
                    </span>
                    {grandchild.description && (
                      <span className="block text-sm text-content">
                        {grandchild.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}

/** Vista "Grafo Arquitectura": árbol real extraído de docs/projects.
    Jerarquía top-down: la raíz es una hero card centrada que ancla la sección,
    un stem vertical la une a la línea bus horizontal y las cards hijas cuelgan
    de ella en grid (drop-lines solo en la primera fila, para que las líneas
    nunca crucen filas inferiores). Mobile (1 columna) ignora los conectores y
    queda como pila limpia. Sin status dots, sin versiones, sin porcentajes —
    solo datos documentados. */
export function ProjectArchitecture({ tree }: { tree: ArchitectureNode }) {
  return (
    <div className="rounded-3xl bg-black/40 dark:bg-card/30 backdrop-blur-md p-6 lg:p-10">
      {/* Nodo raíz — hero card centrada, ancla visual superior */}
      <div className="relative group max-w-md mx-auto pb-4">
        {/* Sub-header badge flotante arriba */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 max-w-[calc(100%-2rem)] truncate px-2.5 py-0.5 rounded bg-background border border-border/90 text-xs tracking-wider text-muted-foreground uppercase z-10">
          ROOT ENGINE
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 pt-7 text-center transition-all duration-300 group-hover:border-purple-accent/40">
          <h3 className="font-bold text-base tracking-wider uppercase text-foreground">
            {tree.name}
          </h3>

          {tree.description && (
            <p className="text-sm text-content leading-relaxed mt-3">
              {tree.description}
            </p>
          )}

          {tree.children && tree.children.length > 0 && (
            <div className="pt-4 border-t border-border/50 flex items-center justify-center text-sm">
              <span className="text-muted-foreground">
                {tree.children.length}{" "}
                {tree.children.length === 1
                  ? "módulo documentado"
                  : "módulos documentados"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stem: conecta la raíz con la línea bus del grid (solo sm+). */}
      <div className="hidden sm:block h-8 w-px bg-border/70 mx-auto" aria-hidden="true" />

      {tree.children && tree.children.length > 0 ? (
        <div className="relative">
          {/* Línea bus horizontal sobre la primera fila del grid */}
          <div className="hidden sm:block absolute top-0 left-4 right-4 h-px bg-border/70" aria-hidden="true" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-0 sm:pt-8">
            <ArchitectureChildren nodes={tree.children} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Raíz documentada sin módulos hijos todavía.
        </p>
      )}
    </div>
  );
}

/** Estado vacío honesto: sin topología documentada no se inventa nada. */
export function ArchitectureEmptyState() {
  return (
    <div className="rounded-3xl border border-border/80 bg-black/40 dark:bg-card/30 backdrop-blur-md p-6 lg:p-8">
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Arquitectura no documentada todavía
        </p>
        <p className="mt-2 text-sm text-content max-w-md mx-auto leading-relaxed">
          Este proyecto aún no tiene topología documentada en docs/projects. La
          vista mostrará el árbol real en cuanto exista — no se inventa data.
        </p>
      </div>
    </div>
  );
}