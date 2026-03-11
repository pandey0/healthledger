import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-px",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-slate-200 bg-white shadow-xs hover:bg-slate-50 hover:border-slate-300 text-slate-700",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200",
        ghost:
          "hover:bg-slate-100 hover:text-slate-800 text-slate-600",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        xs: "h-7 gap-1 rounded-[10px] px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-[12px] gap-1.5 px-4",
        lg: "h-12 rounded-[16px] px-7 text-[15px]",
        xl: "h-14 rounded-[18px] px-8 text-[16px]",
        icon: "size-10 rounded-[12px]",
        "icon-xs": "size-7 rounded-[10px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-[12px]",
        "icon-lg": "size-12 rounded-[14px]",
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
