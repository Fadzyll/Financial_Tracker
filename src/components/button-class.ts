import clsx from "clsx";

// Plain function (no "use client") so server components can use it too.
const buttonStyles = {
  primary: "bg-brand text-on-brand hover:bg-brand-strong",
  secondary: "border border-border bg-surface text-text hover:bg-surface-2",
  danger: "border border-danger/40 bg-danger-soft text-danger hover:border-danger",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
};

export type Variant = keyof typeof buttonStyles;

export function buttonClass(variant: Variant = "primary", className?: string) {
  return clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60",
    buttonStyles[variant],
    className,
  );
}
