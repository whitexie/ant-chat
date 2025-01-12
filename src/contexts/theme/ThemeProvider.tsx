import { useState } from 'react'
import { ThemeContext, ThemeContextDispatch } from './themeContext'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, updateTheme] = useState<'default' | 'dark'>('default')

  function toggleTheme() {
    updateTheme(theme === 'default' ? 'dark' : 'default')
  }

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeContextDispatch.Provider value={toggleTheme}>
        {children}
      </ThemeContextDispatch.Provider>
    </ThemeContext.Provider>
  )
}
