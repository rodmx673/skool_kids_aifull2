
"use client"

import { cn } from "@/lib/utils"

export function ConnectionStatus() {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <div className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span
          className={cn(
            "relative inline-flex h-3 w-3 rounded-full",
            "bg-green-500"
          )}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
          Data Lake: Connected
      </span>
    </div>
  )
}
