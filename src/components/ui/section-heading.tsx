import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  headingTag?: "h1" | "h2" | "h3" | "h4";
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const alignClasses = {
  left: "text-left items-start",
  center: "text-center items-center mx-auto",
  right: "text-right items-end ml-auto",
};

export function SectionHeading({
  eyebrow,
  heading,
  headingTag: HeadingTag = "h2",
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:gap-3",
        alignClasses[align],
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-accent-gold">
          {eyebrow}
        </span>
      )}
      <HeadingTag className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-main leading-tight">
        {heading}
      </HeadingTag>
      {description && (
        <p className="text-secondary text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal">
          {description}
        </p>
      )}
    </div>
  );
}
