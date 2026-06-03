import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-white/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-white bg-white text-black shadow-sm shadow-black/20 hover:bg-white/90 focus-visible:border-white/70",
        secondary:
          "border-white/10 bg-white/[0.06] text-white hover:border-white/15 hover:bg-white/[0.1] aria-expanded:border-white/15 aria-expanded:bg-white/[0.1]",
        outline:
          "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white aria-expanded:border-white/20 aria-expanded:bg-white/[0.06]",
        ghost:
          "border-transparent bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white aria-expanded:bg-white/[0.06] aria-expanded:text-white",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-200 focus-visible:ring-red-500/20",
        link:
          "h-auto rounded-none border-transparent bg-transparent p-0 text-slate-300 underline-offset-4 hover:text-white hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xl: "h-11 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-9 p-0",
        "icon-xs":
          "size-7 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
