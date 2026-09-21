'use client';

import { useLanguage } from '@/contexts/language-context';
import type { Lang } from '@/data/translations';
import { cn } from '@/lib/utils';

const options = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
] as const satisfies ReadonlyArray<{ value: Lang; label: string }>;

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border px-1 py-0.5 text-xs font-medium">
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={cn(
            'rounded-full px-2 py-0.5 transition-colors duration-150',
            lang === value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={lang === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}