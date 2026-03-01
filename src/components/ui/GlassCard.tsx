"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function GlassCard({ children, hover = true, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "0 0 30px rgba(0,255,157,0.1)" } : undefined}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-2xl",
        hover && "transition-colors hover:border-neon/15",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
