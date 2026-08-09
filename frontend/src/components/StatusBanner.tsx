import type { ReactNode } from "react";

type BannerVariant = "info" | "success" | "error" | "warning";

const variantClasses: Record<BannerVariant, string> = {
  info: "border-sky-500/40 bg-sky-500/10 text-sky-100",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  error: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-100",
};

interface StatusBannerProps {
  variant?: BannerVariant;
  children: ReactNode;
}

export function StatusBanner({
  variant = "info",
  children,
}: StatusBannerProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      {children}
    </div>
  );
}
