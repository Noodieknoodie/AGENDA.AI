// frontend/src/components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(
  function Card(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          props.className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef(
  function CardHeader(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", props.className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(
  function CardTitle(
    props: React.HTMLAttributes<HTMLHeadingElement>,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ) {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight",
          props.className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(
  function CardDescription(
    props: React.HTMLAttributes<HTMLParagraphElement>,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ) {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", props.className)}
        {...props}
      />
    )
  }
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(
  function CardContent(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div ref={ref} className={cn("p-6 pt-0", props.className)} {...props} />
    )
  }
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(
  function CardFooter(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", props.className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }