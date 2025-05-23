// frontend/src/components/ui/toast.tsx
import * as React from "react"
import { createRoot } from "react-dom/client"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = React.forwardRef(
  function ToastProvider(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    const { className, ...restProps } = props
    
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
          className
        )}
        {...restProps}
      />
    )
  }
)
ToastProvider.displayName = "ToastProvider"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(
  function Toast(
    props: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    const { className, variant, ...restProps } = props
    
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...restProps}
      />
    )
  }
)
Toast.displayName = "Toast"

const ToastClose = React.forwardRef(
  function ToastClose(
    props: React.ButtonHTMLAttributes<HTMLButtonElement>,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) {
    const { className, ...restProps } = props
    
    return (
      <button
        ref={ref}
        className={cn(
          "absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
          className
        )}
        toast-close=""
        {...restProps}
      >
        <X className="h-4 w-4" />
      </button>
    )
  }
)
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef(
  function ToastTitle(
    props: React.HTMLAttributes<HTMLHeadingElement>,
    ref: React.ForwardedRef<HTMLHeadingElement>
  ) {
    const { className, ...restProps } = props
    
    return (
      <div
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...restProps}
      />
    )
  }
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef(
  function ToastDescription(
    props: React.HTMLAttributes<HTMLParagraphElement>,
    ref: React.ForwardedRef<HTMLParagraphElement>
  ) {
    const { className, ...restProps } = props
    
    return (
      <div
        ref={ref}
        className={cn("text-sm opacity-90", className)}
        {...restProps}
      />
    )
  }
)
ToastDescription.displayName = "ToastDescription"

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

let toastId = 0;

function toast({ title, description, variant = "default" }: ToastProps) {
  const id = `toast-${toastId++}`;
  const toastElement = document.createElement("div");
  toastElement.id = id;

  const toastContent = (
    <Toast variant={variant}>
      {title && <ToastTitle>{title}</ToastTitle>}
      {description && <ToastDescription>{description}</ToastDescription>}
      <ToastClose onClick={() => {
        document.getElementById(id)?.remove();
      }} />
    </Toast>
  );

  const toastContainer = document.querySelector("[data-toast-container]");
  if (!toastContainer) {
    const newContainer = document.createElement("div");
    newContainer.setAttribute("data-toast-container", "");
    newContainer.className = "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";
    document.body.appendChild(newContainer);

    const root = createRoot(toastElement);
    root.render(toastContent);
    newContainer.appendChild(toastElement);
  } else {
    const root = createRoot(toastElement);
    root.render(toastContent);
    toastContainer.appendChild(toastElement);
  }

  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      element.style.opacity = "0";
      setTimeout(() => {
        element.remove();
      }, 300);
    }
  }, 5000);

  return {
    id,
    dismiss: () => {
      document.getElementById(id)?.remove();
    }
  };
}

type ToasterProps = React.ComponentPropsWithoutRef<typeof ToastProvider>

function Toaster({ ...props }: ToasterProps) {
  return (
    <ToastProvider data-toast-container="" {...props} />
  )
}

export {
  type ToastProps,
  Toaster,
  toast,
}