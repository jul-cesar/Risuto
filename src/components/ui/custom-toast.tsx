"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface CustomToastProps {
  message: string
  actionLabel: string
  actionCallback: () => void
  variant?: "success" | "error" | "warning"
}

export function showCustomToast({
  message,
  actionLabel,
  actionCallback,
  variant = "success",
}: CustomToastProps) {
  const toastFn =
    variant === "success"
      ? toast.success
      : variant === "error"
      ? toast.error
      : toast.warning

  const id = toastFn(
    <div className="flex flex-col gap-2">
      <p>{message}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          actionCallback()
          toast.dismiss(id)
        }}
      >
        {actionLabel}
      </Button>
    </div>
  )
}