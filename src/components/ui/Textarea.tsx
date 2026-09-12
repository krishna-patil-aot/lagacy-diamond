import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[96px] w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 shadow-xs transition-colors",
            "focus-visible:outline-none focus-visible:border-amber-600 focus-visible:ring-1 focus-visible:ring-amber-600",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-rose-400 focus-visible:ring-rose-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
