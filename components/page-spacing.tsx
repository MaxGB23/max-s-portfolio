import { SectionSpacing } from "@/components/section-spacing";
import { PAGE_SPACER_CLASSES, type PageSpacerPair } from "@/lib/rhythm";

export function PageSpacing({ pair }: { pair: PageSpacerPair }) {
  const className = PAGE_SPACER_CLASSES[pair];
  if (!className) return <SectionSpacing />;
  return (
    <div className={className}>
      <SectionSpacing />
    </div>
  );
}