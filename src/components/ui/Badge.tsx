import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "gold"
    | "cyan"
    | "pink"
    | "orange"
    | "outline"
    | "success"
    | "destructive";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-stone-100 text-stone-700 border-stone-200",
    gold: "bg-amber-50/90 text-amber-900 border-amber-200/80 font-medium",
    cyan: "bg-sky-50 text-sky-900 border-sky-200/80 font-medium",
    pink: "bg-rose-50 text-rose-900 border-rose-200/80 font-medium",
    orange: "bg-orange-50 text-orange-900 border-orange-200/80 font-medium",
    outline: "text-stone-700 border-stone-200 bg-white shadow-xs",
    success: "bg-emerald-50 text-emerald-900 border-emerald-200/80 font-medium",
    destructive: "bg-rose-50 text-rose-800 border-rose-200/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
