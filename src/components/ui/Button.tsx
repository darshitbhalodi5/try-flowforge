import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "delete";
  border?: boolean;
  borderColor?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, disabled, loading, children, variant = "default", border = false, borderColor, style, ...props }, ref) => {
    const isDelete = variant === "delete";
    const hasCustomBorderColor = border && borderColor != null;

    return (
      <button
        className={cn(
          "cursor-pointer group relative px-6 h-12.5 overflow-hidden rounded-full flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          border && "border-2",
          !hasCustomBorderColor && isDelete && border && "border-red-500 bg-card hover:bg-red-500/10",
          hasCustomBorderColor && "bg-transparent",
          className
        )}
        style={hasCustomBorderColor ? { ...style, borderColor } : style}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Gradient Background */}
        {!isDelete && !hasCustomBorderColor && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #f97316 0%, #fb923c 50%, #f97316 100%)",
            }}
          />
        )}

        {isDelete && !border && (
          <>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)",
              }}
            />
          </>
        )}

        {/* Content with hover effect */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 overflow-hidden h-full",
            border && isDelete && !hasCustomBorderColor && "text-red-500",
            !border && "text-white",
            !isDelete && border && !hasCustomBorderColor && "text-white"
          )}
          style={hasCustomBorderColor ? { color: borderColor } : undefined}
        >
          {/* Original text - slides down on hover */}
          <div className="flex items-center gap-2 transition-transform duration-300 ease-in-out group-hover:translate-y-12.5">
            {children}
          </div>
          {/* Duplicate text - starts above (hidden) and slides down on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 ease-in-out -translate-y-12.5 group-hover:translate-y-0">
            {children}
          </div>
        </div>
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
