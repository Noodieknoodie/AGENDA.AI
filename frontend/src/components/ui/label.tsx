// frontend/src/components/ui/label.tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef(
  function Label(
    props: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>, 
    ref: React.ForwardedRef<React.ElementRef<typeof LabelPrimitive.Root>>
  ) { 
    return (
      <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), props.className)}
        {...props}
      />
    )
  }
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }