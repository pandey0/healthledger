import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-slate-100 text-slate-500 [a&]:hover:bg-slate-200",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 [a&]:hover:bg-destructive/20",
        outline:
          "border-slate-200 text-slate-600 [a&]:hover:bg-slate-50",
        success:
          "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        warning:
          "bg-amber-50 text-amber-700 border-amber-200/60",
        danger:
          "bg-red-50 text-red-700 border-red-200/60",
        ghost:
          "[a&]:hover:bg-slate-100 [a&]:hover:text-slate-800",
        link:
          "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
