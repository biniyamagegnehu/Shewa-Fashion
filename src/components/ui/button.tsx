import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-xs active:scale-[0.99]",
  secondary:
    "bg-primary-light text-main hover:bg-[#D7E9F8] active:scale-[0.99]",
  outline:
    "border border-border bg-transparent text-main hover:border-primary hover:bg-primary-light/40 active:scale-[0.99]",
  ghost:
    "bg-transparent text-main hover:bg-primary-light/40 active:scale-[0.99]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm rounded-md gap-1.5",
  md: "min-h-[44px] px-5 py-2.5 text-sm sm:text-base rounded-md gap-2",
  lg: "min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 text-base rounded-lg gap-2.5",
};

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      href,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      className
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled}
        className={baseClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
