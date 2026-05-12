interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * App header with logo and title. Used in sidebar top.
 */
export function AppHeader({ title = 'MoviCol', subtitle = 'Motor de Predicción de Rutas' }: AppHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
        <span className="text-xl">🚌</span>
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <p className="text-xs text-default-400">{subtitle}</p>
      </div>
    </div>
  );
}
