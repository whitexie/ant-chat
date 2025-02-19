import { create } from 'zustand'

interface ThemeStore {
  theme: 'default' | 'dark'
  toggleTheme: (theme?: 'default' | 'dark') => void
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: 'default',
  toggleTheme: (theme) => {
    if (!theme) {
      document.documentElement.classList.toggle('dark', get().theme === 'default')
      set({ theme: get().theme === 'default' ? 'dark' : 'default' })
    }
    else {
      set({ theme })
    }
  },
}))
