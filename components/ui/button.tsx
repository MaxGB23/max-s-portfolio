import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 text-sm 2xl:text-base font-semibold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-foreground text-background hover:opacity-80 transition-opacity duration-200',
        outline:
          'border border-border text-foreground hover:bg-purple-accent/5 hover:border-purple-accent/30 transition-colors duration-200',
        accent:
          'bg-purple-accent text-foreground hover:opacity-90 transition-opacity duration-200',
        inverted:
          'bg-foreground text-background hover:bg-purple-accent hover:text-white transition-colors duration-200',
        white:
          'bg-white text-purple-accent hover:opacity-80 transition-opacity duration-200',
      },
      shape: {
        rounded: 'rounded-xl',
        pill: 'rounded-full',
      },
      size: {
        sm: 'px-5 py-2',
        md: 'px-6 py-3',
        lg: 'h-12 px-6',
        compact: 'px-4 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      shape: 'rounded',
      size: 'md',
    },
  },
)

function Button({
  className,
  variant,
  shape,
  size,
  fullWidth = false,
  glow = false,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    fullWidth?: boolean
    glow?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, shape, size }),
        fullWidth && 'w-full',
        glow && 'shadow-sm shadow-purple-accent/60',
        className,
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }