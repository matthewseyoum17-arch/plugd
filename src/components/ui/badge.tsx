import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-[#ffffff]/10 text-[#ffffff]":
            variant === "default",
          "border-transparent bg-white/[0.06] text-gray-300":
            variant === "secondary",
          "border-white/[0.1] text-gray-400": variant === "outline",
          "border-transparent bg-green-900/50 text-green-300":
            variant === "success",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
