// frontend/src/components/ui/toaster.tsx
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: "border border-border bg-background text-foreground",
        duration: 5000,
      }}
    />
  );
}