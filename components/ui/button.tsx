import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        // Usa la variable --primary (Violeta)
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 shadow-primary/20",

        // Acciones de peligro usando --destructive
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 shadow-destructive/10",

        // Bordes sutiles que se adaptan al Dark Mode
        outline: "border border-border/60 bg-background/50 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm",

        // Color secundario (Slate/Gray suave)
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",

        // Ideal para botones dentro de tablas o menús
        ghost: "hover:bg-accent hover:text-accent-foreground",

        // Estilo minimalista para navegación
        link: "text-primary underline-offset-4 hover:underline",

        // Variante extra: Primary Ghost (púrpura suave sin fondo sólido)
        primary: "bg-primary/10 text-primary hover:bg-primary/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 rounded-md px-2 text-[10px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10 rounded-full", // Iconos circulares por defecto
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, asChild = false, ...props}, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({variant, size, className}))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export {Button, buttonVariants}
