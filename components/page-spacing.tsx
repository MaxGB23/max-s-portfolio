import { SectionSpacing } from "@/components/section-spacing";
import { PAGE_SPACER_CLASSES, type PageSpacerPair } from "@/lib/rhythm";

export function PageSpacing({ pair, height }: { pair: PageSpacerPair; height?: string }) {
  const className = PAGE_SPACER_CLASSES[pair];
  if (!className) return <SectionSpacing height={height} />;
  return (
    <div className={className}>
      <SectionSpacing height={height} />
    </div>
  );
}