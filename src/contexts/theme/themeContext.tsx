import { createContext, useContext } from 'react'

export const ThemeContext = createContext<('default' | 'dark') | null>(null)
export const ThemeContextDispatch = createContext<(() => void) | null>(null)

export function useTheme() {
  const theme = useContext(ThemeContext)!
  const toggleTheme = useContext(ThemeContextDispatch)
  return [theme, toggleTheme] as const
}
