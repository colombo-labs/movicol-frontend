import { type CSSProperties, type ReactNode } from "react";

interface GlassCardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Reusable glassmorphism card component.
 * Dark mode with backdrop blur, subtle borders, and transparency.
 */
export function GlassCard({ children, className = "", style }: GlassCardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
