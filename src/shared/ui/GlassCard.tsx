import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable glassmorphism card component.
 * Dark mode with backdrop blur, subtle borders, and transparency.
 */
export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 ${className}`}
    >
      {children}
    </div>
  );
}
