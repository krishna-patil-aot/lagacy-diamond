import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "luxury"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variants = {
      default:
        "bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-sm border border-stone-900",
      luxury:
        "bg-stone-900 text-white hover:bg-stone-800 shadow-sm border border-stone-800 hover:shadow",
      secondary:
        "bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200/80",
      outline:
        "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300 shadow-sm",
      ghost:
        "bg-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/80",
      danger:
        "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
      glass:
        "backdrop-blur-md bg-white/80 text-stone-800 border border-stone-200 hover:bg-white shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2 h-9 sm:h-10 gap-2",
      lg: "text-sm sm:text-base px-6 py-2.5 h-11 sm:h-12 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
