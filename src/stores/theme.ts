import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>('auto')
  const systemPrefersDark = ref(false)

  // Computed
  const currentTheme = computed(() => {
    if (theme.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return theme.value
  })

  const isDark = computed(() => currentTheme.value === 'dark')

  // Initialize from localStorage
  const initTheme = () => {
    const stored = localStorage.getItem('theme')
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
      theme.value = stored as Theme
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches

    // Listen for system preference changes
    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })
  }

  // Actions
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('light')
    } else {
      // If auto, toggle to the opposite of current
      setTheme(isDark.value ? 'light' : 'dark')
    }
  }

  // Apply theme to document
  watch(currentTheme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })

  return {
    theme,
    currentTheme,
    isDark,
    initTheme,
    setTheme,
    toggleTheme
  }
})
