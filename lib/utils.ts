import { clsx, type ClassValue } from 'clsx'
import { twMerge, extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge that the custom fluid font-size utilities
// (--text-fluid-* tokens in globals.css) are font-size classes, so they are
// not dropped as a conflict with text color utilities (e.g. text-foreground).
const twMergeFluid = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'fluid-display',
            'fluid-detail',
            'fluid-section',
            'fluid-featured',
            'fluid-price',
            'fluid-card',
            'fluid-subheading',
            'fluid-body',
            'fluid-card-body',
            'fluid-eyebrow',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMergeFluid(clsx(inputs))
}
