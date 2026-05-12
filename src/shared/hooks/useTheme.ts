import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
}

export const useTheme = create<ThemeStore>((set) => {
  const initial = (localStorage.getItem('theme') as Theme) || 'dark';
  document.documentElement.classList.add(initial);
  document.documentElement.style.colorScheme = initial;

  return {
    theme: initial,
    toggle: () =>
      set((state) => {
        const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(next);
        document.documentElement.style.colorScheme = next;
        localStorage.setItem('theme', next);
        return { theme: next };
      }),
  };
});
